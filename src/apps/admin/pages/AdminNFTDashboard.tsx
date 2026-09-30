/**
 * CompensaTuViaje - Admin NFT Dashboard
 * Certificados NFT emitidos en Polygon y estado de la conexión con el contrato.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, BadgeCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { getBlockchainStats, getBlockchainStatus } from '../../../shared/services/blockchainApi';
import type { BlockchainStatsResponse, BlockchainStatusResponse, RecentMint } from '../../../types/blockchain.types';
import { getErrorMessage } from '../../../shared/utils/errorHandler';
import {
  EmptyState,
  KpiCard,
  PageHeader,
  Panel,
  Skeleton,
  StatusBadge,
  formatInt,
  formatTime,
} from '../ui';

const AUTO_REFRESH_INTERVAL = 30_000; // 30 segundos

const shortAddress = (addr?: string | null) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—');

const formatTons = (n?: number | null) =>
  typeof n === 'number' ? n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
};

const AdminNFTDashboard: React.FC = () => {
  const [stats, setStats] = useState<BlockchainStatsResponse | null>(null);
  const [status, setStatus] = useState<BlockchainStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [statusRes, statsRes] = await Promise.all([getBlockchainStatus(), getBlockchainStats()]);
      setStatus(statusRes);
      setStats(statsRes);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(getErrorMessage(err, 'No se pudieron cargar los datos de blockchain.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(true), AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const mints = stats?.recentMints ?? [];

  return (
    <div className="adm-page">
      <PageHeader
        title="NFT Blockchain"
        description="Certificados de compensación emitidos como NFT en Polygon."
        actions={
          <>
            <label className="adm-check">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              Actualizar cada 30 s
            </label>
            <button type="button" className="adm-btn" onClick={() => fetchData()} disabled={loading}>
              <RefreshCw aria-hidden="true" />
              {lastUpdated ? `Actualizado ${formatTime(lastUpdated)}` : 'Actualizar'}
            </button>
          </>
        }
      />

      {error && !loading && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div><b>{error}</b> <button type="button" className="adm-link" onClick={() => fetchData()}>Reintentar</button></div>
        </div>
      )}

      {/* Estado de la conexión con el contrato */}
      <section className="adm-panel">
        <div className="adm-inline-meta">
          <StatusBadge tone={status?.available ? 'success' : 'danger'}>
            {status?.available ? 'Conectada' : 'Sin conexión'}
          </StatusBadge>
          <span>Red: <b>{status?.network || '—'}</b></span>
          <span>Contrato: <b className="adm-mono">{shortAddress(status?.contractAddress)}</b></span>
          {status?.contractAddress && (
            <a className="adm-link" href={`https://polygonscan.com/address/${status.contractAddress}`} target="_blank" rel="noopener noreferrer">
              Ver en Polygonscan <ExternalLink aria-hidden="true" />
            </a>
          )}
        </div>
      </section>

      {loading && !stats ? (
        <div className="adm-kpis">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={96} />)}</div>
      ) : stats && (
        <>
          <div className="adm-kpis">
            <KpiCard label="Certificados emitidos" value={formatInt(stats.totalCertificates)} />
            <KpiCard label="CO₂e certificado" value={formatTons(stats.totalCO2Tons)} unit="t" />
            <KpiCard label="Titulares únicos" value={formatInt(stats.uniqueHolders)} context="Wallets distintas" />
            <KpiCard label="Verificados" value={formatInt(stats.verifiedCount)} />
          </div>

          <div className="adm-grid adm-grid--2-1">
            <section className="adm-table-card">
              <div className="adm-panel__head" style={{ paddingBottom: 12 }}>
                <h2 className="adm-panel__title">Últimos NFT emitidos</h2>
                <span className="adm-panel__aside">{formatInt(mints.length)} registros</span>
              </div>
              <div className="adm-table-scroll">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th scope="col">Token</th>
                      <th scope="col">Certificado</th>
                      <th scope="col" className="adm-col-num">CO₂e (t)</th>
                      <th scope="col">Wallet</th>
                      <th scope="col">Emitido</th>
                      <th scope="col" className="adm-col-actions"><span className="sr-only">Transacción</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mints.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <EmptyState icon={BadgeCheck} title="Aún no se han emitido certificados NFT" />
                        </td>
                      </tr>
                    ) : (
                      mints.map((mint: RecentMint, i: number) => (
                        <tr key={mint.txHash || i}>
                          <td className="adm-mono">#{mint.tokenId}</td>
                          <td className="adm-mono">{mint.certificateNumber}</td>
                          <td className="adm-col-num">{formatTons(mint.tonsCompensated)}</td>
                          <td className="adm-mono">{shortAddress(mint.walletAddress)}</td>
                          <td>{formatDate(mint.mintedAt)}</td>
                          <td className="adm-col-actions">
                            {mint.txHash && (
                              <a
                                className="adm-icon-btn"
                                href={`https://polygonscan.com/tx/${mint.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Ver transacción en Polygonscan"
                                aria-label={`Ver transacción del token ${mint.tokenId} en Polygonscan`}
                              >
                                <ExternalLink aria-hidden="true" />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Antes mostraba "Chain ID 137" fijo aunque no hubiera conexión y
                una tarjeta de "Características" (OpenSea, transferibles) que
                era contenido de marketing, no información operativa. */}
            <Panel title="Contrato">
              <dl className="adm-dl">
                <dt>Estándar</dt>
                <dd>ERC-721</dd>
                <dt>Red</dt>
                <dd>{status?.network || '—'}</dd>
                <dt>Chain ID</dt>
                <dd>{status?.chainId || '—'}</dd>
                <dt>Dirección</dt>
                <dd className="adm-mono">{shortAddress(status?.contractAddress)}</dd>
              </dl>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminNFTDashboard;
