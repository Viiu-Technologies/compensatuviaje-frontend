/**
 * CompensaTuViaje - NFT Certificate Card
 * Tarjeta visual del certificado NFT - Diseño mejorado
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  ExternalLink, 
  Copy, 
  Check, 
  Verified,
  Plane,
  Bus,
  Car,
  Train,
  Ship,
  HelpCircle,
  Calendar,
  MapPin,
} from 'lucide-react';
import type { NFTCertificate, TravelType } from '../../../types/blockchain.types';

interface NFTCertificateCardProps {
  certificate: NFTCertificate;
  showActions?: boolean;
  explorerUrl?: string;
  openSeaUrl?: string;
  onViewDetails?: () => void;
  className?: string;
}

// Iconos por tipo de viaje
const TravelIcons: Record<TravelType, React.ElementType> = {
  flight: Plane,
  bus: Bus,
  car: Car,
  train: Train,
  ship: Ship,
  other: HelpCircle
};

const TravelLabels: Record<TravelType, string> = {
  flight: 'Vuelo',
  bus: 'Bus',
  car: 'Automóvil',
  train: 'Tren',
  ship: 'Barco',
  other: 'Otro'
};

const NFTCertificateCard: React.FC<NFTCertificateCardProps> = ({
  certificate,
  showActions = true,
  explorerUrl,
  openSeaUrl,
  onViewDetails,
  className = ''
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const TravelIcon = TravelIcons[certificate.travelType as TravelType] || HelpCircle;
  const co2Kg = certificate.co2AmountKg;
  const isDemoMode = (certificate as any).demoMode === true;

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const shortAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <motion.div 
      className={`
        !relative !overflow-hidden
        !bg-gradient-to-br !from-slate-900 !via-slate-800 !to-slate-950
        !border !border-slate-700/50 !rounded-2xl
        !shadow-xl hover:!shadow-2xl
        !transition-all !duration-300
        ${className}
      `}
      whileHover={{ y: -4 }}
    >
      {/* Header con gradiente verde - MEJORADO */}
      <div className="!relative !h-48 !bg-gradient-to-br !from-emerald-500 !via-green-600 !to-teal-700 !overflow-hidden">
        {/* Animated background pattern */}
        <div className="!absolute !inset-0 !opacity-20">
          <svg className="!w-full !h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="leafPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 0 Q15 10 10 20 Q5 10 10 0" fill="currentColor" />
            </pattern>
            <rect width="100" height="100" fill="url(#leafPattern)" />
          </svg>
        </div>

        {/* Gradient overlay */}
        <div className="!absolute !inset-0 !bg-gradient-to-br !from-emerald-500/20 !to-transparent" />

        {/* Main content - centered */}
        <div className="!absolute !inset-0 !flex !flex-col !items-center !justify-center !text-white">
          <Leaf className="!w-12 !h-12 !mb-2 !text-emerald-50 !opacity-90" />
          <h3 className="!text-2xl !font-bold !text-center !mb-1">NFT Certificate</h3>
          <p className="!text-sm !text-emerald-50/80">{isDemoMode ? 'Modo Demo' : 'Blockchain verified'}</p>
        </div>

        {/* Demo badge - top left */}
        {isDemoMode && (
          <div className="!absolute !top-4 !left-4 !flex !items-center !gap-1.5 !px-3 !py-1.5 !bg-amber-500 !rounded-full !border !border-amber-300/50">
            <span className="!text-white !text-xs !font-bold !uppercase">Demo</span>
          </div>
        )}

        {/* Token ID badge - top right */}
        <div className="!absolute !top-4 !right-4">
          <motion.div 
            className="!px-4 !py-2 !bg-black/40 !backdrop-blur-md !rounded-full !border !border-white/20"
            whileHover={{ scale: 1.05 }}
          >
            <span className="!text-white !text-base !font-mono !font-bold">#{certificate.tokenId}</span>
          </motion.div>
        </div>

        {/* Verified badge - bottom left */}
        {certificate.verified && (
          <div className="!absolute !bottom-4 !left-4 !flex !items-center !gap-2 !px-3 !py-2 !bg-blue-500 !backdrop-blur-sm !rounded-full !border !border-blue-300/50">
            <Verified className="!w-5 !h-5 !text-white" />
            <span className="!text-white !text-sm !font-semibold">Verificado</span>
          </div>
        )}

        {/* Transport icon - bottom right */}
        <div className="!absolute !bottom-4 !right-4">
          <div className="!p-3 !bg-white/20 !backdrop-blur-sm !rounded-full !border !border-white/30">
            <TravelIcon className="!w-6 !h-6 !text-white" />
          </div>
        </div>
      </div>

      {/* Body - MEJORADO CON MÁS ESPACIADO */}
      <div className="!p-7 !space-y-6">
        {/* CO2 Amount - DESTACADO */}
        <div className="!text-center !bg-gradient-to-br !from-emerald-500/10 !to-teal-500/10 !border !border-emerald-500/20 !rounded-xl !py-6 !px-4">
          <p className="!text-slate-400 !text-sm !font-medium !mb-2 !uppercase !tracking-wider">CO2 Compensado</p>
          <div className="!flex !items-baseline !justify-center !gap-2">
            <span className="!text-5xl !font-black !text-emerald-400">
              {co2Kg.toFixed(2)}
            </span>
            <span className="!text-2xl !text-emerald-500 !font-bold">kg</span>
          </div>
          <p className="!text-xs !text-emerald-600/80 !mt-2">Impacto ambiental inmutable</p>
        </div>

        {/* Project Details - MEJOR LAYOUT */}
        <div className="!space-y-3">
          <div className="!flex !items-center !gap-3 !p-4 !bg-slate-800/60 !rounded-xl !border !border-slate-700/30 !hover:border-emerald-500/30 !transition-colors">
            <div className="!p-2 !bg-emerald-500/20 !rounded-lg">
              <Leaf className="!w-5 !h-5 !text-emerald-400" />
            </div>
            <div className="!flex-1 !min-w-0">
              <p className="!text-xs !text-slate-400 !font-semibold !uppercase !tracking-wider">Proyecto</p>
              <p className="!text-white !font-bold !truncate !text-lg">{certificate.projectName}</p>
            </div>
          </div>

          <div className="!grid !grid-cols-2 !gap-3">
            <div className="!flex !items-center !gap-3 !p-3 !bg-slate-800/60 !rounded-xl !border !border-slate-700/30 !hover:border-blue-500/30 !transition-colors">
              <div className="!p-2 !bg-blue-500/20 !rounded-lg !flex-shrink-0">
                <MapPin className="!w-4 !h-4 !text-blue-400" />
              </div>
              <div className="!min-w-0">
                <p className="!text-xs !text-slate-400 !font-semibold !uppercase">País</p>
                <p className="!text-white !font-bold !truncate">{certificate.projectCountry}</p>
              </div>
            </div>

            <div className="!flex !items-center !gap-3 !p-3 !bg-slate-800/60 !rounded-xl !border !border-slate-700/30 !hover:border-purple-500/30 !transition-colors">
              <div className="!p-2 !bg-purple-500/20 !rounded-lg !flex-shrink-0">
                <Calendar className="!w-4 !h-4 !text-purple-400" />
              </div>
              <div className="!min-w-0">
                <p className="!text-xs !text-slate-400 !font-semibold !uppercase">Fecha</p>
                <p className="!text-white !font-bold !text-sm">{formatDate(certificate.timestamp)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Info - CLARIFIED */}
        <div className="!space-y-2 !pt-4 !border-t !border-slate-700/50">
          <p className="!text-xs !text-slate-400 !font-semibold !uppercase !tracking-wider">Información Blockchain</p>
          
          <div className="!flex !items-center !justify-between !p-3 !bg-slate-800/40 !rounded-lg !hover:bg-slate-800/60 !transition-colors">
            <span className="!text-xs !text-slate-500 !font-medium">Propietario</span>
            <div className="!flex !items-center !gap-2">
              <code className="!text-xs !text-emerald-400 !font-mono !bg-slate-900/50 !px-2 !py-1 !rounded">
                {shortAddress(certificate.beneficiary)}
              </code>
              <motion.button
                onClick={() => handleCopy(certificate.beneficiary, 'owner')}
                className="!p-1.5 !hover:bg-slate-700 !rounded-lg !transition-colors !bg-transparent !border-0 !cursor-pointer"
                whileHover={{ scale: 1.1 }}
              >
                {copiedField === 'owner' 
                  ? <Check className="!w-4 !h-4 !text-green-500" />
                  : <Copy className="!w-4 !h-4 !text-slate-400 !hover:text-slate-300" />
                }
              </motion.button>
            </div>
          </div>

          <div className="!flex !items-center !justify-between !p-3 !bg-slate-800/40 !rounded-lg !hover:bg-slate-800/60 !transition-colors">
            <span className="!text-xs !text-slate-500 !font-medium">Tx Hash</span>
            <div className="!flex !items-center !gap-2">
              <code className="!text-xs !text-blue-400 !font-mono !bg-slate-900/50 !px-2 !py-1 !rounded !truncate !max-w-[100px]">
                {certificate.txHash?.slice(0, 12)}...
              </code>
              <motion.button
                onClick={() => handleCopy(certificate.txHash || '', 'tx')}
                className="!p-1.5 !hover:bg-slate-700 !rounded-lg !transition-colors !bg-transparent !border-0 !cursor-pointer"
                whileHover={{ scale: 1.1 }}
              >
                {copiedField === 'tx'
                  ? <Check className="!w-4 !h-4 !text-green-500" />
                  : <Copy className="!w-4 !h-4 !text-slate-400 !hover:text-slate-300" />
                }
              </motion.button>
            </div>
          </div>
        </div>

        {/* Actions - MEJORADOS */}
        {showActions && (
          <div className="!space-y-3 !pt-2">
            {isDemoMode && (
              <div className="!flex !items-center !gap-2 !p-3 !bg-amber-500/10 !border !border-amber-500/30 !rounded-xl">
                <div className="!p-1.5 !bg-amber-500/20 !rounded-lg">
                  <HelpCircle className="!w-4 !h-4 !text-amber-400" />
                </div>
                <p className="!text-xs !text-amber-300">
                  <strong>Modo Demo:</strong> Este NFT se registró localmente. Configura las variables de blockchain para mintear en Polygon real.
                </p>
              </div>
            )}

            {!isDemoMode && (explorerUrl || openSeaUrl) && (
              <div className="!flex !gap-3">
                {explorerUrl && (
                  <motion.a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!flex-1 !flex !items-center !justify-center !gap-2 !px-4 !py-3
                      !bg-gradient-to-r !from-slate-700 !to-slate-600 !hover:from-slate-600 !hover:to-slate-500
                      !text-white !text-sm !font-bold !rounded-xl
                      !transition-all !border !border-slate-600/50
                      !no-underline"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink className="!w-4 !h-4" />
                    Polygonscan
                  </motion.a>
                )}

                {openSeaUrl && (
                  <motion.a
                    href={openSeaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!flex-1 !flex !items-center !justify-center !gap-2 !px-4 !py-3
                      !bg-gradient-to-r !from-blue-600 !to-blue-500 !hover:from-blue-500 !hover:to-blue-400
                      !text-white !text-sm !font-bold !rounded-xl
                      !transition-all !border !border-blue-500/50
                      !no-underline"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink className="!w-4 !h-4" />
                    OpenSea
                  </motion.a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Holographic effect on hover */}
      <div className="!absolute !inset-0 !pointer-events-none !rounded-2xl">
        <div className="!absolute !inset-0 !bg-gradient-to-tr !from-transparent !via-white/5 !to-transparent !opacity-0 !hover:opacity-100 !transition-all !duration-500" />
      </div>
    </motion.div>
  );
};

export default NFTCertificateCard;
