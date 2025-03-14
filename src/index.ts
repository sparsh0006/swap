import { Connection, PublicKey, Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

// Configuration constants - updated for mainnet
const MAINNET_URL = 'https://api.mainnet-beta.solana.com';
const INPUT_TOKEN_MINT = process.env.INPUT_TOKEN_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC
const OUTPUT_TOKEN_MINT = process.env.OUTPUT_TOKEN_MINT || 'SonicxvLud67EceaEzCLRnMTBqzYUUYNr93DBkBdDES'; // SONIC
const SLIPPAGE_BPS = 100; // 1%
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

// Utility function to load wallet from private key
function loadWalletFromPrivateKey(privateKeyBase58: string): Keypair {
  const privateKey = bs58.decode(privateKeyBase58);
  return Keypair.fromSecretKey(privateKey);
}

// Load wallet
const wallet = loadWalletFromPrivateKey(PRIVATE_KEY);

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

// Jupiter service implementation for mainnet
class JupiterService {
  private connection: Connection;

  constructor(private userWallet: Keypair) {
    // Using mainnet connection with commitment level
    this.connection = new Connection(MAINNET_URL, 'confirmed');
  }

  async getQuote(inputAmount: number): Promise<QuoteResponse> {
    try {
      // Using Jupiter v6 API for mainnet
      const url = new URL('https://quote-api.jup.ag/v6/quote');
      
      // Add query parameters
      url.searchParams.append('inputMint', INPUT_TOKEN_MINT);
      url.searchParams.append('outputMint', OUTPUT_TOKEN_MINT);
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
      
      const quote = await response.json();
      console.log(`Found route: ${inputAmount} USDC → ${parseInt(quote.outAmount) / 1000000000} SONIC`);
      return quote;
    } catch (error) {
      console.error('Error getting quote:', error);
      throw new Error(`Failed to get quote: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getSwapTransaction(quote: QuoteResponse): Promise<SwapResponse> {
    try {
      // Using Jupiter v6 API for mainnet
      const url = 'https://quote-api.jup.ag/v6/swap';
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      const requestBody = {
        quoteResponse: quote,
        userPublicKey: this.userWallet.publicKey.toString(),
        wrapAndUnwrapSol: true, // Handle SOL wrapping/unwrapping
        dynamicComputeUnitLimit: true // Allow dynamic compute limit
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

  async executeSwap(inputAmount: number): Promise<string> {
    try {
      // Get quote
      const quote = await this.getQuote(inputAmount);
      
      // Get swap transaction
      const swapResponse = await this.getSwapTransaction(quote);
      
      if (!swapResponse.swapTransaction) {
        throw new Error('No swap transaction returned from API');
      }
      
      // Deserialize the versioned transaction
      const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
      
      // Use VersionedTransaction.deserialize for versioned transactions
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      
      // Sign the transaction with our wallet
      transaction.sign([this.userWallet]);
      
      // Get latest blockhash for transaction confirmation
      const latestBlockhash = await this.connection.getLatestBlockhash();
      
      // Send the transaction
      console.log('Sending transaction to the network...');
      const txid = await this.connection.sendTransaction(transaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3
      });
      
      console.log(`Transaction sent with ID: ${txid}`);
      console.log(`Confirming transaction...`);
      
      const confirmation = await this.connection.confirmTransaction({
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
}

// Function to prompt for amount input
async function promptForAmount(): Promise<number> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter USDC amount to swap (e.g. 2 for 2 USDC): ', (answer) => {
      rl.close();
      const amount = parseFloat(answer);
      // USDC has 6 decimal places
      const rawAmount = Math.floor(amount * 1000000);
      resolve(rawAmount);
    });
  });
}

// Function to parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params: Record<string, string> = {};
  
  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      const key = args[i].slice(2);
      params[key] = args[i + 1];
    }
  }
  
  return params;
}

// Main execution function
async function main() {
  try {
    console.log('Initializing Solana mainnet swap with Jupiter API');
    console.log(`Using mainnet URL: ${MAINNET_URL}`);
    
    console.log(`Wallet public key: ${wallet.publicKey.toString()}`);
    
    if (!PRIVATE_KEY) {
      throw new Error('Private key not provided. Please check your .env file.');
    }
    
    // Parse command line arguments
    const args = parseArgs();
    
    // Get the swap amount - either from args, prompt, or default
    let amountToSwap: number;
    
    if (args.amount) {
      amountToSwap = parseInt(args.amount);
    } else {
      amountToSwap = await promptForAmount();
    }
    
    // Store token variables
    const inputToken = args.inputToken || INPUT_TOKEN_MINT;
    const outputToken = args.outputToken || OUTPUT_TOKEN_MINT;
    
    console.log(`Input token: ${inputToken} (USDC)`);
    console.log(`Output token: ${outputToken} (SONIC)`);
    console.log(`Amount to swap: ${amountToSwap / 1000000} USDC (${amountToSwap} base units)`);
    
    // Create Jupiter service
    const jupiterService = new JupiterService(wallet);
    
    // Execute the swap
    console.log(`Attempting to swap ${amountToSwap / 1000000} USDC for SONIC...`);
    const txid = await jupiterService.executeSwap(amountToSwap);
    
    console.log('Swap completed successfully!');
    console.log('Transaction ID:', txid);
    console.log(`You can view this transaction on the Solana Explorer: https://explorer.solana.com/tx/${txid}`);
  } catch (error) {
    console.error('Error executing swap:', error);
  }
}

// Execute the main function
main();