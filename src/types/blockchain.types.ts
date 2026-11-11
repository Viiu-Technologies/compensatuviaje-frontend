// ============================================
// Blockchain NFT Types - CompensaTuViaje
// ============================================

// ---- Chain Configuration ----
export type SupportedChain = 'polygon' | 'localhost';

export interface ChainConfig {
  chainId: number;
  chainIdHex: string;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  contractAddress: string;
  openSeaBase: string;
}

export const CHAIN_CONFIGS: Record<SupportedChain, ChainConfig> = {
  polygon: {
    chainId: 137,
    chainIdHex: '0x89',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS_POLYGON || '',
    openSeaBase: 'https://opensea.io/assets/matic',
  },
  localhost: {
    chainId: 31337,
    chainIdHex: '0x7A69',
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS_LOCAL || '',
    openSeaBase: '',
  },
};

export const ACTIVE_CHAIN: SupportedChain =
  (import.meta.env.VITE_BLOCKCHAIN_NETWORK as SupportedChain) || 'polygon';

// ---- Wallet ----
export interface WalletState {
  connected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isCorrectChain: boolean;
  connecting: boolean;
  error: string | null;
}

export const INITIAL_WALLET_STATE: WalletState = {
  connected: false,
  address: null,
  chainId: null,
  balance: null,
  isCorrectChain: false,
  connecting: false,
  error: null,
};

// ---- NFT Certificate ----
export interface NFTCertificate {
  tokenId: string;
  compensationId: string;
  beneficiary: string;
  co2AmountGrams: number;
  co2AmountKg: number;
  co2AmountTons: number;
  timestamp: string;
  travelType: TravelType;
  projectId: string;
  projectName: string;
  projectCountry: string;
  verified: boolean;
  verificationDate: string | null;
  tokenURI: string;
  txHash: string;
  blockNumber: number;
  explorerUrl: string;
  openSeaUrl: string;
}

export type TravelType = 'flight' | 'bus' | 'car' | 'train' | 'ship' | 'other';

export const TRAVEL_TYPE_LABELS: Record<TravelType, string> = {
  flight: 'Vuelo',
  bus: 'Bus',
  car: 'Auto',
  train: 'Tren',
  ship: 'Barco',
  other: 'Otro',
};

// ---- Minting ----
export interface MintRequest {
  compensationId: string;
  walletAddress: string;
}

export interface MintResult {
  success: boolean;
  tokenId: string;
  txHash: string;
  contractAddress: string;
  blockNumber: number;
  gasUsed: string;
  explorerUrl: string;
  openSeaUrl: string;
}

export type MintingStep = 'connect' | 'confirm' | 'minting' | 'success' | 'error';

export interface MintingState {
  step: MintingStep;
  txHash: string | null;
  tokenId: string | null;
  error: string | null;
}

export const MINTING_STEPS: { key: MintingStep; label: string }[] = [
  { key: 'connect', label: 'Conectar Wallet' },
  { key: 'confirm', label: 'Confirmar' },
  { key: 'minting', label: 'Procesando' },
  { key: 'success', label: 'Completado' },
];

// ---- API Responses ----
export interface BlockchainStatusResponse {
  available: boolean;
  contractAddress: string;
  network: string;
  chainId: string;
  totalCertificates: string;
}

export interface CertificateResponse {
  success: boolean;
  hasNFT: boolean;
  certificate: NFTCertificate | null;
}

export interface TotalCO2Info {
  totalGrams: string;
  totalKg: string;
  totalTons: string;
}

export interface WalletCertificatesResponse {
  success: boolean;
  certificates: NFTCertificate[];
  totalCO2: TotalCO2Info | number;
}

export interface RecentMint {
  certificateNumber: string;
  tokenId: string;
  txHash: string | null;
  walletAddress: string | null;
  tonsCompensated: number;
  mintedAt: string | null;
}

export interface BlockchainStatsResponse {
  totalCertificates: number;
  totalCO2Tons: number;
  uniqueHolders: number;
  verifiedCount: number;
  recentMints?: RecentMint[];
  blockchain?: {
    contractAddress: string;
    network: string;
    chainId: string;
    totalCertificates: string;
  } | null;
}

// ---- Verification (public) ----
export interface PublicVerification {
  valid: boolean;
  certificate: NFTCertificate | null;
  blockchain: {
    network: string;
    contractAddress: string;
    txHash: string;
    blockNumber: number;
  } | null;
}
