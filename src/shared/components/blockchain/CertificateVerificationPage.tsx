/**
 * CompensaTuViaje - Certificate Verification Page
 * Página pública para verificar certificados NFT
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink, 
  Copy, 
  Check,
  Leaf,
  AlertTriangle,
  QrCode,
  Share2,
  Download
} from 'lucide-react';
import blockchainApi from '../../services/blockchainApi';
import walletService from '../../services/walletService';
import NFTCertificateCard from './NFTCertificateCard';
import type { NFTCertificate, CertificateVerification } from '../../../types/blockchain.types';

interface VerificationResult {
  status: 'loading' | 'verified' | 'not-found' | 'invalid' | 'error';
  certificate?: NFTCertificate;
  explorerUrl?: string;
  openSeaUrl?: string;
  error?: string;
}

const CertificateVerificationPage: React.FC = () => {
  const { compensationId, tokenId } = useParams<{ compensationId?: string; tokenId?: string }>();
  const [verification, setVerification] = useState<VerificationResult>({ status: 'loading' });
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    verifyCertificate();
  }, [compensationId, tokenId]);

  const verifyCertificate = async () => {
    setVerification({ status: 'loading' });

    try {
      let response;

      if (tokenId) {
        // Verificar por tokenId
        response = await blockchainApi.getCertificateByTokenId(tokenId);
        if (response.success && response.certificate) {
          setVerification({
            status: 'verified',
            certificate: response.certificate,
            openSeaUrl: response.openSeaUrl,
            explorerUrl: walletService.getTransactionExplorerUrl(response.certificate.tokenUri || '')
          });
        } else {
          setVerification({ status: 'not-found' });
        }
      } else if (compensationId) {
        // Verificar por compensationId
        response = await blockchainApi.getCertificate(compensationId);
        if (response.success && response.hasNFT && response.certificate) {
          setVerification({
            status: 'verified',
            certificate: response.certificate,
            explorerUrl: response.explorerUrl,
            openSeaUrl: response.openSeaUrl
          });
        } else if (response.success && !response.hasNFT) {
          setVerification({ 
            status: 'not-found',
            error: 'Esta compensación no tiene un certificado NFT asociado'
          });
        } else {
          setVerification({ status: 'not-found' });
        }
      } else {
        setVerification({ 
          status: 'invalid',
          error: 'ID de certificado no válido'
        });
      }
    } catch (error: any) {
      setVerification({
        status: 'error',
        error: error.message || 'Error al verificar el certificado'
      });
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Certificado CO2 - CompensaTuViaje',
        text: `Verifica mi certificado de compensación de CO2`,
        url: window.location.href
      });
    } else {
      handleCopyLink();
    }
  };

  const verificationUrl = window.location.href;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-bold text-white">CompensaTuViaje</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Loading */}
        {verification.status === 'loading' && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
              <div className="relative w-full h-full bg-slate-800 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Verificando Certificado</h2>
            <p className="text-slate-400">Consultando la blockchain de Polygon...</p>
          </div>
        )}

        {/* Verified */}
        {verification.status === 'verified' && verification.certificate && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Certificate Card */}
            <div>
              <NFTCertificateCard
                certificate={verification.certificate}
                explorerUrl={verification.explorerUrl}
                openSeaUrl={verification.openSeaUrl}
              />
            </div>

            {/* Verification Details */}
            <div className="space-y-6">
              {/* Verification Badge */}
              <div className="p-6 bg-emerald-900/20 border border-emerald-700/50 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-emerald-400 mb-1">
                      Certificado Verificado ✓
                    </h2>
                    <p className="text-emerald-300/70">
                      Este certificado existe en la blockchain de Polygon y es auténtico.
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">
                  <Shield className="w-5 h-5 inline-block mr-2 text-slate-400" />
                  Detalles de Verificación
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Token ID</p>
                    <p className="text-white font-mono">#{verification.certificate.tokenId}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">ID Compensación</p>
                    <p className="text-white font-mono text-sm break-all">
                      {verification.certificate.compensationId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">Propietario Actual</p>
                    <p className="text-white font-mono text-sm break-all">
                      {verification.certificate.currentOwner}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-1">Registrado en Blockchain</p>
                    <p className="text-white">
                      {new Date(verification.certificate.timestamp).toLocaleString('es-CL')}
                    </p>
                  </div>

                  {verification.certificate.verified && (
                    <div className="pt-3 border-t border-slate-700">
                      <div className="flex items-center gap-2 text-blue-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Verificado por terceros</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">
                        {verification.certificate.verificationDate && 
                          new Date(verification.certificate.verificationDate).toLocaleString('es-CL')
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Share */}
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                <p className="text-sm text-slate-400 mb-2">Compartir verificación</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not Found */}
        {verification.status === 'not-found' && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-yellow-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Certificado No Encontrado
            </h2>
            <p className="text-slate-400 mb-6">
              {verification.error || 'No se encontró un certificado NFT con este identificador en la blockchain.'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              Ir al inicio
            </Link>
          </div>
        )}

        {/* Error */}
        {verification.status === 'error' && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-900/20 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Error de Verificación
            </h2>
            <p className="text-slate-400 mb-6">
              {verification.error || 'Ocurrió un error al verificar el certificado.'}
            </p>
            <button
              onClick={verifyCertificate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Invalid */}
        {verification.status === 'invalid' && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-900/20 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Enlace Inválido
            </h2>
            <p className="text-slate-400 mb-6">
              {verification.error || 'El enlace de verificación no es válido.'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              Ir al inicio
            </Link>
          </div>
        )}
      </main>

      {/* Footer info */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <span>Verificado en Polygon</span>
            <span>•</span>
            <a 
              href="https://polygon.technology" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              Polygon Network
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CertificateVerificationPage;
