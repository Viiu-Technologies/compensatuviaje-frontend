/**
 * CompensaTuViaje - Blockchain API Service
 * Servicio para interacción con API blockchain
 */

import type {
  BlockchainStatusResponse,
  CertificateResponse,
  MintRequest,
  MintResponse,
  VerifyTransactionResponse,
  WalletCertificatesResponse,
  NFTCertificate,
  BlockchainStats
} from '../../types/blockchain.types';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/api';

/**
 * Headers con autenticación
 */
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Manejo de errores
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || error.message || `HTTP error ${response.status}`);
  }
  return response.json();
};

// ============================================
// API Functions
// ============================================

/**
 * Obtener estado del servicio blockchain
 */
export const getBlockchainStatus = async (): Promise<BlockchainStatusResponse> => {
  const response = await fetch(`${API_URL}/blockchain/status`);
  return handleResponse<BlockchainStatusResponse>(response);
};

/**
 * Obtener certificado por ID de compensación
 */
export const getCertificateByCompensation = async (compensationId: string): Promise<CertificateResponse> => {
  const response = await fetch(`${API_URL}/blockchain/certificate/${compensationId}`);
  return handleResponse<CertificateResponse>(response);
};

/**
 * Mintear certificado NFT
 */
export const mintCertificate = async (data: MintRequest): Promise<MintResponse> => {
  const response = await fetch(`${API_URL}/blockchain/mint`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse<MintResponse>(response);
};

/**
 * Verificar transacción en blockchain
 */
export const verifyTransaction = async (transactionHash: string): Promise<VerifyTransactionResponse> => {
  const response = await fetch(`${API_URL}/blockchain/verify/${transactionHash}`);
  return handleResponse<VerifyTransactionResponse>(response);
};

/**
 * Obtener certificados de una wallet
 */
export const getWalletCertificates = async (address: string): Promise<WalletCertificatesResponse> => {
  const response = await fetch(`${API_URL}/blockchain/wallet/${address}/certificates`);
  return handleResponse<WalletCertificatesResponse>(response);
};

/**
 * Obtener certificado por tokenId
 */
export const getCertificateByTokenId = async (tokenId: string): Promise<{ success: boolean; certificate: NFTCertificate; openSeaUrl: string }> => {
  const response = await fetch(`${API_URL}/blockchain/token/${tokenId}`);
  return handleResponse(response);
};

/**
 * Obtener estadísticas de NFTs
 */
export const getBlockchainStats = async (): Promise<{ success: boolean; blockchain: BlockchainStats | null; database: { mintedCertificates: number; totalCO2Minted: number } }> => {
  const response = await fetch(`${API_URL}/blockchain/stats`);
  return handleResponse(response);
};

// ============================================
// Export default object
// ============================================

const blockchainApi = {
  getStatus: getBlockchainStatus,
  getCertificate: getCertificateByCompensation,
  mint: mintCertificate,
  verifyTransaction,
  getWalletCertificates,
  getCertificateByTokenId,
  getStats: getBlockchainStats
};

export default blockchainApi;
