/**
 * CompensaTuViaje - NFT Minting Modal
 * Modal para mintear certificado NFT
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  Shield,
  Leaf,
  ArrowRight
} from 'lucide-react';
import walletService from '../../services/walletService';
import blockchainApi from '../../services/blockchainApi';
import type { WalletState, MintingState, MintResult } from '../../../types/blockchain.types';

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

const MINTING_STEPS = [
  { id: 1, label: 'Conectar Wallet', description: 'Conecta tu wallet para recibir el NFT' },
  { id: 2, label: 'Confirmar', description: 'Revisa los datos del certificado' },
  { id: 3, label: 'Mintear', description: 'Creando tu NFT en blockchain' },
  { id: 4, label: 'Completado', description: '¡Tu certificado NFT está listo!' }
];

const MintNFTModal: React.FC<MintNFTModalProps> = ({
  isOpen,
  onClose,
  compensationId,
  compensationData,
  onSuccess
}) => {
  const [walletState, setWalletState] = useState<WalletState>(walletService.getState());
  const [currentStep, setCurrentStep] = useState(1);
  const [mintingState, setMintingState] = useState<MintingState>({
    status: 'idle',
    step: 1,
    totalSteps: 4,
    message: ''
  });
  const [mintResult, setMintResult] = useState<MintResult | null>(null);

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setWalletState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (walletState.isConnected && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [walletState.isConnected]);

  const handleConnect = async () => {
    try {
      await walletService.connect();
    } catch (error) {
      console.error('Connect error:', error);
    }
  };

  const handleMint = async () => {
    if (!walletState.address) return;

    setCurrentStep(3);
    setMintingState({
      status: 'preparing',
      step: 1,
      totalSteps: 4,
      message: 'Preparando datos del certificado...'
    });

    try {
      // Simular pasos de preparación
      await new Promise(r => setTimeout(r, 1000));

      setMintingState({
        status: 'uploading_metadata',
        step: 2,
        totalSteps: 4,
        message: 'Subiendo metadata a IPFS...'
      });

      await new Promise(r => setTimeout(r, 1500));

      setMintingState({
        status: 'minting',
        step: 3,
        totalSteps: 4,
        message: 'Minteando NFT en blockchain...'
      });

      // Llamar API
      const response = await blockchainApi.mint({
        compensationId,
        walletAddress: walletState.address
      });

      if (!response.success || !response.result) {
        throw new Error(response.error || 'Minting failed');
      }

      setMintResult(response.result);
      setMintingState({
        status: 'success',
        step: 4,
        totalSteps: 4,
        message: '¡Certificado NFT creado exitosamente!',
        tokenId: response.result.tokenId,
        transactionHash: response.result.transactionHash
      });
      setCurrentStep(4);

      if (onSuccess) {
        onSuccess(response.result);
      }
    } catch (error: any) {
      setMintingState({
        status: 'error',
        step: mintingState.step,
        totalSteps: 4,
        message: 'Error al mintear NFT',
        error: error.message
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-b border-slate-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Mintear Certificado NFT</h2>
              <p className="text-slate-400 text-sm">Convierte tu compensación en un NFT único</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {MINTING_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${currentStep >= step.id 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-700 text-slate-400'
                    }
                    ${currentStep === step.id && mintingState.status !== 'error' 
                      ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900' 
                      : ''
                    }
                  `}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : mintingState.status === 'error' && currentStep === step.id ? (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`
                    text-xs mt-1 text-center max-w-[60px]
                    ${currentStep >= step.id ? 'text-white' : 'text-slate-500'}
                  `}>
                    {step.label}
                  </span>
                </div>
                {index < MINTING_STEPS.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-2
                    ${currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-700'}
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Connect Wallet */}
          {currentStep === 1 && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Conecta tu Wallet
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Necesitas una wallet compatible con Polygon para recibir tu certificado NFT
              </p>

              {!walletService.isMetaMaskInstalled() ? (
                <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg mb-4">
                  <p className="text-yellow-400 text-sm">
                    MetaMask no detectado. 
                    <a 
                      href="https://metamask.io/download/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline ml-1"
                    >
                      Instalar MetaMask
                    </a>
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={walletState.isConnecting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3
                    bg-gradient-to-r from-purple-600 to-blue-600
                    hover:from-purple-700 hover:to-blue-700
                    text-white font-medium rounded-lg
                    disabled:opacity-50 transition-all"
                >
                  {walletState.isConnecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Conectar MetaMask
                    </>
                  )}
                </button>
              )}

              {walletState.error && (
                <p className="mt-3 text-red-400 text-sm">{walletState.error}</p>
              )}
            </div>
          )}

          {/* Step 2: Confirm */}
          {currentStep === 2 && (
            <div>
              <div className="p-4 bg-slate-800 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Datos del Certificado</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">CO2 Compensado</span>
                    <span className="text-emerald-400 font-bold">
                      {compensationData.co2Amount.toFixed(2)} kg
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Proyecto</span>
                    <span className="text-white">{compensationData.projectName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Wallet destino</span>
                    <code className="text-xs text-slate-300 font-mono">
                      {walletService.getShortAddress()}
                    </code>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-900/20 border border-emerald-700/50 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-emerald-400 font-medium text-sm">Certificado Inmutable</p>
                    <p className="text-emerald-300/70 text-xs mt-1">
                      Una vez creado, este NFT será un registro permanente e inalterable de tu compensación en la blockchain de Polygon.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleMint}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                    bg-gradient-to-r from-emerald-600 to-teal-600
                    hover:from-emerald-700 hover:to-teal-700
                    text-white font-medium rounded-lg transition-all"
                >
                  <Leaf className="w-5 h-5" />
                  Mintear NFT
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Minting */}
          {currentStep === 3 && (
            <div className="text-center py-6">
              {mintingState.status === 'error' ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Error al mintear
                  </h3>
                  <p className="text-red-400 text-sm mb-6">
                    {mintingState.error}
                  </p>
                  <button
                    onClick={() => {
                      setCurrentStep(2);
                      setMintingState({ status: 'idle', step: 1, totalSteps: 4, message: '' });
                    }}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Intentar de nuevo
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                    <div className="relative w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {mintingState.message}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Por favor no cierres esta ventana
                  </p>

                  {/* Progress bar */}
                  <div className="mt-6 w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(mintingState.step / mintingState.totalSteps) * 100}%` }}
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    Paso {mintingState.step} de {mintingState.totalSteps}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && mintResult && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                ¡NFT Creado! 🎉
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Tu certificado de compensación ahora es un NFT en Polygon
              </p>

              <div className="p-4 bg-slate-800 rounded-lg mb-6 text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Token ID</span>
                    <span className="text-emerald-400 font-mono">#{mintResult.tokenId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Transaction</span>
                    <code className="text-xs text-slate-300 font-mono">
                      {mintResult.transactionHash?.slice(0, 10)}...
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {mintResult.explorerUrl && (
                  <a
                    href={mintResult.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                      bg-slate-700 hover:bg-slate-600
                      text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver en Polygonscan
                  </a>
                )}
                {mintResult.openSeaUrl && (
                  <a
                    href={mintResult.openSeaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                      bg-blue-600 hover:bg-blue-500
                      text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver en OpenSea
                  </a>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full mt-4 px-4 py-3 text-slate-400 hover:text-white transition-colors"
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
