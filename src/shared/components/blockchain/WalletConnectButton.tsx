/**
 * CompensaTuViaje - Wallet Connect Button
 * Componente para conectar/desconectar wallet
 * Compatible con B2C layout (!important Tailwind classes)
 */

import React, { useState, useEffect } from 'react';
import { Wallet, ChevronDown, ExternalLink, LogOut, Copy, Check, AlertCircle } from 'lucide-react';
import walletService from '../../services/walletService';
import type { WalletState } from '../../../types/blockchain.types';

interface WalletConnectButtonProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  className?: string;
  showBalance?: boolean;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  onConnect,
  onDisconnect,
  className = '',
  showBalance = true
}) => {
  const [walletState, setWalletState] = useState<WalletState>(walletService.getState());
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setWalletState);
    return unsubscribe;
  }, []);

  const handleConnect = async () => {
    try {
      const address = await walletService.connect();
      if (address && onConnect) {
        onConnect(address);
      }
    } catch (error) {
      console.error('Connect error:', error);
    }
  };

  const handleDisconnect = () => {
    walletService.disconnect();
    setShowDropdown(false);
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const handleCopyAddress = async () => {
    if (walletState.address) {
      await navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await walletService.switchChain('polygon');
    } catch (error) {
      console.error('Switch network error:', error);
    }
  };

  // No conectado
  if (!walletState.connected) {
    return (
      <div>
        {!walletService.isMetaMaskInstalled() ? (
          <div className="!text-center">
            <div className="!p-4 !bg-yellow-50 !border !border-yellow-200 !rounded-xl !mb-3">
              <p className="!text-yellow-800 !text-sm !font-medium !mb-2">
                🦊 MetaMask no detectado
              </p>
              <p className="!text-yellow-600 !text-xs !mb-3">
                Necesitas la extensión MetaMask para conectar tu wallet.
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="!inline-flex !items-center !gap-2 !px-4 !py-2 !bg-orange-500 !text-white !rounded-lg !text-sm !font-semibold !no-underline hover:!bg-orange-600 !transition"
              >
                <ExternalLink className="!w-4 !h-4" />
                Instalar MetaMask
              </a>
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={walletState.connecting}
            className={`
              !flex !items-center !gap-2 !px-5 !py-2.5
              !bg-gradient-to-r !from-purple-600 !to-blue-600
              hover:!from-purple-700 hover:!to-blue-700
              !text-white !font-semibold !rounded-xl
              !transition-all !duration-200
              !border-0 !cursor-pointer
              disabled:!opacity-50 disabled:!cursor-not-allowed
              !shadow-lg hover:!shadow-xl
              ${className}
            `}
          >
            {walletState.connecting ? (
              <>
                <div className="!w-4 !h-4 !border-2 !border-white !border-t-transparent !rounded-full !animate-spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <Wallet className="!w-4 !h-4" />
                <span>Conectar Wallet</span>
              </>
            )}
          </button>
        )}

        {/* Error message for not-connected state */}
        {walletState.error && (
          <div className="!mt-3 !p-3 !bg-red-50 !border !border-red-200 !rounded-xl">
            <p className="!text-sm !text-red-600">{walletState.error}</p>
          </div>
        )}
      </div>
    );
  }

  // Verificar red correcta
  const isCorrectNetwork = walletState.isCorrectChain;

  // Conectado
  return (
    <div className="!relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`
          !flex !items-center !gap-2 !px-4 !py-2.5
          !bg-slate-800 hover:!bg-slate-700
          !text-white !font-medium !rounded-xl
          !border !border-slate-600
          !transition-all !duration-200
          !cursor-pointer
          ${className}
        `}
      >
        {/* Indicador de estado */}
        <div className={`!w-2.5 !h-2.5 !rounded-full ${isCorrectNetwork ? '!bg-green-500' : '!bg-yellow-500'}`} />

        {/* Dirección */}
        <span className="!font-mono !text-sm">
          {walletState.address ? walletService.shortenAddress(walletState.address) : ''}
        </span>

        {/* Balance */}
        {showBalance && walletState.balance && (
          <span className="!text-slate-400 !text-sm">
            {walletState.balance} MATIC
          </span>
        )}

        <ChevronDown className={`!w-4 !h-4 !transition-transform ${showDropdown ? '!rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Overlay */}
          <div
            className="!fixed !inset-0 !z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Menu */}
          <div className="!absolute !right-0 !mt-2 !w-64 !bg-slate-800 !rounded-xl !shadow-2xl !border !border-slate-700 !z-50 !overflow-hidden">
            {/* Network Warning */}
            {!isCorrectNetwork && (
              <div className="!p-3 !border-b !border-slate-700 !bg-yellow-900/20">
                <div className="!flex !items-start !gap-2 !text-yellow-500 !text-sm">
                  <AlertCircle className="!w-4 !h-4 !mt-0.5 !flex-shrink-0" />
                  <div>
                    <p className="!font-medium">Red incorrecta</p>
                    <button
                      onClick={handleSwitchNetwork}
                      className="!text-yellow-400 hover:!text-yellow-300 !underline !bg-transparent !border-0 !cursor-pointer !p-0 !text-sm"
                    >
                      Cambiar a Polygon
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="!p-3 !border-b !border-slate-700">
              <p className="!text-xs !text-slate-400 !mb-1">Dirección</p>
              <div className="!flex !items-center !gap-2">
                <code className="!text-sm !text-white !font-mono !flex-1 !truncate">
                  {walletState.address}
                </code>
                <button
                  onClick={handleCopyAddress}
                  className="!p-1.5 hover:!bg-slate-700 !rounded-lg !text-slate-400 hover:!text-white !bg-transparent !border-0 !cursor-pointer"
                >
                  {copied ? <Check className="!w-4 !h-4 !text-green-500" /> : <Copy className="!w-4 !h-4" />}
                </button>
              </div>
            </div>

            {/* Balance */}
            {walletState.balance && (
              <div className="!p-3 !border-b !border-slate-700">
                <p className="!text-xs !text-slate-400 !mb-1">Balance</p>
                <p className="!text-lg !font-semibold !text-white">
                  {walletState.balance} MATIC
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="!p-2">
              <a
                href={walletState.address ? walletService.getExplorerUrl(walletState.address) : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="!flex !items-center !gap-2 !px-3 !py-2 !text-sm !text-slate-300 hover:!bg-slate-700 !rounded-lg !w-full !no-underline"
              >
                <ExternalLink className="!w-4 !h-4" />
                Ver en Polygonscan
              </a>

              <button
                onClick={handleDisconnect}
                className="!flex !items-center !gap-2 !px-3 !py-2 !text-sm !text-red-400 hover:!bg-slate-700 !rounded-lg !w-full !bg-transparent !border-0 !cursor-pointer"
              >
                <LogOut className="!w-4 !h-4" />
                Desconectar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Error message */}
      {walletState.error && (
        <div className="!absolute !top-full !left-0 !right-0 !mt-2 !p-2 !bg-red-50 !border !border-red-200 !rounded-xl !z-50">
          <p className="!text-sm !text-red-600">{walletState.error}</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;
