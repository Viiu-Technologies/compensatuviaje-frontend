/**
 * CompensaTuViaje - Admin NFT Dashboard
 * Panel de administración para monitorear certificados NFT en tiempo real
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaCubes,
  FaLeaf,
  FaUsers,
  FaCheckCircle,
  FaSyncAlt,
  FaExternalLinkAlt,
  FaCertificate,
  FaNetworkWired,
  FaClock,
  FaHashtag,
  FaWallet,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { getBlockchainStats, getBlockchainStatus } from '../../../shared/services/blockchainApi';
import type { BlockchainStatsResponse, BlockchainStatusResponse, RecentMint } from '../../../types/blockchain.types';

const AUTO_REFRESH_INTERVAL = 30_000; // 30 seconds

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
      const [statusRes, statsRes] = await Promise.all([
        getBlockchainStatus(),
        getBlockchainStats()
      ]);
      setStatus(statusRes);
      setStats(statsRes);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos de blockchain');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchData(true), AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const shortAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '—';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const kpiCards = [
    {
      label: 'Certificados NFT',
      value: stats?.totalCertificates ?? 0,
      icon: FaCertificate,
      bg: '!bg-purple-50',
      iconBg: '!bg-purple-100',
      iconColor: '!text-purple-600',
      valueColor: '!text-purple-700',
    },
    {
      label: 'CO₂ Total (ton)',
      value: typeof stats?.totalCO2Tons === 'number' ? stats.totalCO2Tons.toFixed(2) : '0.00',
      icon: FaLeaf,
      bg: '!bg-green-50',
      iconBg: '!bg-green-100',
      iconColor: '!text-green-600',
      valueColor: '!text-green-700',
    },
    {
      label: 'Holders Únicos',
      value: stats?.uniqueHolders ?? 0,
      icon: FaUsers,
      bg: '!bg-blue-50',
      iconBg: '!bg-blue-100',
      iconColor: '!text-blue-600',
      valueColor: '!text-blue-700',
    },
    {
      label: 'Verificados',
      value: stats?.verifiedCount ?? 0,
      icon: FaCheckCircle,
      bg: '!bg-emerald-50',
      iconBg: '!bg-emerald-100',
      iconColor: '!text-emerald-600',
      valueColor: '!text-emerald-700',
    },
  ];

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !flex-col md:!flex-row !items-start md:!items-center !justify-between !gap-4">
        <div>
          <h1 className="!text-2xl !font-bold !text-gray-900 !flex !items-center !gap-3">
            <FaCubes className="!text-purple-600" />
            Gestión NFT Blockchain
          </h1>
          <p className="!text-gray-500 !text-sm !mt-1">
            Monitoreo de certificados NFT en la red Polygon
          </p>
        </div>
        <div className="!flex !items-center !gap-3">
          {lastUpdated && (
            <span className="!text-xs !text-gray-400 !flex !items-center !gap-1">
              <FaClock className="!text-[10px]" />
              {lastUpdated.toLocaleTimeString('es-CL')}
            </span>
          )}
          <label className="!flex !items-center !gap-2 !text-xs !text-gray-500 !cursor-pointer !select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="!accent-purple-600"
            />
            Auto (30s)
          </label>
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="!px-4 !py-2.5 !bg-purple-600 hover:!bg-purple-700 !text-white !rounded-xl !flex !items-center !gap-2 !text-sm !font-bold !border-0 !cursor-pointer !transition disabled:!opacity-50"
          >
            <FaSyncAlt className={`!text-sm ${loading ? '!animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Network Status */}
      <div className="!bg-white !rounded-xl !border !border-gray-200 !p-4 !shadow-sm">
        <div className="!flex !items-center !gap-4 !flex-wrap">
          <div className="!flex !items-center !gap-2">
            <div className={`!w-3 !h-3 !rounded-full ${status?.available ? '!bg-green-500 !animate-pulse' : '!bg-red-500'}`} />
            <span className="!text-sm !font-medium !text-gray-700">
              {status?.available ? 'Blockchain Activa' : 'Blockchain Inactiva'}
            </span>
          </div>
          <div className="!h-4 !w-px !bg-gray-300" />
          <div className="!flex !items-center !gap-2">
            <FaNetworkWired className="!text-gray-400" />
            <span className="!text-sm !text-gray-600">Red: {status?.network || '—'}</span>
          </div>
          <div className="!h-4 !w-px !bg-gray-300" />
          <div className="!flex !items-center !gap-2">
            <FaCubes className="!text-gray-400" />
            <span className="!text-sm !text-gray-600 !font-mono !text-xs">
              Contrato: {status?.contractAddress ? shortAddress(status.contractAddress) : '—'}
            </span>
          </div>
          {status?.contractAddress && (
            <a
              href={`https://polygonscan.com/address/${status.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="!text-purple-600 hover:!text-purple-700 !text-sm !flex !items-center !gap-1 !no-underline"
            >
              <FaExternalLinkAlt className="!text-xs" /> Ver contrato
            </a>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && !stats && (
        <div className="!text-center !py-12">
          <div className="!w-10 !h-10 !border-3 !border-purple-200 !border-t-purple-600 !rounded-full !animate-spin !mx-auto !mb-3" />
          <p className="!text-gray-500 !text-sm">Consultando blockchain...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="!bg-red-50 !border !border-red-200 !rounded-xl !p-4 !text-center">
          <p className="!text-red-600 !text-sm">{error}</p>
          <button
            onClick={() => fetchData()}
            className="!mt-2 !text-red-500 !underline !text-sm !bg-transparent !border-0 !cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* KPI Cards */}
      {stats && (
        <div className="!grid !grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-4 !gap-4">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.label}
              className={`!rounded-xl !border !border-gray-200 !p-5 !shadow-sm ${kpi.bg}`}
            >
              <div className="!flex !items-center !gap-3">
                <div className={`!w-11 !h-11 ${kpi.iconBg} !rounded-lg !flex !items-center !justify-center`}>
                  <kpi.icon className={`!text-xl ${kpi.iconColor}`} />
                </div>
                <div>
                  <p className="!text-xs !text-gray-500 !font-medium">{kpi.label}</p>
                  <p className={`!text-2xl !font-bold ${kpi.valueColor}`}>{kpi.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Mints Table + Features */}
      {stats && (
        <div className="!grid !grid-cols-1 lg:!grid-cols-3 !gap-6">
          {/* Recent Mints */}
          <div className="lg:!col-span-2 !bg-white !rounded-xl !border !border-gray-200 !shadow-sm !overflow-hidden">
            <div className="!px-6 !py-4 !border-b !border-gray-100 !flex !items-center !justify-between">
              <h3 className="!text-lg !font-bold !text-gray-900 !flex !items-center !gap-2">
                <FaClock className="!text-purple-600" />
                Últimos NFTs Minteados
              </h3>
              <span className="!text-xs !text-gray-400">{stats.recentMints?.length || 0} registros</span>
            </div>
            
            {(!stats.recentMints || stats.recentMints.length === 0) ? (
              <div className="!p-8 !text-center">
                <FaCertificate className="!text-4xl !text-gray-300 !mx-auto !mb-3" />
                <p className="!text-gray-500 !text-sm">Aún no hay certificados NFT minteados</p>
              </div>
            ) : (
              <div className="!overflow-x-auto">
                <table className="!w-full">
                  <thead>
                    <tr className="!bg-gray-50 !text-left">
                      <th className="!px-4 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">
                        <FaHashtag className="!inline !mr-1 !text-[10px]" />Token
                      </th>
                      <th className="!px-4 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">Certificado</th>
                      <th className="!px-4 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">CO₂ (ton)</th>
                      <th className="!px-4 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">
                        <FaWallet className="!inline !mr-1 !text-[10px]" />Wallet
                      </th>
                      <th className="!px-4 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">Fecha</th>
                      <th className="!px-4 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="!divide-y !divide-gray-100">
                    {stats.recentMints!.map((mint: RecentMint, i: number) => (
                      <tr key={i} className="hover:!bg-gray-50 !transition-colors">
                        <td className="!px-4 !py-3">
                          <span className="!inline-flex !items-center !gap-1 !bg-purple-100 !text-purple-700 !text-xs !font-bold !px-2.5 !py-1 !rounded-full">
                            #{mint.tokenId}
                          </span>
                        </td>
                        <td className="!px-4 !py-3 !text-sm !font-mono !text-gray-700">
                          {mint.certificateNumber}
                        </td>
                        <td className="!px-4 !py-3">
                          <span className="!text-sm !font-bold !text-green-700">
                            {mint.tonsCompensated?.toFixed(2)}
                          </span>
                        </td>
                        <td className="!px-4 !py-3 !text-xs !font-mono !text-gray-500">
                          {mint.walletAddress ? shortAddress(mint.walletAddress) : '—'}
                        </td>
                        <td className="!px-4 !py-3 !text-xs !text-gray-500">
                          {formatDate(mint.mintedAt)}
                        </td>
                        <td className="!px-4 !py-3">
                          {mint.txHash && (
                            <a
                              href={`https://polygonscan.com/tx/${mint.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="!text-purple-500 hover:!text-purple-700 !text-xs !no-underline"
                              title="Ver en Polygonscan"
                            >
                              <FaExternalLinkAlt />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right column: Contract Info + Features */}
          <div className="!space-y-6">
            {/* Contract Info */}
            <div className="!bg-white !rounded-xl !border !border-gray-200 !p-6 !shadow-sm">
              <h3 className="!text-lg !font-bold !text-gray-900 !mb-4 !flex !items-center !gap-2">
                <FaCubes className="!text-purple-600" />
                Smart Contract
              </h3>
              <div className="!space-y-3">
                {[
                  { label: 'Tipo', value: 'ERC-721 (NFT)' },
                  { label: 'Blockchain', value: 'Polygon' },
                  { label: 'Chain ID', value: status?.chainId || '137' },
                  { label: 'Contrato', value: status?.contractAddress ? `${status.contractAddress.slice(0, 12)}...` : '—', mono: true },
                ].map((row) => (
                  <div key={row.label} className="!flex !justify-between !items-center !py-2 !border-b !border-gray-100 last:!border-0">
                    <span className="!text-sm !text-gray-500">{row.label}</span>
                    <span className={`!text-sm !text-gray-900 !font-medium ${row.mono ? '!font-mono !text-xs !bg-gray-100 !px-2 !py-1 !rounded' : ''}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="!bg-white !rounded-xl !border !border-gray-200 !p-6 !shadow-sm">
              <h3 className="!text-lg !font-bold !text-gray-900 !mb-4 !flex !items-center !gap-2">
                <HiSparkles className="!text-purple-600" />
                Características
              </h3>
              <div className="!space-y-3">
                {[
                  { icon: FaCertificate, text: 'ERC-721 en Polygon', color: '!text-purple-600' },
                  { icon: FaLeaf, text: 'Metadata IPFS con CO₂', color: '!text-green-600' },
                  { icon: FaCheckCircle, text: 'Verificación pública', color: '!text-blue-600' },
                  { icon: FaUsers, text: 'Transferibles', color: '!text-indigo-600' },
                  { icon: FaExternalLinkAlt, text: 'OpenSea + Polygonscan', color: '!text-pink-600' },
                ].map((feat, i) => (
                  <div key={i} className="!flex !items-center !gap-3">
                    <feat.icon className={`!text-sm ${feat.color}`} />
                    <span className="!text-sm !text-gray-700">{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNFTDashboard;
