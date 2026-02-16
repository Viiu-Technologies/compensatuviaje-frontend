// ============================================
// Blockchain API Client - CompensaTuViaje
// ============================================
// NOTE: The axios interceptor in api.tsx already unwraps response.data,
// so `res` = { success, message?, data: {...} }. We use `unwrap()` to
// merge `success` from the outer envelope with the inner `data` fields.

import api from './api';
import type {
  BlockchainStatusResponse,
  CertificateResponse,
  MintRequest,
  MintResult,
  WalletCertificatesResponse,
  BlockchainStatsResponse,
  PublicVerification,
  NFTCertificate,
} from '../../types/blockchain.types';

const BASE = '/blockchain';

/** Merge outer { success } with inner { data } from backend envelope */
const unwrap = (res: any) => ({ success: res.success, ...(res.data || res) });

// ---- Status ----
export const getBlockchainStatus = async (): Promise<BlockchainStatusResponse> => {
  const res: any = await api.get(`${BASE}/status`);
  return unwrap(res);
};

// ---- Certificate by compensationId (public) ----
export const getCertificateByCompensation = async (
  compensationId: string
): Promise<CertificateResponse> => {
  const res: any = await api.get(`${BASE}/certificate/${compensationId}`);
  return unwrap(res);
};

// ---- Certificate by tokenId ----
export const getCertificateByTokenId = async (
  tokenId: string
): Promise<{ success: boolean; certificate: NFTCertificate }> => {
  const res: any = await api.get(`${BASE}/token/${tokenId}`);
  return unwrap(res);
};

// ---- Mint NFT ----
export const mintNFTCertificate = async (data: MintRequest): Promise<MintResult> => {
  const res: any = await api.post(`${BASE}/mint`, data);
  return unwrap(res);
};

// ---- Verify transaction ----
export const verifyTransaction = async (
  txHash: string
): Promise<PublicVerification> => {
  const res: any = await api.get(`${BASE}/verify/${txHash}`);
  return unwrap(res);
};

// ---- Wallet certificates ----
export const getWalletCertificates = async (
  address: string
): Promise<WalletCertificatesResponse> => {
  const res: any = await api.get(`${BASE}/wallet/${address}/certificates`);
  return unwrap(res);
};

// ---- Blockchain Stats (admin) ----
export const getBlockchainStats = async (): Promise<BlockchainStatsResponse> => {
  const res: any = await api.get(`${BASE}/stats`);
  return unwrap(res);
};

// ---- Public verification page (no auth) ----
export const publicVerifyCertificate = async (
  compensationId: string
): Promise<PublicVerification> => {
  const res: any = await api.get(`${BASE}/public/verify/${compensationId}`);
  return unwrap(res);
};

// ---- Search certificate by number (landing) ----
export const searchCertificateByNumber = async (
  certificateNumber: string
): Promise<PublicVerification> => {
  const res: any = await api.get(`${BASE}/public/search/${certificateNumber}`);
  return unwrap(res);
};

// ---- Default export object for components that import as default ----
const blockchainApi = {
  getBlockchainStatus,
  getCertificateByCompensation,
  getCertificateByTokenId,
  mintNFTCertificate,
  verifyTransaction,
  getWalletCertificates,
  getBlockchainStats,
  publicVerifyCertificate,
  searchCertificateByNumber,
};
export default blockchainApi;
