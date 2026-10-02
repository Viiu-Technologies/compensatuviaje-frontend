import React, { useEffect, useState } from 'react';
import { Download, FileText, RefreshCw, ShieldCheck } from 'lucide-react';
import { getMyCertificates, type B2BCertificate } from '../../services/certificatesService';
import {
  Badge,
  btn,
  Card,
  cx,
  EmptyState,
  ErrorState,
  fmtCLP,
  fmtDate,
  fmtInt,
  fmtNum,
  fmtTons,
  PageHeader,
  projectTypeLabel,
  Skeleton,
  StatCard,
  type Tone,
} from '../../ui';

// Antes todas las tarjetas decían "EMITIDO", también los borradores y los revocados.
const STATUS: Record<B2BCertificate['status'], { label: string; tone: Tone }> = {
  issued: { label: 'Emitido', tone: 'success' },
  draft: { label: 'En preparación', tone: 'warning' },
  revoked: { label: 'Revocado', tone: 'danger' },
};

const CertificatesView: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [certificates, setCertificates] = useState<B2BCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await getMyCertificates();
      setCertificates(data.certificates);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const valid = certificates.filter((c) => c.status !== 'revoked');
  const tons = valid.reduce((acc, c) => acc + (Number(c.tonsCompensated) || 0), 0);
  const invested = valid.reduce((acc, c) => acc + (Number(c.totalAmountClp) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificados"
        subtitle="Certificados de compensación emitidos a tu empresa."
        actions={
          <button type="button" onClick={load} disabled={loading} className={btn.secondary}>
            <RefreshCw className={cx('w-4 h-4', loading && 'animate-spin')} aria-hidden="true" />
            Actualizar
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : failed ? (
        <ErrorState title="No pudimos cargar tus certificados" onRetry={load} />
      ) : certificates.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShieldCheck}
            title="Aún no tienes certificados"
            text="Se emiten automáticamente cuando aprobamos una orden de compensación."
            action={
              onNavigate ? (
                <button type="button" className={btn.primary} onClick={() => onNavigate('proyectos')}>
                  Compensar ahora
                </button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Certificados" icon={ShieldCheck} value={fmtInt(valid.length)} />
            <StatCard label="Toneladas compensadas" value={fmtTons(tons)} tone="good" />
            <StatCard label="Inversión" value={fmtCLP(invested)} />
          </div>

          <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {certificates.map((cert) => {
              const st = STATUS[cert.status] ?? { label: cert.status, tone: 'neutral' as Tone };
              return (
                <li key={cert.id}>
                  <Card className="p-0 h-full flex flex-col" as="article">
                    <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                      <div className="flex items-center justify-between gap-3">
                        <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                        </span>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </div>
                      <p className="m-0 mt-3 text-base font-semibold text-gray-900 tabular-nums">{cert.number}</p>
                      <p className="m-0 text-xs text-gray-500">Certificado de compensación</p>
                    </div>

                    <div className="px-5 py-4 flex-1 space-y-4">
                      <p className="m-0">
                        <span className="text-3xl font-bold text-brand-700 tabular-nums">{fmtNum(cert.tonsCompensated, 2)}</span>
                        <span className="ml-1.5 text-sm text-gray-500">t de CO₂ compensadas</span>
                      </p>
                      <div>
                        <p className="m-0 text-sm font-medium text-gray-900">{cert.project?.name || 'Proyecto'}</p>
                        <p className="m-0 text-xs text-gray-500">
                          {[cert.project?.type && projectTypeLabel(cert.project.type), cert.project?.country].filter(Boolean).join(' · ')}
                        </p>
                        {cert.projects?.length > 1 && (
                          <p className="m-0 mt-1 text-xs text-gray-500">y {cert.projects.length - 1} proyecto(s) más</p>
                        )}
                      </div>
                      <dl className="m-0 space-y-1.5 text-sm">
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-500">Emitido</dt>
                          <dd className="m-0 text-gray-900">{fmtDate(cert.issuedAt || cert.createdAt)}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-500">Inversión</dt>
                          <dd className="m-0 font-semibold text-gray-900 tabular-nums">{fmtCLP(cert.totalAmountClp)}</dd>
                        </div>
                        {cert.scope && (
                          <div className="flex justify-between gap-3">
                            <dt className="text-gray-500">Alcance</dt>
                            <dd className="m-0 text-gray-900 text-right">{cert.scope}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div className="px-5 pb-5">
                      {cert.pdfUrl ? (
                        <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer" className={cx(btn.primary, 'w-full')}>
                          <Download className="w-4 h-4" aria-hidden="true" />
                          Descargar PDF
                        </a>
                      ) : (
                        <p className="m-0 flex items-center justify-center gap-2 rounded-full bg-gray-100 py-2.5 text-sm text-gray-500">
                          <FileText className="w-4 h-4" aria-hidden="true" />
                          {cert.status === 'revoked' ? 'Sin PDF' : 'Estamos generando el PDF'}
                        </p>
                      )}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default CertificatesView;
