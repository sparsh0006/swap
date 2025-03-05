"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SolanaWalletContextType {
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
}

const SolanaWalletContext = createContext<SolanaWalletContextType | undefined>(undefined);

export const SolanaWalletProvider = ({ children }: { children: ReactNode }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const connect = async () => {
    try {
      // Check if Phantom or other Solana wallets are available
      const { solana } = window as any;
      
      if (solana?.isPhantom) {
        const response = await solana.connect();
        const key = response.publicKey.toString();
        setPublicKey(key);
      } else {
        alert('Phantom wallet not found. Please install it from https://phantom.app/');
      }
    } catch (error) {
      console.error('Error connecting to Solana wallet:', error);
    }
  };

  const disconnect = () => {
    try {
      const { solana } = window as any;
      if (solana) {
        solana.disconnect();
        setPublicKey(null);
      }
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
    }
  };

  useEffect(() => {
    // Check if user is already connected
    const checkConnection = async () => {
      const { solana } = window as any;
      if (solana?.isPhantom) {
        try {
          // Check if already connected
          if (solana.isConnected) {
            const resp = await solana.connect({ onlyIfTrusted: true });
            setPublicKey(resp.publicKey.toString());
          }
        } catch (error) {
          // Handle connection error
          console.error("Auto-connection error:", error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    const handleAccountChange = () => {
      const { solana } = window as any;
      if (solana?.isPhantom) {
        if (solana.isConnected && solana.publicKey) {
          setPublicKey(solana.publicKey.toString());
        } else {
          setPublicKey(null);
        }
      }
    };

    window.addEventListener('solana#accountChanged', handleAccountChange);

    return () => {
      window.removeEventListener('solana#accountChanged', handleAccountChange);
    };
  }, []);

  // The explicit return type helps TypeScript understand this is a valid JSX component
  return (
    <SolanaWalletContext.Provider value={{
      publicKey,
      connect,
      disconnect,
      isConnected: !!publicKey
    }}>
      {children}
    </SolanaWalletContext.Provider>
  );
};

export const useSolanaWallet = () => {
  const context = useContext(SolanaWalletContext);
  if (context === undefined) {
    throw new Error('useSolanaWallet must be used within a SolanaWalletProvider');
  }
  return context;
};

// Define the Web3Provider with explicit JSX Element return type
import { JSX } from 'react';
export const Web3Provider = ({ children }: { children: ReactNode }): JSX.Element => {
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
};

export const useWeb3 = useSolanaWallet;