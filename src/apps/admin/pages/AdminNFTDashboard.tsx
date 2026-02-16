/**
 * CompensaTuViaje - Admin NFT Dashboard
 * Panel de administración para monitorear certificados NFT
 */

import React, { useState, useEffect } from 'react';
import {
  FaCubes,
  FaLeaf,
  FaUsers,
  FaCheckCircle,
  FaSyncAlt,
  FaExternalLinkAlt,
  FaSearch,
  FaChartBar,
  FaCertificate,
  FaNetworkWired
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { getBlockchainStats, getBlockchainStatus } from '../../../shared/services/blockchainApi';
import type { BlockchainStatsResponse, BlockchainStatusResponse } from '../../../types/blockchain.types';

const AdminNFTDashboard: React.FC = () => {
  const [stats, setStats] = useState<BlockchainStatsResponse | null>(null);
  const [status, setStatus] = useState<BlockchainStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, statusRes] = await Promise.all([
        getBlockchainStats(),
        getBlockchainStatus()
      ]);
      setStats(statsRes);
      setStatus(statusRes);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos de blockchain');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpiCards = [
    {
      label: 'Certificados NFT',
      value: stats?.totalCertificates ?? 0,
      icon: FaCertificate,
      color: 'purple',
      bg: '!bg-purple-50',
      iconBg: '!bg-purple-100',
      iconColor: '!text-purple-600',
      valueColor: '!text-purple-700',
    },
    {
      label: 'CO₂ Total (ton)',
      value: stats?.totalCO2Tons?.toFixed(2) ?? '0',
      icon: FaLeaf,
      color: 'green',
      bg: '!bg-green-50',
      iconBg: '!bg-green-100',
      iconColor: '!text-green-600',
      valueColor: '!text-green-700',
    },
    {
      label: 'Holders Únicos',
      value: stats?.uniqueHolders ?? 0,
      icon: FaUsers,
      color: 'blue',
      bg: '!bg-blue-50',
      iconBg: '!bg-blue-100',
      iconColor: '!text-blue-600',
      valueColor: '!text-blue-700',
    },
    {
      label: 'Verificados',
      value: stats?.verifiedCount ?? 0,
      icon: FaCheckCircle,
      color: 'emerald',
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
        <button
          onClick={fetchData}
          disabled={loading}
          className="!px-4 !py-2.5 !bg-purple-600 hover:!bg-purple-700 !text-white !rounded-xl !flex !items-center !gap-2 !text-sm !font-bold !border-0 !cursor-pointer !transition disabled:!opacity-50"
        >
          <FaSyncAlt className={`!text-sm ${loading ? '!animate-spin' : ''}`} />
          Actualizar
        </button>
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
              Contrato: {status?.contractAddress ? `${status.contractAddress.slice(0, 8)}...${status.contractAddress.slice(-6)}` : '—'}
            </span>
          </div>
          {status?.contractAddress && (
            <a
              href={`https://polygonscan.com/address/${status.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="!text-purple-600 hover:!text-purple-700 !text-sm !flex !items-center !gap-1"
            >
              <FaExternalLinkAlt className="!text-xs" /> Ver contrato
            </a>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
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
            onClick={fetchData}
            className="!mt-2 !text-red-500 !underline !text-sm !bg-transparent !border-0 !cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* KPI Cards */}
      {!loading && !error && (
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

      {/* Info panel */}
      {!loading && !error && (
        <div className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-6">
          {/* Contract Info */}
          <div className="!bg-white !rounded-xl !border !border-gray-200 !p-6 !shadow-sm">
            <h3 className="!text-lg !font-bold !text-gray-900 !mb-4 !flex !items-center !gap-2">
              <FaCubes className="!text-purple-600" />
              Smart Contract
            </h3>
            <div className="!space-y-3">
              <div className="!flex !justify-between !items-center !py-2 !border-b !border-gray-100">
                <span className="!text-sm !text-gray-500">Tipo</span>
                <span className="!text-sm !text-gray-900 !font-medium">ERC-721 (NFT)</span>
              </div>
              <div className="!flex !justify-between !items-center !py-2 !border-b !border-gray-100">
                <span className="!text-sm !text-gray-500">Blockchain</span>
                <span className="!text-sm !text-gray-900 !font-medium">Polygon</span>
              </div>
              <div className="!flex !justify-between !items-center !py-2 !border-b !border-gray-100">
                <span className="!text-sm !text-gray-500">Estándar</span>
                <span className="!text-sm !text-gray-900 !font-medium">OpenZeppelin v5</span>
              </div>
              <div className="!flex !justify-between !items-center !py-2 !border-b !border-gray-100">
                <span className="!text-sm !text-gray-500">Chain ID</span>
                <span className="!text-sm !text-gray-900 !font-mono">{status?.chainId || '—'}</span>
              </div>
              <div className="!flex !justify-between !items-center !py-2">
                <span className="!text-sm !text-gray-500">Contrato</span>
                <code className="!text-xs !text-gray-700 !bg-gray-100 !px-2 !py-1 !rounded">
                  {status?.contractAddress ? `${status.contractAddress.slice(0, 12)}...` : '—'}
                </code>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="!bg-white !rounded-xl !border !border-gray-200 !p-6 !shadow-sm">
            <h3 className="!text-lg !font-bold !text-gray-900 !mb-4 !flex !items-center !gap-2">
              <HiSparkles className="!text-purple-600" />
              Características NFT
            </h3>
            <div className="!space-y-4">
              {[
                { icon: FaCertificate, text: 'Certificados como NFTs ERC-721 en Polygon', color: '!text-purple-600' },
                { icon: FaLeaf, text: 'Metadata en IPFS con datos de compensación CO₂', color: '!text-green-600' },
                { icon: FaCheckCircle, text: 'Verificación pública en blockchain', color: '!text-blue-600' },
                { icon: FaUsers, text: 'Transferibles entre wallets', color: '!text-indigo-600' },
                { icon: FaExternalLinkAlt, text: 'Visibles en OpenSea y Polygonscan', color: '!text-pink-600' },
                { icon: FaChartBar, text: 'Tracking de impacto ambiental on-chain', color: '!text-amber-600' },
              ].map((feat, i) => (
                <div key={i} className="!flex !items-center !gap-3">
                  <feat.icon className={`!text-lg ${feat.color}`} />
                  <span className="!text-sm !text-gray-700">{feat.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNFTDashboard;
