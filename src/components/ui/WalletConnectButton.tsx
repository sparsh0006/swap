"use client";

import { useState } from 'react';
import { useWeb3 } from '@/lib/web3'; // You'll need to create this hook

const WalletConnectButton = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect, disconnect, account } = useWeb3();
  
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <button 
      onClick={account ? disconnect : handleConnect}
      className="wallet-btn"
    >
      {isConnecting 
        ? 'Connecting...'
        : account 
          ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` 
          : 'Connect Wallet'
      }
    </button>
  );
};

export default WalletConnectButton;