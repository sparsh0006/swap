import { PublicKey, Connection, VersionedTransaction } from '@solana/web3.js';

// Token addresses
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const SONIC_MINT = 'SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES';
const SLIPPAGE_BPS = 100; // 1%

// Update: Custom RPC endpoint with better reliability
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://solana-mainnet.rpc.extrnode.com';

// Define interfaces for Jupiter API
interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  routes: any[];
  contextSlot: number;
  timeTaken: number;
  routePlan?: any[];
  platformFee?: any;
  priceImpactPct?: string;
}

interface SwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
  computeUnitLimit: number;
  prioritizationType: {
    computeBudget: {
      microLamports: number;
      estimatedMicroLamports: number;
    }
  };
  simulationSlot: number | null;
  dynamicSlippageReport: any | null;
  simulationError: any | null;
  addressesByLookupTableAddress: any | null;
}

// Function to get a quote from Jupiter API
export async function getJupiterQuote(
  inputAmount: number, 
  inputToken: string = USDC_MINT, 
  outputToken: string = SONIC_MINT
): Promise<QuoteResponse> {
  try {
    // Using Jupiter v6 API for mainnet
    const url = new URL('https://quote-api.jup.ag/v6/quote');
    
    // Add query parameters
    url.searchParams.append('inputMint', inputToken);
    url.searchParams.append('outputMint', outputToken);
    url.searchParams.append('amount', inputAmount.toString());
    url.searchParams.append('slippageBps', SLIPPAGE_BPS.toString());
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting quote:', error);
    throw new Error(`Failed to get quote: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Function to get a swap transaction from Jupiter API
export async function getJupiterSwapTransaction(
  quote: QuoteResponse, 
  walletPublicKey: string
): Promise<SwapResponse> {
  try {
    // Using Jupiter v6 API for mainnet
    const url = 'https://quote-api.jup.ag/v6/swap';
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    const requestBody = {
      quoteResponse: quote,
      userPublicKey: walletPublicKey,
      wrapAndUnwrapSol: true, // Handle SOL wrapping/unwrapping
      dynamicComputeUnitLimit: true, // Allow dynamic compute limit
      // Update: Add priority fee to help with transaction confirmation
    //   prioritizationFeeLamports: 500000 // 0.0005 SOL fee to prioritize transaction
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting swap transaction:', error);
    throw new Error(`Failed to get swap transaction: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Function to execute a swap transaction
export async function executeJupiterSwap(
  swapTransaction: string,
  connection: Connection,
  signTransaction: (transaction: VersionedTransaction) => Promise<VersionedTransaction>
): Promise<string> {
  try {
    // Update: Create a new connection with better settings
    const customConnection = new Connection(SOLANA_RPC_URL, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000, // 60 seconds timeout
      disableRetryOnRateLimit: false
    });
    
    // Deserialize the versioned transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    
    // Use VersionedTransaction.deserialize for versioned transactions
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    
    // Sign the transaction
    const signedTransaction = await signTransaction(transaction);
    
    // Send the signed transaction to the network
    // Update: Use custom connection instead of passed connection
    const txid = await customConnection.sendTransaction(signedTransaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 3
    });
    
    console.log('Transaction sent with ID:', txid);
    
    // Wait for confirmation
    const latestBlockhash = await customConnection.getLatestBlockhash('confirmed');
    
    console.log('Confirming transaction...');
    
    // Update: More robust confirmation handling
    const confirmation = await customConnection.confirmTransaction({
      signature: txid,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    }, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction confirmed but failed: ${JSON.stringify(confirmation.value.err)}`);
    }
    
    return txid;
  } catch (error) {
    console.error('Error executing swap:', error);
    throw new Error(`Swap failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}