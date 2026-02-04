/**
 * CompensaTuViaje - Web3 Wallet Service
 * Servicio para conectar wallets (MetaMask, WalletConnect, etc.)
 */

import type { 
  WalletState, 
  WalletProvider, 
  WalletType,
  BlockchainConfig,
  SupportedChain,
  SUPPORTED_CHAINS
} from '../../types/blockchain.types';

// Chains soportadas
const CHAINS: Record<SupportedChain, BlockchainConfig> = {
  'polygon': {
    chainId: 137,
    chainName: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS_POLYGON || '',
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
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS_AMOY || '',
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
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS_LOCAL || '',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Target chain (configurable)
const TARGET_CHAIN: SupportedChain = (import.meta.env.VITE_BLOCKCHAIN_NETWORK as SupportedChain) || 'polygon-amoy';

class WalletService {
  private ethereum: any = null;
  private state: WalletState = {
    isConnected: false,
    isConnecting: false,
    address: null,
    chainId: null,
    balance: null,
    error: null
  };
  private listeners: Set<(state: WalletState) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.ethereum = (window as any).ethereum;
      this.setupEventListeners();
      this.checkConnection();
    }
  }

  /**
   * Suscribirse a cambios de estado
   */
  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notificar cambios
   */
  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Actualizar estado
   */
  private setState(updates: Partial<WalletState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.ethereum) return;

    this.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.setState({ address: accounts[0] });
        this.updateBalance();
      }
    });

    this.ethereum.on('chainChanged', (chainId: string) => {
      this.setState({ chainId: parseInt(chainId, 16) });
      this.updateBalance();
    });

    this.ethereum.on('disconnect', () => {
      this.disconnect();
    });
  }

  /**
   * Verificar conexión existente
   */
  private async checkConnection(): Promise<void> {
    if (!this.ethereum) return;

    try {
      const accounts = await this.ethereum.request({ method: 'eth_accounts' });
      const chainId = await this.ethereum.request({ method: 'eth_chainId' });

      if (accounts.length > 0) {
        this.setState({
          isConnected: true,
          address: accounts[0],
          chainId: parseInt(chainId, 16)
        });
        await this.updateBalance();
      }
    } catch (error) {
      console.error('Check connection error:', error);
    }
  }

  /**
   * Obtener providers disponibles
   */
  getAvailableProviders(): WalletProvider[] {
    const providers: WalletProvider[] = [];

    // MetaMask
    if (typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask) {
      providers.push({
        name: 'MetaMask',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
        installed: true,
        provider: (window as any).ethereum
      });
    } else {
      providers.push({
        name: 'MetaMask',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
        installed: false,
        provider: null
      });
    }

    // Coinbase Wallet
    if (typeof window !== 'undefined' && (window as any).ethereum?.isCoinbaseWallet) {
      providers.push({
        name: 'Coinbase Wallet',
        icon: 'https://www.coinbase.com/favicon.ico',
        installed: true,
        provider: (window as any).ethereum
      });
    }

    return providers;
  }

  /**
   * Verificar si MetaMask está instalado
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && Boolean((window as any).ethereum?.isMetaMask);
  }

  /**
   * Conectar wallet
   */
  async connect(providerType: WalletType = 'metamask'): Promise<WalletState> {
    if (!this.ethereum) {
      this.setState({ error: 'Por favor instala MetaMask u otra wallet compatible' });
      throw new Error('No wallet provider found');
    }

    this.setState({ isConnecting: true, error: null });

    try {
      // Solicitar cuentas
      const accounts = await this.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Obtener chainId
      const chainId = await this.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);

      // Verificar si está en la red correcta
      const targetConfig = CHAINS[TARGET_CHAIN];
      if (currentChainId !== targetConfig.chainId) {
        await this.switchChain(TARGET_CHAIN);
      }

      this.setState({
        isConnected: true,
        isConnecting: false,
        address: accounts[0],
        chainId: targetConfig.chainId
      });

      await this.updateBalance();

      return this.state;
    } catch (error: any) {
      const errorMessage = error.code === 4001 
        ? 'Conexión rechazada por el usuario'
        : error.message || 'Error al conectar wallet';
      
      this.setState({ 
        isConnecting: false, 
        error: errorMessage 
      });
      throw new Error(errorMessage);
    }
  }

  /**
   * Desconectar wallet
   */
  disconnect(): void {
    this.setState({
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
      error: null
    });
  }

  /**
   * Cambiar de red
   */
  async switchChain(chain: SupportedChain): Promise<void> {
    if (!this.ethereum) throw new Error('No wallet provider');

    const config = CHAINS[chain];
    const chainIdHex = `0x${config.chainId.toString(16)}`;

    try {
      await this.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }]
      });
    } catch (error: any) {
      // Si la red no existe, agregarla
      if (error.code === 4902) {
        await this.addChain(chain);
      } else {
        throw error;
      }
    }
  }

  /**
   * Agregar red
   */
  async addChain(chain: SupportedChain): Promise<void> {
    if (!this.ethereum) throw new Error('No wallet provider');

    const config = CHAINS[chain];
    const chainIdHex = `0x${config.chainId.toString(16)}`;

    await this.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: chainIdHex,
        chainName: config.chainName,
        rpcUrls: [config.rpcUrl],
        blockExplorerUrls: [config.explorerUrl],
        nativeCurrency: config.nativeCurrency
      }]
    });
  }

  /**
   * Actualizar balance
   */
  async updateBalance(): Promise<void> {
    if (!this.ethereum || !this.state.address) return;

    try {
      const balance = await this.ethereum.request({
        method: 'eth_getBalance',
        params: [this.state.address, 'latest']
      });

      // Convertir de wei a ether
      const balanceInEth = parseInt(balance, 16) / 1e18;
      this.setState({ balance: balanceInEth.toFixed(4) });
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  }

  /**
   * Obtener estado actual
   */
  getState(): WalletState {
    return this.state;
  }

  /**
   * Obtener dirección corta
   */
  getShortAddress(): string {
    if (!this.state.address) return '';
    return `${this.state.address.slice(0, 6)}...${this.state.address.slice(-4)}`;
  }

  /**
   * Obtener configuración de red actual
   */
  getChainConfig(): BlockchainConfig | null {
    if (!this.state.chainId) return null;
    
    for (const [, config] of Object.entries(CHAINS)) {
      if (config.chainId === this.state.chainId) {
        return config;
      }
    }
    return null;
  }

  /**
   * Verificar si está en la red correcta
   */
  isCorrectNetwork(): boolean {
    const targetConfig = CHAINS[TARGET_CHAIN];
    return this.state.chainId === targetConfig.chainId;
  }

  /**
   * Obtener red objetivo
   */
  getTargetChain(): BlockchainConfig {
    return CHAINS[TARGET_CHAIN];
  }

  /**
   * Firmar mensaje (para verificación de propiedad)
   */
  async signMessage(message: string): Promise<string> {
    if (!this.ethereum || !this.state.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.ethereum.request({
        method: 'personal_sign',
        params: [message, this.state.address]
      });
      return signature;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Firma rechazada por el usuario');
      }
      throw error;
    }
  }

  /**
   * Obtener URL del explorador para una dirección
   */
  getAddressExplorerUrl(address?: string): string {
    const config = CHAINS[TARGET_CHAIN];
    return `${config.explorerUrl}/address/${address || this.state.address}`;
  }

  /**
   * Obtener URL del explorador para una transacción
   */
  getTransactionExplorerUrl(txHash: string): string {
    const config = CHAINS[TARGET_CHAIN];
    return `${config.explorerUrl}/tx/${txHash}`;
  }
}

// Singleton
const walletService = new WalletService();

export default walletService;
export { CHAINS, TARGET_CHAIN };
