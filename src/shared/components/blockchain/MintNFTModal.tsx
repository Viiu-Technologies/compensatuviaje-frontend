/**
 * CompensaTuViaje - NFT Minting Modal
 * Modal para mintear certificado NFT
 */

import React, { useState } from 'react';
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Shield,
  Leaf
} from 'lucide-react';
import blockchainApi from '../../services/blockchainApi';
import type { MintResult } from '../../../types/blockchain.types';

interface MintNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  compensationId: string;
  compensationData: {
    co2Amount: number;
    projectName: string;
    travelType: string;
  };
  onSuccess?: (result: MintResult) => void;
}

type MintingStatus = 'idle' | 'minting' | 'success' | 'error';

const MINTING_STEPS = [
  { id: 1, label: 'Confirmar' },
  { id: 2, label: 'Mintear' },
  { id: 3, label: 'Completado' }
];

const stepForStatus = (status: MintingStatus): number => {
  if (status === 'success') return 3;
  if (status === 'idle') return 1;
  return 2;
};

const MintNFTModal: React.FC<MintNFTModalProps> = ({
  isOpen,
  onClose,
  compensationId,
  compensationData,
  onSuccess
}) => {
  const [status, setStatus] = useState<MintingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);

  const currentStep = stepForStatus(status);
  const isDemoMode = Boolean((mintResult as { demoMode?: boolean } | null)?.demoMode);

  const handleMint = async () => {
    setStatus('minting');
    setErrorMessage(null);

    try {
      const result = await blockchainApi.mintNFTCertificate({ compensationId });

      if (!result.success) {
        throw new Error('Minting failed');
      }

      setMintResult(result);
      setStatus('success');
      onSuccess?.(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear el NFT');
      setStatus('error');
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !p-4">
      <div
        className="!absolute !inset-0 !bg-black/70 !backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="!relative !w-full !max-w-lg !bg-slate-900 !border !border-slate-700 !rounded-2xl !shadow-2xl !overflow-hidden">
        <div className="!relative !p-6 !bg-gradient-to-br !from-emerald-600/20 !to-teal-600/20 !border-b !border-slate-700">
          <button
            onClick={onClose}
            className="!absolute !top-4 !right-4 !p-2 hover:!bg-slate-700/50 !rounded-lg !transition-colors !bg-transparent !border-0 !cursor-pointer"
          >
            <X className="!w-5 !h-5 !text-slate-400" />
          </button>

          <div className="!flex !items-center !gap-3">
            <div className="!p-3 !bg-emerald-500/20 !rounded-xl">
              <Sparkles className="!w-6 !h-6 !text-emerald-400" />
            </div>
            <div>
              <h2 className="!text-xl !font-bold !text-white">Mintear Certificado NFT</h2>
              <p className="!text-slate-400 !text-sm">Convierte tu compensación en un NFT único</p>
            </div>
          </div>
        </div>

        <div className="!px-6 !py-4 !border-b !border-slate-700">
          <div className="!flex !items-center !justify-between">
            {MINTING_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="!flex !flex-col !items-center">
                  <div className={`
                    !w-8 !h-8 !rounded-full !flex !items-center !justify-center
                    ${currentStep >= step.id
                      ? '!bg-emerald-500 !text-white'
                      : '!bg-slate-700 !text-slate-400'
                    }
                    ${currentStep === step.id && status !== 'error'
                      ? '!ring-2 !ring-emerald-500 !ring-offset-2 !ring-offset-slate-900'
                      : ''
                    }
                  `}>
                    {currentStep > step.id || (status === 'success' && currentStep === step.id) ? (
                      <CheckCircle className="!w-5 !h-5" />
                    ) : status === 'error' && currentStep === step.id ? (
                      <AlertCircle className="!w-5 !h-5 !text-red-400" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`
                    !text-xs !mt-1 !text-center !max-w-[60px]
                    ${currentStep >= step.id ? '!text-white' : '!text-slate-500'}
                  `}>
                    {step.label}
                  </span>
                </div>
                {index < MINTING_STEPS.length - 1 && (
                  <div className={`
                    !flex-1 !h-0.5 !mx-2
                    ${currentStep > step.id ? '!bg-emerald-500' : '!bg-slate-700'}
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="!p-6">
          {status === 'idle' && (
            <div>
              <div className="!p-4 !bg-slate-800 !rounded-lg !mb-4">
                <h4 className="!text-sm !font-medium !text-slate-400 !mb-3">Datos del Certificado</h4>

                <div className="!space-y-3">
                  <div className="!flex !items-center !justify-between">
                    <span className="!text-slate-400">CO2 Compensado</span>
                    <span className="!text-emerald-400 !font-bold">
                      {compensationData.co2Amount.toFixed(2)} kg
                    </span>
                  </div>

                  <div className="!flex !items-center !justify-between">
                    <span className="!text-slate-400">Proyecto</span>
                    <span className="!text-white">{compensationData.projectName}</span>
                  </div>

                  <div className="!flex !items-center !justify-between">
                    <span className="!text-slate-400">Titular del NFT</span>
                    <span className="!text-white !text-sm">CompensaTuViaje (custodia)</span>
                  </div>
                </div>
              </div>

              <div className="!p-4 !bg-emerald-900/20 !border !border-emerald-700/50 !rounded-lg !mb-6">
                <div className="!flex !items-start !gap-3">
                  <Shield className="!w-5 !h-5 !text-emerald-400 !mt-0.5" />
                  <div>
                    <p className="!text-emerald-400 !font-medium !text-sm">Sin billetera, sin riesgo</p>
                    <p className="!text-emerald-300/70 !text-xs !mt-1">
                      No necesitas MetaMask. Guardamos tu NFT en custodia: tu certificado sigue siendo válido y verificable por su número aunque no tengas una billetera.
                    </p>
                  </div>
                </div>
              </div>

              <div className="!flex !gap-3">
                <button
                  onClick={onClose}
                  className="!flex-1 !px-4 !py-3 !bg-slate-700 hover:!bg-slate-600 !text-white !rounded-lg !transition-colors !border-0 !cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMint}
                  className="!flex-1 !flex !items-center !justify-center !gap-2 !px-4 !py-3
                    !bg-gradient-to-r !from-emerald-600 !to-teal-600
                    hover:!from-emerald-700 hover:!to-teal-700
                    !text-white !font-medium !rounded-lg !transition-all !border-0 !cursor-pointer"
                >
                  <Leaf className="!w-5 !h-5" />
                  Mintear NFT
                </button>
              </div>
            </div>
          )}

          {status === 'minting' && (
            <div className="!text-center !py-6">
              <div className="!w-16 !h-16 !mx-auto !mb-4 !relative">
                <div className="!absolute !inset-0 !bg-emerald-500/20 !rounded-full !animate-ping" />
                <div className="!relative !w-full !h-full !bg-slate-800 !rounded-full !flex !items-center !justify-center">
                  <Loader2 className="!w-8 !h-8 !text-emerald-400 !animate-spin" />
                </div>
              </div>
              <h3 className="!text-lg !font-semibold !text-white !mb-2">
                Creando tu NFT en la blockchain...
              </h3>
              <p className="!text-slate-400 !text-sm">
                Por favor no cierres esta ventana
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="!text-center !py-6">
              <div className="!w-16 !h-16 !mx-auto !mb-4 !bg-red-900/30 !rounded-full !flex !items-center !justify-center">
                <AlertCircle className="!w-8 !h-8 !text-red-400" />
              </div>
              <h3 className="!text-lg !font-semibold !text-white !mb-2">
                Error al mintear
              </h3>
              <p className="!text-red-400 !text-sm !mb-6">
                {errorMessage}
              </p>
              <button
                onClick={handleRetry}
                className="!px-6 !py-3 !bg-slate-700 hover:!bg-slate-600 !text-white !rounded-lg !transition-colors !border-0 !cursor-pointer"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {status === 'success' && mintResult && (
            <div className="!text-center">
              <div className="!w-20 !h-20 !mx-auto !mb-4 !bg-emerald-500/20 !rounded-full !flex !items-center !justify-center">
                <CheckCircle className="!w-10 !h-10 !text-emerald-400" />
              </div>
              <h3 className="!text-xl !font-bold !text-white !mb-2">
                ¡NFT Creado!
              </h3>
              <p className="!text-slate-400 !text-sm !mb-6">
                {isDemoMode
                  ? 'Tu certificado fue registrado en modo demo (sin blockchain real)'
                  : 'Tu certificado de compensación ahora es un NFT en Polygon'}
              </p>

              {isDemoMode && (
                <div className="!p-3 !bg-amber-500/10 !border !border-amber-500/30 !rounded-lg !mb-4">
                  <p className="!text-xs !text-amber-300 !text-center">
                    <strong>Modo Demo:</strong> Los datos se guardaron localmente. Para mintear en la blockchain real de Polygon, configura las variables de entorno del servidor.
                  </p>
                </div>
              )}

              <div className="!p-4 !bg-slate-800 !rounded-lg !mb-6 !text-left">
                <div className="!space-y-2">
                  <div className="!flex !items-center !justify-between">
                    <span className="!text-slate-400 !text-sm">Token ID</span>
                    <span className="!text-emerald-400 !font-mono">#{mintResult.tokenId}</span>
                  </div>
                  <div className="!flex !items-center !justify-between">
                    <span className="!text-slate-400 !text-sm">Custodia</span>
                    <span className="!text-white !text-sm">
                      {mintResult.custodyStatus === 'claimed' ? 'En tu billetera' : 'CompensaTuViaje'}
                    </span>
                  </div>
                  <div className="!flex !items-center !justify-between">
                    <span className="!text-slate-400 !text-sm">Modo</span>
                    <span className={`!text-xs !font-semibold !px-2 !py-0.5 !rounded-full ${
                      isDemoMode
                        ? '!bg-amber-500/20 !text-amber-400'
                        : '!bg-emerald-500/20 !text-emerald-400'
                    }`}>
                      {isDemoMode ? 'Demo' : 'Blockchain Real'}
                    </span>
                  </div>
                </div>
              </div>

              {!isDemoMode && (
                <div className="!flex !gap-3">
                  {mintResult.explorerUrl && (
                    <a
                      href={mintResult.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="!flex-1 !flex !items-center !justify-center !gap-2 !px-4 !py-3
                        !bg-slate-700 hover:!bg-slate-600
                        !text-white !rounded-lg !transition-colors !no-underline"
                    >
                      <ExternalLink className="!w-4 !h-4" />
                      Ver en Polygonscan
                    </a>
                  )}
                  {mintResult.openSeaUrl && (
                    <a
                      href={mintResult.openSeaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="!flex-1 !flex !items-center !justify-center !gap-2 !px-4 !py-3
                        !bg-blue-600 hover:!bg-blue-500
                        !text-white !rounded-lg !transition-colors !no-underline"
                    >
                      <ExternalLink className="!w-4 !h-4" />
                      Ver en OpenSea
                    </a>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className="!w-full !mt-4 !px-4 !py-3 !text-slate-400 hover:!text-white !transition-colors !bg-transparent !border-0 !cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MintNFTModal;
