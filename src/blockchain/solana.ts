// Solana blockchain integration for Bife DeFi operations
// Handles wallet connections, transactions, and Jupiter aggregator integration

import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
} from '@solana/web3.js';
import { 
  Token, 
  DeFiOperation, 
  OperationType, 
  OperationStatus,
  Portfolio,
  PortfolioToken,
  StakingPosition 
} from '@types/index';

export interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

export interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
}

export interface JupiterSwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
}

export class SolanaService {
  private connection: Connection;
  private wallet: WalletAdapter | null = null;
  private jupiterApiUrl: string;
  private networkUrl: string;

  constructor() {
    this.networkUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.jupiterApiUrl = process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6';
    
    this.connection = new Connection(this.networkUrl, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });

    console.log(`Solana service initialized with network: ${this.networkUrl}`);
  }

  // Wallet Management
  connectWallet(walletAdapter: WalletAdapter): void {
    this.wallet = walletAdapter;
    console.log('Wallet connected:', walletAdapter.publicKey?.toString());
  }

  disconnectWallet(): void {
    this.wallet = null;
    console.log('Wallet disconnected');
  }

  getWalletAddress(): string | null {
    return this.wallet?.publicKey?.toString() || null;
  }

  isWalletConnected(): boolean {
    return this.wallet?.connected || false;
  }

  // Balance and Portfolio
  async getSOLBalance(address?: string): Promise<number> {
    const publicKey = address ? new PublicKey(address) : this.wallet?.publicKey;
    if (!publicKey) {
      throw new Error('No wallet address provided');
    }

    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Failed to fetch SOL balance:', error);
      throw new Error('Failed to fetch SOL balance');
    }
  }

  async getTokenBalance(tokenMint: string, address?: string): Promise<number> {
    const publicKey = address ? new PublicKey(address) : this.wallet?.publicKey;
    if (!publicKey) {
      throw new Error('No wallet address provided');
    }

    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: new PublicKey(tokenMint) }
      );

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance || 0;
    } catch (error) {
      console.error('Failed to fetch token balance:', error);
      return 0;
    }
  }

  async getPortfolio(address?: string): Promise<Portfolio> {
    const walletAddress = address || this.getWalletAddress();
    if (!walletAddress) {
      throw new Error('No wallet connected');
    }

    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Get SOL balance
      const solBalance = await this.getSOLBalance(walletAddress);
      
      // Get all token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      const tokens: PortfolioToken[] = [];
      let totalValue = solBalance * await this.getSOLPrice();

      // Add SOL as first token
      tokens.push({
        token: {
          address: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          name: 'Solana',
          decimals: 9,
          price: await this.getSOLPrice(),
        },
        balance: solBalance,
        value: solBalance * await this.getSOLPrice(),
        percentage: 0, // Will be calculated later
      });

      // Process token accounts
      for (const account of tokenAccounts.value) {
        const tokenAmount = account.account.data.parsed.info.tokenAmount;
        const mint = account.account.data.parsed.info.mint;
        
        if (tokenAmount.uiAmount > 0) {
          const tokenInfo = await this.getTokenInfo(mint);
          const tokenPrice = await this.getTokenPrice(mint);
          const tokenValue = tokenAmount.uiAmount * tokenPrice;
          
          tokens.push({
            token: {
              address: mint,
              symbol: tokenInfo.symbol,
              name: tokenInfo.name,
              decimals: tokenAmount.decimals,
              price: tokenPrice,
            },
            balance: tokenAmount.uiAmount,
            value: tokenValue,
            percentage: 0, // Will be calculated later
          });
          
          totalValue += tokenValue;
        }
      }

      // Calculate percentages
      tokens.forEach(token => {
        token.percentage = (token.value / totalValue) * 100;
      });

      // Get staking positions (placeholder - implement actual staking query)
      const stakingPositions: StakingPosition[] = [];

      return {
        userId: walletAddress,
        totalValue,
        tokens,
        stakingPositions,
        pnl24h: 0, // TODO: Calculate from price history
        pnlTotal: 0, // TODO: Calculate from transaction history
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      throw new Error('Failed to fetch portfolio data');
    }
  }

  // Jupiter Aggregator Integration
  async getSwapQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<JupiterQuoteResponse> {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
        feeBps: '0',
        maxAccounts: '64',
      });

      const response = await fetch(`${this.jupiterApiUrl}/quote?${params}`);
      
      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.statusText}`);
      }

      const quote = await response.json();
      return quote;
    } catch (error) {
      console.error('Failed to get swap quote:', error);
      throw new Error('Failed to get swap quote from Jupiter');
    }
  }

  async executeSwap(
    quote: JupiterQuoteResponse,
    userPublicKey: string
  ): Promise<JupiterSwapResponse> {
    try {
      const response = await fetch(`${this.jupiterApiUrl}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey,
          wrapAndUnwrapSol: true,
          useSharedAccounts: true,
          feeAccount: undefined,
          trackingAccount: undefined,
          computeUnitPriceMicroLamports: undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Jupiter swap API error: ${response.statusText}`);
      }

      const swapResult = await response.json();
      return swapResult;
    } catch (error) {
      console.error('Failed to execute swap:', error);
      throw new Error('Failed to execute swap transaction');
    }
  }

  async performTokenSwap(
    inputToken: Token,
    outputToken: Token,
    amount: number,
    slippageBps: number = 50
  ): Promise<DeFiOperation> {
    if (!this.wallet || !this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const operation: DeFiOperation = {
      id: this.generateOperationId(),
      type: 'swap',
      status: 'pending',
      inputToken,
      outputToken,
      amount,
      slippage: slippageBps / 10000,
      timestamp: new Date(),
      userId: this.wallet.publicKey.toString(),
    };

    try {
      // Get quote from Jupiter
      console.log(`Getting swap quote: ${amount} ${inputToken.symbol} -> ${outputToken.symbol}`);
      const quote = await this.getSwapQuote(
        inputToken.address,
        outputToken.address,
        amount * Math.pow(10, inputToken.decimals),
        slippageBps
      );

      operation.estimatedValue = parseInt(quote.outAmount) / Math.pow(10, outputToken.decimals);

      // Get swap transaction
      const swapResult = await this.executeSwap(quote, this.wallet.publicKey.toString());
      
      // Deserialize and sign transaction
      const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      
      // Sign transaction
      const signedTransaction = await this.wallet.signTransaction(transaction as any);
      
      operation.status = 'confirming';
      
      // Send transaction
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 3,
        }
      );

      operation.txHash = signature;
      
      // Confirm transaction
      const confirmation = await this.connection.confirmTransaction({
        signature,
        lastValidBlockHeight: swapResult.lastValidBlockHeight,
        blockhash: await this.connection.getLatestBlockhash().then(b => b.blockhash),
      });

      if (confirmation.value.err) {
        operation.status = 'failed';
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      operation.status = 'confirmed';
      console.log(`Swap completed successfully: ${signature}`);
      
      return operation;
    } catch (error) {
      console.error('Token swap failed:', error);
      operation.status = 'failed';
      throw error;
    }
  }

  // Staking Operations
  async stakeSOL(amount: number, validatorAddress: string): Promise<DeFiOperation> {
    if (!this.wallet || !this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const operation: DeFiOperation = {
      id: this.generateOperationId(),
      type: 'stake',
      status: 'pending',
      inputToken: {
        address: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
      },
      amount,
      timestamp: new Date(),
      userId: this.wallet.publicKey.toString(),
    };

    try {
      const validatorPubkey = new PublicKey(validatorAddress);
      const stakingAmount = amount * LAMPORTS_PER_SOL;

      // Create stake account
      const stakeAccount = Keypair.generate();
      
      // Create stake account instruction
      const createStakeAccountIx = SystemProgram.createAccount({
        fromPubkey: this.wallet.publicKey,
        newAccountPubkey: stakeAccount.publicKey,
        lamports: stakingAmount,
        space: 200, // Stake account space
        programId: new PublicKey('Stake11111111111111111111111111111111111111'),
      });

      // TODO: Add delegate stake instruction
      // This is a simplified version - full implementation would include
      // proper stake account creation and delegation instructions

      const transaction = new Transaction().add(createStakeAccountIx);
      
      const signedTransaction = await this.wallet.signTransaction(transaction);
      const signature = await this.connection.sendTransaction(signedTransaction);
      
      operation.txHash = signature;
      operation.status = 'confirming';
      
      // Wait for confirmation
      await this.connection.confirmTransaction(signature);
      operation.status = 'confirmed';
      
      return operation;
    } catch (error) {
      console.error('SOL staking failed:', error);
      operation.status = 'failed';
      throw error;
    }
  }

  // Utility Methods
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getSOLPrice(): Promise<number> {
    try {
      // In production, use a price API like CoinGecko
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      return data.solana.usd;
    } catch (error) {
      console.error('Failed to fetch SOL price:', error);
      return 100; // Fallback price
    }
  }

  private async getTokenPrice(mint: string): Promise<number> {
    try {
      // In production, use Jupiter price API or similar
      const response = await fetch(`https://price.jup.ag/v4/price?ids=${mint}`);
      const data = await response.json();
      return data.data[mint]?.price || 0;
    } catch (error) {
      console.error(`Failed to fetch price for ${mint}:`, error);
      return 0;
    }
  }

  private async getTokenInfo(mint: string): Promise<{ symbol: string; name: string }> {
    try {
      // In production, use a token registry like Solana token list
      const response = await fetch('https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json');
      const tokenList = await response.json();
      
      const token = tokenList.tokens.find((t: any) => t.address === mint);
      if (token) {
        return { symbol: token.symbol, name: token.name };
      }
      
      return { symbol: 'UNKNOWN', name: 'Unknown Token' };
    } catch (error) {
      console.error(`Failed to fetch token info for ${mint}:`, error);
      return { symbol: 'UNKNOWN', name: 'Unknown Token' };
    }
  }

  // Network and Connection
  async getNetworkStatus(): Promise<{
    isHealthy: boolean;
    slot: number;
    blockHeight: number;
    version: string;
  }> {
    try {
      const [slot, blockHeight, version] = await Promise.all([
        this.connection.getSlot(),
        this.connection.getBlockHeight(),
        this.connection.getVersion(),
      ]);

      return {
        isHealthy: true,
        slot,
        blockHeight,
        version: version['solana-core'],
      };
    } catch (error) {
      console.error('Failed to get network status:', error);
      return {
        isHealthy: false,
        slot: 0,
        blockHeight: 0,
        version: 'unknown',
      };
    }
  }

  async getTransactionHistory(address?: string, limit: number = 50): Promise<DeFiOperation[]> {
    const publicKey = address ? new PublicKey(address) : this.wallet?.publicKey;
    if (!publicKey) {
      throw new Error('No wallet address provided');
    }

    try {
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );

      const operations: DeFiOperation[] = [];

      for (const sig of signatures) {
        try {
          const transaction = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (transaction) {
            // Parse transaction to determine operation type
            const operation = this.parseTransactionToOperation(transaction, publicKey.toString());
            if (operation) {
              operations.push(operation);
            }
          }
        } catch (error) {
          console.warn(`Failed to parse transaction ${sig.signature}:`, error);
        }
      }

      return operations;
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      throw new Error('Failed to fetch transaction history');
    }
  }

  private parseTransactionToOperation(transaction: any, userAddress: string): DeFiOperation | null {
    // This is a simplified parser - in production, you'd want more sophisticated
    // transaction parsing to determine the exact operation type and details
    
    const signature = transaction.transaction.signatures[0];
    const timestamp = new Date(transaction.blockTime * 1000);

    // Default operation structure
    const operation: DeFiOperation = {
      id: `tx_${signature}`,
      type: 'swap', // Default type
      status: transaction.meta?.err ? 'failed' : 'confirmed',
      inputToken: {
        address: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
      },
      amount: 0,
      txHash: signature,
      timestamp,
      userId: userAddress,
    };

    // TODO: Implement proper transaction parsing logic
    // This would involve analyzing instruction data to determine:
    // - Operation type (swap, stake, etc.)
    // - Token addresses and amounts
    // - Protocol used (Jupiter, Raydium, etc.)

    return operation;
  }

  dispose(): void {
    this.wallet = null;
    console.log('Solana service disposed');
  }
}

// Singleton instance
export const solanaService = new SolanaService();
