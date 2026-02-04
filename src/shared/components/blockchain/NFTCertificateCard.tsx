/**
 * CompensaTuViaje - NFT Certificate Card
 * Tarjeta visual del certificado NFT
 */

import React, { useState } from 'react';
import { 
  Shield, 
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
  QrCode
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
  ferry: Ship,
  other: HelpCircle
};

const TravelLabels: Record<TravelType, string> = {
  flight: 'Vuelo',
  bus: 'Bus',
  car: 'Automóvil',
  train: 'Tren',
  ferry: 'Ferry',
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
  const co2Kg = Number(certificate.co2Amount) / 1000;

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shortAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className={`
      relative overflow-hidden
      bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
      border border-slate-700 rounded-2xl
      shadow-2xl
      ${className}
    `}>
      {/* Header con gradiente verde */}
      <div className="relative h-32 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 overflow-hidden">
        {/* Pattern de fondo */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="leafPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 0 Q15 10 10 20 Q5 10 10 0" fill="currentColor" />
            </pattern>
            <rect width="100" height="100" fill="url(#leafPattern)" />
          </svg>
        </div>

        {/* Logo/Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/90 text-xs font-medium">CompensaTuViaje</p>
            <p className="text-white font-bold text-sm">CO2 Certificate NFT</p>
          </div>
        </div>

        {/* Token ID */}
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full">
            <span className="text-white/90 text-sm font-mono">#{certificate.tokenId}</span>
          </div>
        </div>

        {/* Verified badge */}
        {certificate.verified && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1 px-2 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full">
            <Verified className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-medium">Verificado</span>
          </div>
        )}

        {/* Icono de transporte */}
        <div className="absolute bottom-4 right-4">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
            <TravelIcon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* CO2 Amount - Principal */}
        <div className="text-center mb-6">
          <p className="text-slate-400 text-sm mb-1">CO2 Compensado</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-emerald-400">
              {co2Kg.toFixed(2)}
            </span>
            <span className="text-xl text-emerald-500">kg</span>
          </div>
        </div>

        {/* Detalles del proyecto */}
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
            <Shield className="w-5 h-5 text-emerald-500 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">Proyecto</p>
              <p className="text-white font-medium truncate">{certificate.projectName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400">País</p>
                <p className="text-white text-sm">{certificate.projectCountry}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400">Fecha</p>
                <p className="text-white text-sm">{formatDate(certificate.timestamp)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Info */}
        <div className="space-y-2 pt-4 border-t border-slate-700">
          {/* Owner */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Propietario</span>
            <div className="flex items-center gap-1">
              <code className="text-xs text-slate-300 font-mono">
                {shortAddress(certificate.currentOwner)}
              </code>
              <button
                onClick={() => handleCopy(certificate.currentOwner, 'owner')}
                className="p-1 hover:bg-slate-700 rounded"
              >
                {copiedField === 'owner' 
                  ? <Check className="w-3 h-3 text-green-500" />
                  : <Copy className="w-3 h-3 text-slate-400" />
                }
              </button>
            </div>
          </div>

          {/* Compensation ID */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">ID Compensación</span>
            <div className="flex items-center gap-1">
              <code className="text-xs text-slate-300 font-mono">
                {certificate.compensationId.slice(0, 12)}...
              </code>
              <button
                onClick={() => handleCopy(certificate.compensationId, 'compensation')}
                className="p-1 hover:bg-slate-700 rounded"
              >
                {copiedField === 'compensation' 
                  ? <Check className="w-3 h-3 text-green-500" />
                  : <Copy className="w-3 h-3 text-slate-400" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                  bg-slate-700 hover:bg-slate-600 
                  text-white text-sm font-medium rounded-lg
                  transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Polygonscan
              </a>
            )}

            {openSeaUrl && (
              <a
                href={openSeaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                  bg-blue-600 hover:bg-blue-500 
                  text-white text-sm font-medium rounded-lg
                  transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                OpenSea
              </a>
            )}

            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <QrCode className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Holographic effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
};

export default NFTCertificateCard;
