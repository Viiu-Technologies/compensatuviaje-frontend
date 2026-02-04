/**
 * CompensaTuViaje - Blockchain Types
 * Tipos TypeScript para la integración blockchain/NFT
 */

// ============================================
// Blockchain Config
// ============================================

export interface BlockchainConfig {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  explorerUrl: string;
  contractAddress: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export type SupportedChain = 'polygon' | 'polygon-amoy' | 'localhost';

// ============================================
// Wallet
// ============================================

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  error: string | null;
}

export interface WalletProvider {
  name: string;
  icon: string;
  installed: boolean;
  provider: any;
}

export type WalletType = 'metamask' | 'walletconnect' | 'coinbase';

// ============================================
// NFT Certificate
// ============================================

export interface NFTCertificate {
  tokenId: string;
  compensationId: string;
  beneficiary: string;
  currentOwner: string;
  co2Amount: string; // en gramos
  co2AmountKg: number;
  timestamp: string;
  travelType: TravelType;
  projectId: string;
  projectName: string;
  projectCountry: string;
  verified: boolean;
  verificationDate: string | null;
  tokenUri: string;
  metadata?: NFTMetadata;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: NFTAttribute[];
  properties: {
    compensationId: string;
    co2AmountGrams: number;
    travelType: string;
    projectId: string;
    projectName: string;
    projectCountry: string;
    compensationDate: string;
    verificationStatus: string;
  };
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export type TravelType = 'flight' | 'bus' | 'car' | 'train' | 'ferry' | 'other';

// ============================================
// Minting
// ============================================

export interface MintRequest {
  compensationId: string;
  walletAddress: string;
}

export interface MintResult {
  success: boolean;
  tokenId?: string;
  transactionHash?: string;
  contractAddress?: string;
  blockNumber?: number;
  gasUsed?: string;
  metadataUri?: string;
  explorerUrl?: string;
  openSeaUrl?: string;
  error?: string;
}

export interface MintingState {
  status: 'idle' | 'preparing' | 'uploading_metadata' | 'confirming' | 'minting' | 'success' | 'error';
  step: number;
  totalSteps: number;
  message: string;
  transactionHash?: string;
  tokenId?: string;
  error?: string;
}

// ============================================
// Verification
// ============================================

export interface TransactionVerification {
  found: boolean;
  status?: 'success' | 'failed' | 'pending';
  blockNumber?: number;
  blockHash?: string;
  transactionHash?: string;
  from?: string;
  to?: string;
  gasUsed?: string;
}

export interface CertificateVerification {
  isValid: boolean;
  isOnChain: boolean;
  certificateData?: NFTCertificate;
  transactionVerification?: TransactionVerification;
  explorerUrl?: string;
  openSeaUrl?: string;
}

// ============================================
// Wallet Balance & Stats
// ============================================

export interface WalletCertificates {
  address: string;
  totalCO2: {
    totalGrams: string;
    totalKg: string;
    totalTons: string;
  };
  certificatesCount: number;
  certificates: NFTCertificate[];
}

export interface BlockchainStats {
  available: boolean;
  contractAddress?: string;
  network?: string;
  chainId?: string;
  totalCertificates?: string;
}

// ============================================
// API Responses
// ============================================

export interface BlockchainStatusResponse {
  available: boolean;
  contractAddress?: string;
  network?: string;
  chainId?: string;
  totalCertificates?: string;
  message?: string;
}

export interface CertificateResponse {
  success: boolean;
  hasNFT: boolean;
  certificate?: NFTCertificate;
  compensation?: {
    id: string;
    co2Amount: number;
    projectName: string;
    status: string;
    canMintNFT: boolean;
  };
  explorerUrl?: string;
  openSeaUrl?: string;
  error?: string;
}

export interface MintResponse {
  success: boolean;
  message?: string;
  result?: MintResult;
  error?: string;
}

export interface VerifyTransactionResponse {
  success: boolean;
  verification?: TransactionVerification;
  explorerUrl?: string;
  error?: string;
}

export interface WalletCertificatesResponse {
  success: boolean;
  address: string;
  totalCO2: {
    totalGrams: string;
    totalKg: string;
    totalTons: string;
  };
  certificatesCount: number;
  certificates: NFTCertificate[];
  error?: string;
}

// ============================================
// Events
// ============================================

export interface BlockchainEvent {
  type: 'connect' | 'disconnect' | 'accountsChanged' | 'chainChanged' | 'mint' | 'transfer';
  data: any;
  timestamp: Date;
}

// ============================================
// UI State
// ============================================

export interface NFTViewerState {
  certificate: NFTCertificate | null;
  isLoading: boolean;
  error: string | null;
  showDetails: boolean;
  showQR: boolean;
}

export interface WalletModalState {
  isOpen: boolean;
  selectedProvider: WalletType | null;
  isConnecting: boolean;
  error: string | null;
}

// ============================================
// Constants
// ============================================

export const SUPPORTED_CHAINS: Record<SupportedChain, BlockchainConfig> = {
  'polygon': {
    chainId: 137,
    chainName: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    contractAddress: '', // Se setea desde env
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  'polygon-amoy': {
    chainId: 80002,
    chainName: 'Polygon Amoy Testnet',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    explorerUrl: 'https://amoy.polygonscan.com',
    contractAddress: '', // Se setea desde env
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  'localhost': {
    chainId: 31337,
    chainName: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    explorerUrl: 'http://localhost:8545',
    contractAddress: '',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

export const TRAVEL_TYPE_LABELS: Record<TravelType, string> = {
  flight: 'Vuelo',
  bus: 'Bus',
  car: 'Automóvil',
  train: 'Tren',
  ferry: 'Ferry',
  other: 'Otro'
};

export const MINTING_STEPS = [
  { id: 1, label: 'Preparando datos', description: 'Verificando compensación' },
  { id: 2, label: 'Subiendo metadata', description: 'Almacenando en IPFS' },
  { id: 3, label: 'Confirmando', description: 'Esperando firma de wallet' },
  { id: 4, label: 'Minteando', description: 'Creando NFT en blockchain' },
  { id: 5, label: 'Completado', description: 'NFT creado exitosamente' }
];
