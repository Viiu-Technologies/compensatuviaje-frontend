/**
 * Certificados NFT del usuario (registro en Polygon).
 *
 * Antes: portada en degradado violeta-índigo y el aviso "MetaMask no
 * detectado" repetido dos veces (el botón de conexión estaba en la portada
 * y en el estado vacío). Ahora hay un solo punto de conexión y los colores
 * de la marca (petróleo para lo que es blockchain).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import B2CLayout from '../components/B2CLayout';
import { WalletConnectButton, NFTCertificateCard } from '../../../shared/components/blockchain';
import { getWalletCertificates } from '../../../shared/services/blockchainApi';
import walletService from '../../../shared/services/walletService';
import type { WalletState, NFTCertificate, WalletCertificatesResponse } from '../../../types/blockchain.types';
import { FaCubes, FaLeaf, FaWallet, FaSearch, FaSyncAlt, FaInfoCircle } from 'react-icons/fa';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import { Card, CardHeader, EmptyState, ErrorState, Skeleton, StatCard, btn, fmtInt, fmtKgAuto } from '../ui';

const B2CNFTCertificatesPage: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>(walletService.getState());
  const [certificates, setCertificates] = useState<NFTCertificate[]>([]);
  const [totalKg, setTotalKg] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => walletService.subscribe(setWallet), []);

  const fetchCertificates = useCallback(async () => {
    if (!wallet.address) return;
    setLoading(true);
    setError(null);
    try {
      const res: WalletCertificatesResponse = await getWalletCertificates(wallet.address);
      if (res.success) {
        const normalized = (res.certificates || []).map((c: any) => ({
          ...c,
          co2AmountGrams: c.co2AmountGrams ?? Number(c.co2Amount || 0),
          co2AmountKg: c.co2AmountKg ?? Number(c.co2Amount || 0) / 1000,
          co2AmountTons: c.co2AmountTons ?? Number(c.co2Amount || 0) / 1000000,
          tokenURI: c.tokenURI || c.tokenUri || '',
          txHash: c.txHash || null,
          explorerUrl: c.explorerUrl || '',
          openSeaUrl: c.openSeaUrl || '',
        }));
        setCertificates(normalized);
        // totalCO2 llega como { totalGrams, totalKg, totalTons } o como número
        const co2 = res.totalCO2 as any;
        setTotalKg(typeof co2 === 'object' && co2 !== null ? parseFloat(co2.totalKg || '0') : Number(co2) || 0);
      } else {
        setError('No se pudieron cargar los certificados.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'No se pudieron cargar los certificados.'));
    } finally {
      setLoading(false);
    }
  }, [wallet.address]);

  useEffect(() => {
    if (wallet.connected && wallet.address) fetchCertificates();
    else {
      setCertificates([]);
      setTotalKg(0);
    }
  }, [wallet.connected, wallet.address, fetchCertificates]);

  const q = search.trim().toLowerCase();
  const filtered = certificates.filter(
    (c) =>
      !q ||
      (c.tokenId || '').toLowerCase().includes(q) ||
      (c.projectName || '').toLowerCase().includes(q) ||
      (c.compensationId || '').toLowerCase().includes(q),
  );

  return (
    <B2CLayout
      title="Certificados NFT"
      subtitle="Tus compensaciones registradas en la red Polygon"
      headerRightExtra={
        wallet.connected ? (
          <WalletConnectButton onConnect={() => {}} onDisconnect={() => { setCertificates([]); setTotalKg(0); }} />
        ) : undefined
      }
    >
      <div className="space-y-6">
        {!wallet.connected ? (
          <Card>
            <div className="text-center py-8 px-4 max-w-lg mx-auto">
              <span className="mx-auto mb-4 w-12 h-12 rounded-full bg-brand-900/5 text-brand-900 flex items-center justify-center">
                <FaWallet className="text-xl" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-semibold text-gray-900 m-0">Conecta tu billetera</h2>
              <p className="text-sm text-gray-500 m-0 mt-1.5">
                Conecta MetaMask para ver los certificados NFT de tus compensaciones en la red Polygon.
              </p>
              <div className="mt-5 flex justify-center">
                <WalletConnectButton />
              </div>
              <p className="mt-6 text-sm text-gray-500 flex items-start gap-2 text-left rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
                <FaInfoCircle className="mt-0.5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                <span>
                  Un NFT es un registro público e inalterable de tu compensación. Puedes crear uno para cada certificado desde{' '}
                  <Link to="/b2c/certificates" className="text-brand-700 font-medium">Certificados</Link>.
                </span>
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="NFT" value={fmtInt(certificates.length)} icon={FaCubes} />
              <StatCard label="CO₂e registrado" value={fmtKgAuto(totalKg)} icon={FaLeaf} tone="good" />
              <StatCard
                label="Billetera"
                value={<span className="text-base font-mono">{wallet.address ? walletService.shortenAddress(wallet.address) : '—'}</span>}
                icon={FaWallet}
              />
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
              <div className="p-6">
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
                    {filtered.map((cert) => (
                      <NFTCertificateCard
                        key={cert.tokenId}
                        certificate={cert}
                        explorerUrl={cert.explorerUrl}
                        openSeaUrl={cert.openSeaUrl}
                        onViewDetails={() => window.open(`/verify/${cert.compensationId}`, '_blank')}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </B2CLayout>
  );
};

export default B2CNFTCertificatesPage;
