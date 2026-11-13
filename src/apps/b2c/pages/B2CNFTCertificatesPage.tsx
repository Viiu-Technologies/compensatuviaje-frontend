/**
 * Certificados NFT del usuario (registro en Polygon).
 *
 * Los NFT se listan desde la cuenta del usuario, sin necesidad de billetera.
 * Quedan en custodia de la plataforma y el usuario puede reclamarlos a su
 * propia billetera cuando quiera.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import B2CLayout from '../components/B2CLayout';
import * as b2cApi from '../services/b2cApi';
import type { B2CCertificate } from '../services/b2cApi';
import { claimNFTCertificate } from '../../../shared/services/blockchainApi';
import walletService from '../../../shared/services/walletService';
import { ACTIVE_CHAIN, CHAIN_CONFIGS } from '../../../types/blockchain.types';
import { FaCubes, FaLeaf, FaSearch, FaSyncAlt, FaInfoCircle, FaExternalLinkAlt, FaShieldAlt, FaWallet, FaCheckCircle } from 'react-icons/fa';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import { Card, CardHeader, EmptyState, ErrorState, Skeleton, StatCard, btn, fmtInt, fmtKgAuto } from '../ui';

const hasBlockExplorer = Boolean(CHAIN_CONFIGS[ACTIVE_CHAIN].blockExplorer);

const B2CNFTCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<B2CCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<{ id: string; message: string } | null>(null);
  const [claimedId, setClaimedId] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await b2cApi.getCertificates();
      setCertificates((data.certificates || []).filter((c) => !!c.nftTokenId));
    } catch (err: any) {
      setError(getErrorMessage(err, 'No se pudieron cargar los certificados.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleClaim = async (cert: B2CCertificate) => {
    setClaimError(null);
    setClaimedId(null);
    if (!walletService.isMetaMaskInstalled()) {
      setClaimError({
        id: cert.id,
        message:
          'Necesitas MetaMask para reclamar este NFT. No te preocupes: sigue seguro en custodia de CompensaTuViaje y puedes reclamarlo más adelante.',
      });
      return;
    }
    setClaimingId(cert.id);
    try {
      const address = await walletService.connect();
      await claimNFTCertificate({ compensationId: cert.id, walletAddress: address });
      await fetchCertificates();
      setClaimedId(cert.id);
    } catch (err: any) {
      setClaimError({ id: cert.id, message: getErrorMessage(err, 'No se pudo reclamar el NFT. Inténtalo nuevamente.') });
    } finally {
      setClaimingId(null);
    }
  };

  const totalKg = certificates.reduce((sum, c) => sum + Number(c.co2Compensated || 0) * 1000, 0);
  const q = search.trim().toLowerCase();
  const filtered = certificates.filter(
    (c) =>
      !q ||
      (c.nftTokenId || '').toLowerCase().includes(q) ||
      (c.project || '').toLowerCase().includes(q) ||
      (c.certificateNumber || '').toLowerCase().includes(q),
  );

  return (
    <B2CLayout title="Certificados NFT" subtitle="Tus compensaciones registradas en la red Polygon">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard label="NFT" value={fmtInt(certificates.length)} icon={FaCubes} />
          <StatCard label="CO₂e registrado" value={fmtKgAuto(totalKg)} icon={FaLeaf} tone="good" />
        </div>

        <Card className="p-0 overflow-hidden">
          <CardHeader
            className="px-6 pt-6 pb-5 border-b border-gray-100"
            title="Tus NFT"
            action={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" aria-hidden="true" />
                  <input
                    type="search"
                    aria-label="Buscar NFT"
                    placeholder="Buscar por token o proyecto"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-56 pl-9 pr-3 py-2 rounded-full border border-gray-300 text-sm bg-white outline-none focus:border-brand-700"
                  />
                </div>
                <button type="button" onClick={fetchCertificates} disabled={loading} className={btn.icon} aria-label="Actualizar" title="Actualizar">
                  <FaSyncAlt className={loading ? 'animate-spin' : ''} aria-hidden="true" />
                </button>
              </div>
            }
          />
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500 flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 m-0">
              <FaInfoCircle className="mt-0.5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <span>
                Tus NFT quedan en custodia de CompensaTuViaje y no necesitas billetera para verlos. Si quieres, puedes reclamarlos a tu propia billetera.
              </span>
            </p>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-64" />)}</div>
            ) : error ? (
              <ErrorState title="No pudimos leer tus NFT" text={error} onRetry={fetchCertificates} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={FaCubes}
                title={q ? 'Sin resultados' : 'Aún no tienes NFT'}
                text={q ? 'Prueba con otro término.' : 'Crea un NFT desde cualquiera de tus certificados.'}
                action={!q ? <Link to="/b2c/certificates" className={btn.primary}>Ir a Certificados</Link> : undefined}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((cert) => {
                  const custodied = cert.nftCustodyStatus === 'custodied';
                  const claimed = cert.nftCustodyStatus === 'claimed';
                  return (
                    <div key={cert.id} className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-sm text-gray-900">Token #{cert.nftTokenId}</span>
                        {custodied && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-900/5 text-brand-900 text-xs font-medium px-2.5 py-1">
                            <FaShieldAlt aria-hidden="true" /> Custodiado por CompensaTuViaje
                          </span>
                        )}
                        {claimed && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1">
                            <FaWallet aria-hidden="true" /> En tu billetera
                          </span>
                        )}
                      </div>
                      <dl className="text-sm space-y-1 m-0">
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-500">Proyecto</dt>
                          <dd className="m-0 text-gray-900 text-right">{cert.project}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-gray-500">CO₂e</dt>
                          <dd className="m-0 text-gray-900">{fmtKgAuto(Number(cert.co2Compensated || 0) * 1000)}</dd>
                        </div>
                        {claimed && cert.nftWalletAddress && (
                          <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Billetera</dt>
                            <dd className="m-0 font-mono text-gray-900">{walletService.shortenAddress(cert.nftWalletAddress)}</dd>
                          </div>
                        )}
                      </dl>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {cert.nftTxHash && hasBlockExplorer && (
                          <a href={walletService.getExplorerUrl(cert.nftTxHash)} target="_blank" rel="noopener noreferrer" className="text-brand-700 font-medium inline-flex items-center gap-1">
                            Ver transacción <FaExternalLinkAlt className="text-xs" aria-hidden="true" />
                          </a>
                        )}
                        {cert.nftTokenId && hasBlockExplorer && (
                          <a href={walletService.getTokenUrl(cert.nftTokenId)} target="_blank" rel="noopener noreferrer" className="text-brand-700 font-medium inline-flex items-center gap-1">
                            Ver token <FaExternalLinkAlt className="text-xs" aria-hidden="true" />
                          </a>
                        )}
                        <a href={`/verify/${cert.id}`} target="_blank" rel="noopener noreferrer" className="text-brand-700 font-medium inline-flex items-center gap-1">
                          Verificar <FaExternalLinkAlt className="text-xs" aria-hidden="true" />
                        </a>
                      </div>
                      {custodied && (
                        <button
                          type="button"
                          onClick={() => handleClaim(cert)}
                          disabled={claimingId !== null}
                          className={`${btn.primary} mt-auto`}
                        >
                          {claimingId === cert.id ? 'Reclamando...' : 'Reclamar a mi billetera'}
                        </button>
                      )}
                      {claimError?.id === cert.id && (
                        <p role="alert" className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 m-0">
                          {claimError.message}
                        </p>
                      )}
                      {claimedId === cert.id && (
                        <p role="status" className="text-sm text-green-700 flex items-center gap-2 m-0">
                          <FaCheckCircle aria-hidden="true" /> Listo, tu NFT ahora está en tu billetera.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </B2CLayout>
  );
};

export default B2CNFTCertificatesPage;
