/**
 * CompensaTuViaje - Mis Certificados NFT (B2C)
 * Página para ver y gestionar certificados NFT del usuario
 */

import React, { useState, useEffect, useCallback } from 'react';
import B2CLayout from '../components/B2CLayout';
import { WalletConnectButton, NFTCertificateCard } from '../../../shared/components/blockchain';
import { getWalletCertificates } from '../../../shared/services/blockchainApi';
import walletService from '../../../shared/services/walletService';
import type { WalletState, NFTCertificate, WalletCertificatesResponse } from '../../../types/blockchain.types';
import {
  FaCubes,
  FaLeaf,
  FaWallet,
  FaExternalLinkAlt,
  FaSearch,
  FaSyncAlt,
  FaCertificate,
  FaInfoCircle
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const B2CNFTCertificatesPage: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>(walletService.getState());
  const [certificates, setCertificates] = useState<NFTCertificate[]>([]);
  const [totalCO2, setTotalCO2] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = walletService.subscribe(setWallet);
    return unsub;
  }, []);

  const fetchCertificates = useCallback(async () => {
    if (!wallet.address) return;
    setLoading(true);
    setError(null);
    try {
      const res: WalletCertificatesResponse = await getWalletCertificates(wallet.address);
      if (res.success) {
        // Normalize certificates to ensure co2AmountKg exists
        const normalizedCerts = (res.certificates || []).map((c: any) => ({
          ...c,
          co2AmountGrams: c.co2AmountGrams ?? Number(c.co2Amount || 0),
          co2AmountKg: c.co2AmountKg ?? Number(c.co2Amount || 0) / 1000,
          co2AmountTons: c.co2AmountTons ?? Number(c.co2Amount || 0) / 1000000,
          tokenURI: c.tokenURI || c.tokenUri || '',
          txHash: c.txHash || null,
          explorerUrl: c.explorerUrl || '',
          openSeaUrl: c.openSeaUrl || '',
        }));
        setCertificates(normalizedCerts);
        // totalCO2 from API is an object { totalGrams, totalKg, totalTons }
        const co2 = res.totalCO2;
        if (typeof co2 === 'object' && co2 !== null) {
          setTotalCO2(parseFloat((co2 as any).totalKg || '0'));
        } else {
          setTotalCO2(Number(co2) || 0);
        }
      } else {
        setError('No se pudieron cargar los certificados');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar certificados');
    } finally {
      setLoading(false);
    }
  }, [wallet.address]);

  useEffect(() => {
    if (wallet.connected && wallet.address) {
      fetchCertificates();
    } else {
      setCertificates([]);
      setTotalCO2(0);
    }
  }, [wallet.connected, wallet.address, fetchCertificates]);

  const filtered = certificates.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.tokenId || '').toLowerCase().includes(q) ||
      (c.projectName || '').toLowerCase().includes(q) ||
      (c.compensationId || '').toLowerCase().includes(q)
    );
  });

  return (
    <B2CLayout title="Mis Certificados NFT" subtitle="Tus compensaciones inmutables en blockchain">
      <div className="!space-y-6">
        {/* Banner */}
        <div className="!bg-gradient-to-r !from-purple-600 !via-violet-600 !to-indigo-600 !rounded-2xl !p-6 md:!p-8 !text-white !shadow-lg">
          <div className="!flex !flex-col md:!flex-row !items-start md:!items-center !justify-between !gap-4">
            <div className="!flex !items-center !gap-4">
              <div className="!w-14 !h-14 !bg-white/20 !backdrop-blur-sm !rounded-2xl !flex !items-center !justify-center">
                <FaCubes className="!text-3xl !text-white" />
              </div>
              <div>
                <h2 className="!text-2xl !font-bold">Certificados NFT</h2>
                <p className="!text-white/80 !text-sm !mt-1">
                  Cada compensación puede convertirse en un NFT verificable en Polygon
                </p>
              </div>
            </div>
            <WalletConnectButton
              onConnect={() => {}}
              onDisconnect={() => {
                setCertificates([]);
                setTotalCO2(0);
              }}
            />
          </div>
        </div>

        {/* Stats cards */}
        {wallet.connected && (
          <div className="!grid !grid-cols-1 sm:!grid-cols-3 !gap-4">
            <div className="!bg-white !rounded-xl !p-5 !border !border-gray-200 !shadow-sm">
              <div className="!flex !items-center !gap-3">
                <div className="!w-10 !h-10 !bg-green-100 !rounded-lg !flex !items-center !justify-center">
                  <FaCertificate className="!text-green-600" />
                </div>
                <div>
                  <p className="!text-sm !text-gray-500">Total NFTs</p>
                  <p className="!text-2xl !font-bold !text-gray-900">{certificates.length}</p>
                </div>
              </div>
            </div>

            <div className="!bg-white !rounded-xl !p-5 !border !border-gray-200 !shadow-sm">
              <div className="!flex !items-center !gap-3">
                <div className="!w-10 !h-10 !bg-emerald-100 !rounded-lg !flex !items-center !justify-center">
                  <FaLeaf className="!text-emerald-600" />
                </div>
                <div>
                  <p className="!text-sm !text-gray-500">CO₂ Total</p>
                  <p className="!text-2xl !font-bold !text-gray-900">{totalCO2.toFixed(2)} <span className="!text-sm !font-normal !text-gray-500">kg</span></p>
                </div>
              </div>
            </div>

            <div className="!bg-white !rounded-xl !p-5 !border !border-gray-200 !shadow-sm">
              <div className="!flex !items-center !gap-3">
                <div className="!w-10 !h-10 !bg-purple-100 !rounded-lg !flex !items-center !justify-center">
                  <FaWallet className="!text-purple-600" />
                </div>
                <div>
                  <p className="!text-sm !text-gray-500">Wallet</p>
                  <p className="!text-sm !font-mono !text-gray-900 !truncate !max-w-[140px]">
                    {wallet.address ? walletService.shortenAddress(wallet.address) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not connected state */}
        {!wallet.connected && (
          <div className="!bg-white !rounded-2xl !border !border-gray-200 !p-12 !text-center">
            <div className="!w-20 !h-20 !mx-auto !mb-6 !bg-purple-100 !rounded-full !flex !items-center !justify-center">
              <FaWallet className="!text-4xl !text-purple-600" />
            </div>
            <h3 className="!text-xl !font-bold !text-gray-900 !mb-2">Conecta tu Wallet</h3>
            <p className="!text-gray-500 !mb-6 !max-w-md !mx-auto">
              Conecta tu wallet MetaMask para ver tus certificados NFT de compensación de CO₂ en la blockchain de Polygon.
            </p>
            <div className="!flex !justify-center">
              <WalletConnectButton />
            </div>
            <div className="!mt-8 !flex !items-start !gap-3 !p-4 !bg-blue-50 !rounded-xl !max-w-md !mx-auto !text-left">
              <FaInfoCircle className="!text-blue-500 !mt-0.5 !flex-shrink-0" />
              <p className="!text-sm !text-blue-700">
                Los certificados NFT son registros inmutables de tu compensación en la blockchain. 
                Puedes mintear NFTs desde la sección de <strong>Certificados</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Connected: Certificate list */}
        {wallet.connected && (
          <>
            {/* Search + Refresh */}
            <div className="!flex !items-center !gap-3">
              <div className="!relative !flex-1">
                <FaSearch className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por token, proyecto o ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="!w-full !pl-10 !pr-4 !py-2.5 !border !border-gray-200 !rounded-xl !text-sm !bg-white focus:!ring-2 focus:!ring-purple-300 focus:!border-purple-400 !outline-none"
                />
              </div>
              <button
                onClick={fetchCertificates}
                disabled={loading}
                className="!px-4 !py-2.5 !bg-gray-100 hover:!bg-gray-200 !text-gray-700 !rounded-xl !flex !items-center !gap-2 !text-sm !font-medium !border-0 !cursor-pointer !transition disabled:!opacity-50"
              >
                <FaSyncAlt className={`!text-sm ${loading ? '!animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="!text-center !py-12">
                <div className="!w-10 !h-10 !border-3 !border-purple-200 !border-t-purple-600 !rounded-full !animate-spin !mx-auto !mb-4" />
                <p className="!text-gray-500">Cargando certificados desde blockchain...</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="!bg-red-50 !border !border-red-200 !rounded-xl !p-4 !text-center">
                <p className="!text-red-600 !text-sm">{error}</p>
                <button
                  onClick={fetchCertificates}
                  className="!mt-2 !text-red-500 !underline !text-sm !bg-transparent !border-0 !cursor-pointer"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <div className="!bg-white !rounded-2xl !border !border-gray-200 !p-12 !text-center">
                <div className="!w-16 !h-16 !mx-auto !mb-4 !bg-gray-100 !rounded-full !flex !items-center !justify-center">
                  <HiSparkles className="!text-3xl !text-gray-400" />
                </div>
                <h3 className="!text-lg !font-bold !text-gray-900 !mb-2">
                  {search ? 'Sin resultados' : 'Aún no tienes NFTs'}
                </h3>
                <p className="!text-gray-500 !text-sm !max-w-sm !mx-auto">
                  {search
                    ? 'Intenta con otro término de búsqueda'
                    : 'Compensa tu huella de carbono y convierte tus certificados en NFTs inmutables.'}
                </p>
              </div>
            )}

            {/* Grid de certificados */}
            {!loading && !error && filtered.length > 0 && (
              <motion.div 
                className="!grid !grid-cols-1 md:!grid-cols-2 xl:!grid-cols-3 !gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
              >
                <AnimatePresence>
                  {filtered.map((cert) => (
                    <motion.div
                      key={cert.tokenId}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <NFTCertificateCard
                        certificate={cert}
                        explorerUrl={cert.explorerUrl}
                        openSeaUrl={cert.openSeaUrl}
                        onViewDetails={() => {
                          window.open(`/verify/${cert.compensationId}`, '_blank');
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>
    </B2CLayout>
  );
};

export default B2CNFTCertificatesPage;
