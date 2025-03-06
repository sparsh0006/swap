interface SolanaPublicKey {
    toString: () => string;
    // Add other methods if needed (e.g., toBuffer, equals) based on Phantom’s PublicKey
  }
  
  interface SolanaAccountChangeEvent extends CustomEvent {
    detail: {
      publicKey: SolanaPublicKey | null;
      // Add other properties if Phantom provides them
    };
  }
  
  interface WindowEventMap {
    'solana#accountChanged': SolanaAccountChangeEvent;
  }
  
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: SolanaPublicKey }>;
      disconnect: () => void; // Adjust to Promise<void> if disconnect is async
      isConnected: boolean;
      publicKey?: SolanaPublicKey | null;
    };
  }