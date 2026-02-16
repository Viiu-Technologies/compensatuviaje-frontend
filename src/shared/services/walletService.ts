// ============================================
// Wallet Service - MetaMask / Polygon Integration
// Singleton service para conexión Web3
// ============================================

import {
  WalletState,
  INITIAL_WALLET_STATE,
  ACTIVE_CHAIN,
  CHAIN_CONFIGS,
  type SupportedChain,
} from '../../types/blockchain.types';

type WalletListener = (state: WalletState) => void;

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      selectedAddress: string | null;
    };
  }
}

class WalletService {
  private state: WalletState = { ...INITIAL_WALLET_STATE };
  private listeners: Set<WalletListener> = new Set();
  private chain = CHAIN_CONFIGS[ACTIVE_CHAIN];

  // ---- State management ----

  getState(): WalletState {
    return { ...this.state };
  }

  subscribe(listener: WalletListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(partial: Partial<WalletState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.getState()));
  }

  // ---- Detection ----

  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
  }

  // ---- Connect ----

  async connect(): Promise<string> {
    if (!this.isMetaMaskInstalled()) {
      this.setState({ error: 'MetaMask no está instalado. Instálalo desde metamask.io' });
      throw new Error('MetaMask not installed');
    }

    this.setState({ connecting: true, error: null });

    try {
      const accounts = (await window.ethereum!.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts.length) throw new Error('No accounts returned');

      const address = accounts[0];
      const chainId = parseInt(
        (await window.ethereum!.request({ method: 'eth_chainId' })) as string,
        16
      );

      const isCorrectChain = chainId === this.chain.chainId;

      if (!isCorrectChain) {
        await this.switchChain();
      }

      const balance = await this.fetchBalance(address);

      this.setState({
        connected: true,
        address,
        chainId: this.chain.chainId,
        balance,
        isCorrectChain: true,
        connecting: false,
      });

      this.registerListeners();
      return address;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar wallet';
      this.setState({ connecting: false, error: msg });
      throw err;
    }
  }

  // ---- Disconnect ----

  disconnect() {
    this.removeListeners();
    this.setState({ ...INITIAL_WALLET_STATE });
  }

  // ---- Chain switching ----

  async switchChain(target: SupportedChain = ACTIVE_CHAIN): Promise<void> {
    const cfg = CHAIN_CONFIGS[target];
    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: cfg.chainIdHex }],
      });
    } catch (switchError: unknown) {
      const err = switchError as { code: number };
      if (err.code === 4902) {
        // Chain not added — add it
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: cfg.chainIdHex,
              chainName: cfg.name,
              nativeCurrency: cfg.nativeCurrency,
              rpcUrls: [cfg.rpcUrl],
              blockExplorerUrls: cfg.blockExplorer ? [cfg.blockExplorer] : undefined,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  // ---- Balance ----

  private async fetchBalance(address: string): Promise<string> {
    try {
      const raw = (await window.ethereum!.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      })) as string;
      const wei = BigInt(raw);
      const matic = Number(wei) / 1e18;
      return matic.toFixed(4);
    } catch {
      return '0';
    }
  }

  // ---- Event listeners ----

  private handleAccountsChanged = (accounts: unknown) => {
    const accts = accounts as string[];
    if (accts.length === 0) {
      this.disconnect();
    } else {
      this.setState({ address: accts[0] });
      this.fetchBalance(accts[0]).then((b) => this.setState({ balance: b }));
    }
  };

  private handleChainChanged = (chainIdHex: unknown) => {
    const chainId = parseInt(chainIdHex as string, 16);
    const isCorrectChain = chainId === this.chain.chainId;
    this.setState({ chainId, isCorrectChain });
  };

  private registerListeners() {
    if (!window.ethereum) return;
    window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    window.ethereum.on('chainChanged', this.handleChainChanged);
  }

  private removeListeners() {
    if (!window.ethereum) return;
    window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', this.handleChainChanged);
  }

  // ---- Helpers ----

  getExplorerUrl(txHash: string): string {
    return `${this.chain.blockExplorer}/tx/${txHash}`;
  }

  getTokenUrl(tokenId: string): string {
    return `${this.chain.openSeaBase}/${this.chain.contractAddress}/${tokenId}`;
  }

  shortenAddress(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }
}

// Singleton
const walletService = new WalletService();
export default walletService;
