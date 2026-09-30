import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCertificate, FaDownload, FaShare, FaCheckCircle, FaLeaf, FaCubes, FaClock, FaPlane } from 'react-icons/fa';
import B2CLayout from '../components/B2CLayout';
import b2cApi, { type B2CCertificate } from '../services/b2cApi';
import { MintNFTModal } from '../../../shared/components/blockchain';
import { downloadCertificatePDF } from '../utils/CertificatePDF';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import { toast } from 'sonner';
import {
  Badge, Card, Dialog, EmptyState, ErrorState, Skeleton, StatCard, btn, cx, fmtDate, fmtInt, fmtNum,
} from '../ui';

/**
 * Certificados de compensación del usuario.
 *
 * co2Compensated llega en toneladas (tonsCompensated del certificado).
 * Antes cada tarjeta mostraba "Árboles plantados" y "Litros de agua"
 * calculados aquí (×50 y ×5.000): no eran árboles plantados y no hay una
 * relación entre CO₂ y agua que respalde la cifra. Ahora se muestran las
 * unidades que el certificado realmente financió (unitsFinanced) y la
 * equivalencia en árboles se rotula como tal.
 */

const TREES_PER_TON_YEAR = 50; // ~20 kg de CO₂ por árbol y año

const statusBadge = (status: string) =>
  status === 'verified' ? (
    <Badge tone="success" icon={FaCheckCircle}>Emitido</Badge>
  ) : status === 'pending' ? (
    <Badge tone="warning" icon={FaClock}>En proceso</Badge>
  ) : (
    <Badge tone="neutral">{status}</Badge>
  );

const unitsText = (cert: B2CCertificate) =>
  cert.unitsFinanced ? `Financió ${fmtInt(cert.unitsFinanced)} ${cert.impactUnit || 'unidades de impacto'}` : null;

const B2CCertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<B2CCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<B2CCertificate | null>(null);
  const [mintCert, setMintCert] = useState<B2CCertificate | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await b2cApi.getCertificates();
        setCertificates(data.certificates || []);
      } catch (err: any) {
        console.error('Error fetching certificates:', err);
        setError(getErrorMessage(err, 'No pudimos cargar tus certificados. Vuelve a intentarlo en unos momentos.'));
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [reloadKey]);

  const totalTons = certificates.reduce((sum, cert) => sum + cert.co2Compensated, 0);
  const onChain = certificates.filter((c) => c.nftTxHash).length;

  const handleDownload = async (cert: B2CCertificate) => {
    const [origin, destination] = (cert.flightRoute || '').split('→').map((s) => s.trim());
    await downloadCertificatePDF({
      certificateNumber: cert.certificateNumber || cert.id,
      userName: user?.nombre || user?.email?.split('@')[0] || 'Usuario',
      userEmail: user?.email,
      co2Tons: cert.co2Compensated,
      co2Kg: cert.co2Compensated * 1000,
      origin: origin || '',
      destination: destination || '',
      date: cert.date,
      projectName: cert.project,
      treesEquiv: cert.equivalencies?.trees || Math.round(cert.co2Compensated * TREES_PER_TON_YEAR),
      carKmAvoided: Math.round(cert.co2Compensated * 4000),
      waterLiters: cert.equivalencies?.water || Math.round(cert.co2Compensated * 5000),
      nftTxHash: cert.nftTxHash,
      // Doble métrica: leídas de la BD, sin recalcular
      unitsFinanced: cert.unitsFinanced ?? null,
      impactUnit: cert.impactUnit ?? null,
    });
  };

  const handleShare = async (cert: B2CCertificate) => {
    const text = `Compensé ${fmtNum(cert.co2Compensated, 2)} t de CO₂e de mi viaje con el proyecto ${cert.project}. #CompensaTuViaje`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Certificado de compensación', text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Texto copiado. Pégalo donde quieras compartirlo.');
      }
    } catch {
      // El usuario cerró el diálogo de compartir: no es un error.
    }
  };

  const layout = (content: React.ReactNode) => (
    <B2CLayout title="Certificados" subtitle="Los certificados de cada compensación que hiciste">
      {content}
    </B2CLayout>
  );

  if (loading) {
    return layout(
      <div className="space-y-6" aria-busy="true">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-64" />)}</div>
      </div>,
    );
  }

  if (error) {
    return layout(<ErrorState title="No pudimos cargar tus certificados" text={error} onRetry={() => setReloadKey((k) => k + 1)} />);
  }

  return layout(
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="CO₂ compensado"
          value={fmtNum(totalTons, 2)}
          unit="t"
          icon={FaLeaf}
          tone="good"
          hint={totalTons > 0 ? `Equivale a lo que absorben unos ${fmtInt(totalTons * TREES_PER_TON_YEAR)} árboles en un año.` : undefined}
        />
        <StatCard label="Certificados" value={fmtInt(certificates.length)} icon={FaCertificate} />
        <StatCard
          label="Registrados en blockchain"
          value={fmtInt(onChain)}
          icon={FaCubes}
          hint="Registro público e inalterable"
        />
      </div>

      {certificates.length === 0 ? (
        <Card>
          <EmptyState
            icon={FaCertificate}
            title="Aún no tienes certificados"
            text="Cuando compenses un viaje, aquí aparecerá su certificado para descargar o compartir."
            action={<Link to="/b2c/calculator" className={btn.primary}><FaLeaf aria-hidden="true" /> Compensar un viaje</Link>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {certificates.map((cert) => {
            const units = unitsText(cert);
            return (
              <Card key={cert.id} as="article" className="p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Certificado</div>
                    <div className="font-mono text-sm text-gray-800 truncate">{cert.certificateNumber || cert.id.slice(0, 8)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {statusBadge(cert.status)}
                    {cert.nftTxHash && <Badge tone="chain" icon={FaCubes}>NFT</Badge>}
                  </div>
                </div>

                <div className="mt-4 text-3xl font-bold text-gray-900 tabular-nums">
                  {fmtNum(cert.co2Compensated, 2)} <span className="text-sm font-semibold text-gray-500">t CO₂e</span>
                </div>
                {units && <div className="mt-1 text-sm text-brand-700 font-medium">{units}</div>}

                <dl className="mt-4 space-y-1.5 text-sm m-0">
                  <div className="flex gap-2"><dt className="text-gray-500 w-20 flex-shrink-0">Proyecto</dt><dd className="m-0 text-gray-800">{cert.project}</dd></div>
                  {cert.flightRoute && (
                    <div className="flex gap-2"><dt className="text-gray-500 w-20 flex-shrink-0">Vuelo</dt><dd className="m-0 text-gray-800">{cert.flightRoute}</dd></div>
                  )}
                  <div className="flex gap-2"><dt className="text-gray-500 w-20 flex-shrink-0">Fecha</dt><dd className="m-0 text-gray-800">{fmtDate(cert.date, 'long')}</dd></div>
                </dl>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                  <button type="button" onClick={() => handleDownload(cert)} className={cx(btn.primary, btn.sm)}>
                    <FaDownload aria-hidden="true" /> Descargar PDF
                  </button>
                  <button type="button" onClick={() => setSelected(cert)} className={cx(btn.secondary, btn.sm)}>
                    Ver detalle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(cert)}
                    className={cx(btn.icon, 'ml-auto')}
                    title="Compartir"
                    aria-label={`Compartir certificado ${cert.certificateNumber}`}
                  >
                    <FaShare aria-hidden="true" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!selected}
        title="Certificado de compensación"
        onClose={() => setSelected(null)}
        size="lg"
        footer={
          selected && (
            <>
              {!selected.nftTxHash && (
                <button type="button" className={btn.secondary} onClick={() => { setMintCert(selected); setSelected(null); }}>
                  <FaCubes aria-hidden="true" /> Registrar como NFT
                </button>
              )}
              <button type="button" className={btn.secondary} onClick={() => handleShare(selected)}>
                <FaShare aria-hidden="true" /> Compartir
              </button>
              <button type="button" className={btn.primary} onClick={() => handleDownload(selected)}>
                <FaDownload aria-hidden="true" /> Descargar PDF
              </button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="font-mono text-gray-800">{selected.certificateNumber || selected.id.slice(0, 8)}</span>
              {statusBadge(selected.status)}
            </div>
            <div className="rounded-xl bg-brand-50 border border-brand-100 p-5">
              <div className="text-4xl font-bold text-brand-800 tabular-nums">
                {fmtNum(selected.co2Compensated, 2)} <span className="text-base font-semibold">t CO₂e</span>
              </div>
              <div className="mt-1 text-sm text-brand-800">
                {unitsText(selected) ?? 'compensadas'}
              </div>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 m-0">
              <div><dt className="text-gray-500">Proyecto</dt><dd className="m-0 font-medium text-gray-900">{selected.project}</dd></div>
              <div><dt className="text-gray-500">Fecha de emisión</dt><dd className="m-0 font-medium text-gray-900">{fmtDate(selected.date, 'long')}</dd></div>
              {selected.flightRoute && (
                <div><dt className="text-gray-500">Vuelo</dt><dd className="m-0 font-medium text-gray-900 flex items-center gap-2"><FaPlane className="text-gray-400" aria-hidden="true" />{selected.flightRoute}</dd></div>
              )}
              <div>
                <dt className="text-gray-500">Equivalencia</dt>
                <dd className="m-0 font-medium text-gray-900">
                  Lo que absorben unos {fmtInt(selected.co2Compensated * TREES_PER_TON_YEAR)} árboles en un año
                </dd>
              </div>
            </dl>
            {selected.nftTxHash && (
              <div className="rounded-xl border border-brand-900/15 bg-brand-900/5 p-4">
                <div className="font-semibold text-brand-900">Registrado en blockchain</div>
                <div className="mt-1 font-mono text-xs text-gray-600 break-all">Transacción: {selected.nftTxHash}</div>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {mintCert && (
        <MintNFTModal
          isOpen={!!mintCert}
          onClose={() => setMintCert(null)}
          compensationId={mintCert.id}
          compensationData={{
            co2Amount: mintCert.co2Compensated * 1000, // toneladas a kg
            projectName: mintCert.project || 'Proyecto ESG',
            travelType: 'flight',
          }}
          onSuccess={() => {
            setMintCert(null);
            b2cApi.getCertificates().then((data) => setCertificates(data.certificates || []));
          }}
        />
      )}
    </div>,
  );
};

export default B2CCertificatesPage;
