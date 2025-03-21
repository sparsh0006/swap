'use client';

import { WalletButton } from '../components/WalletButton';
import { SwapForm } from '../components/SwapForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="z-10 w-full max-w-5xl flex flex-col items-center justify-between lg:flex-row">
        <h1 className="text-3xl font-bold mb-8 lg:mb-0">Sonic Token Swap</h1>
        <div className="flex justify-end">
          <WalletButton />
        </div>
      </div>

      <div className="w-full max-w-md mt-12">
        <SwapForm />
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4">
          <h2 className="mb-3 text-2xl font-semibold">
            Connect Wallet
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-80">
            Connect your Solana wallet to get started with swapping tokens.  kuch bhi : updated UI
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4">
          <h2 className="mb-3 text-2xl font-semibold">
            Enter Amount
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-80">
            Specify how much USDC you want to swap for SONIC tokens.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4">
          <h2 className="mb-3 text-2xl font-semibold">
            Swap Tokens
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-80">
            Click swap, sign the transaction, and see your tokens arrive in seconds.
          </p>
        </div>
      </div>
    </main>
  );
}