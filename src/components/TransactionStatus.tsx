'use client';

import { FC } from 'react';

interface TransactionStatusProps {
  txId: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}

export const TransactionStatus: FC<TransactionStatusProps> = ({ txId, status, error }) => {
  if (status === 'idle') {
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="mt-4 p-4 bg-blue-100 rounded-md">
        <p className="text-blue-800 font-medium">Transaction in progress...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mt-4 p-4 bg-red-100 rounded-md">
        <p className="text-red-800 font-medium">Transaction failed</p>
        {error && <p className="text-red-700 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  if (status === 'success' && txId) {
    const explorerLink = `https://solscan.io/tx/${txId}`;
    
    return (
      <div className="mt-4 p-4 bg-green-100 rounded-md">
        <p className="text-green-800 font-medium tx-success">Transaction successful!</p>
        <p className="mt-2">
          Transaction ID: <span className="font-mono text-sm break-all">{txId}</span>
        </p>
        <p className="mt-2">
          <a 
            href={explorerLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="tx-link"
          >
            View on txn. on SolScan
          </a>
        </p>
      </div>
    );
  }

  return null;
};