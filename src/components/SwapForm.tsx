'use client';

import { FC, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TransactionStatus } from './TransactionStatus';
import { getJupiterQuote, getJupiterSwapTransaction, executeJupiterSwap } from '../lib/jupiter';

export const SwapForm: FC = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  
  const [amount, setAmount] = useState<string>('');
  const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    if (value.split('.').length > 2) {
      return;
    }
    
    // Limit to 6 decimal places (USDC precision)
    const parts = value.split('.');
    if (parts.length > 1 && parts[1].length > 6) {
      return;
    }
    
    setAmount(value);
  };

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setTxStatus('error');
      return;
    }

    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      setTxStatus('error');
      return;
    }

    try {
      setTxStatus('loading');
      setError('');
      
      // Convert amount to USDC base units (6 decimals)
      const amountInBaseUnits = Math.floor(parseFloat(amount) * 1_000_000);
      
      // Get quote from Jupiter
      const quote = await getJupiterQuote(amountInBaseUnits);
      
      // Get swap transaction
      const swapResponse = await getJupiterSwapTransaction(quote, publicKey.toString());
      
      if (!swapResponse.swapTransaction) {
        throw new Error('No swap transaction returned from API');
      }
      
      // Execute the swap
      const transactionId = await executeJupiterSwap(
        swapResponse.swapTransaction,
        connection,
        signTransaction
      );
      
      setTxId(transactionId);
      setTxStatus('success');
    } catch (err) {
      console.error('Swap error:', err);
      setTxStatus('error');
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const isConnected = !!publicKey;
  const expectedOutput = isConnected && amount && parseFloat(amount) > 0 
    ? `≈ ${parseFloat(amount) * 4} SONIC` // Rough estimate based on exchange rate
    : null;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-center">Swap USDC to SONIC</h2>
      
      <div className="mb-6">
        <label htmlFor="amount" className="block text-sm font-medium mb-2">
          Amount (USDC)
        </label>
        <input
          id="amount"
          type="text"
          className="amount-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter amount (e.g., 2)"
          value={amount}
          onChange={handleAmountChange}
          disabled={!isConnected || txStatus === 'loading'}
        />
        {expectedOutput && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {expectedOutput}
          </p>
        )}
      </div>
      
      <button
        className="swap-button w-full"
        onClick={handleSwap}
        disabled={!isConnected || !amount || parseFloat(amount) <= 0 || txStatus === 'loading'}
      >
        {txStatus === 'loading' ? 'Processing...' : 'Swap USDC to SONIC'}
      </button>
      
      <TransactionStatus
        txId={txId}
        status={txStatus}
        error={error}
      />
      
      {!isConnected && (
        <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
          Please connect your wallet to swap tokens
        </p>
      )}
    </div>
  );
};