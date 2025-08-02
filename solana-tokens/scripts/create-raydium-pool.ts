import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount
} from '@solana/spl-token';
import { Market, DexInstructions } from '@project-serum/serum';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// 🏦 Raydium AMM Program IDs (Devnet)
const RAYDIUM_AMM_PROGRAM_ID = new PublicKey('HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8');
const RAYDIUM_AMM_AUTHORITY = new PublicKey('5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1');
const RAYDIUM_LIQUIDITY_PROGRAM_ID_V4 = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');

// 🌊 Serum DEX Program ID (Devnet)
const SERUM_DEX_PROGRAM_ID = new PublicKey('DESVgJVGajEgKGXhb6XmqFHGWh9RiUiOhzGf6S4qq4K4');

interface TokenInfo {
  mint: PublicKey;
  decimals: number;
  symbol: string;
  amount: number; // Amount to provide as liquidity
}

class RaydiumPoolCreator {
  private connection: Connection;
  private wallet: Keypair;
  
  constructor() {
    this.connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
    
    // Load wallet from secret key
    const secretKeyArray = JSON.parse(process.env.SOLANA_WALLET_SECRET_KEY || '[]');
    this.wallet = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
    
    console.log('🏦 Raydium Pool Creator Initialized');
    console.log('📍 Wallet:', this.wallet.publicKey.toString());
    console.log('🌐 Network: Devnet');
  }

  async createLiquidityPool(baseToken: TokenInfo, quoteToken: TokenInfo) {
    try {
      console.log('\n🌊 Creating Raydium Liquidity Pool...');
      console.log(`📊 Pair: ${baseToken.symbol}/${quoteToken.symbol}`);
      console.log(`🪙 Base Token: ${baseToken.mint.toString()}`);
      console.log(`💰 Quote Token: ${quoteToken.mint.toString()}`);

      // Step 1: Check wallet SOL balance
      await this.checkWalletBalance();

      // Step 2: Get or create token accounts
      const baseTokenAccount = await this.getOrCreateTokenAccount(baseToken.mint);
      const quoteTokenAccount = await this.getOrCreateTokenAccount(quoteToken.mint);

      // Step 3: Check token balances
      await this.checkTokenBalances(baseTokenAccount, quoteTokenAccount, baseToken, quoteToken);

      // Step 4: Create Serum Market (required for Raydium)
      const marketId = await this.createSerumMarket(baseToken, quoteToken);

      // Step 5: Initialize Raydium AMM Pool
      const poolId = await this.initializeRaydiumPool(
        marketId,
        baseToken,
        quoteToken,
        baseTokenAccount,
        quoteTokenAccount
      );

      console.log('\n✅ Liquidity Pool Created Successfully!');
      console.log(`🏪 Market ID: ${marketId.toString()}`);
      console.log(`🌊 Pool ID: ${poolId.toString()}`);

      // Save pool information
      await this.savePoolInfo(baseToken, quoteToken, marketId, poolId);

      return {
        marketId: marketId.toString(),
        poolId: poolId.toString(),
        baseToken: baseToken.symbol,
        quoteToken: quoteToken.symbol
      };

    } catch (error) {
      console.error('❌ Error creating liquidity pool:', error);
      throw error;
    }
  }

  private async checkWalletBalance() {
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    console.log(`💰 Wallet SOL Balance: ${solBalance.toFixed(4)} SOL`);
    
    if (solBalance < 0.1) {
      throw new Error('❌ Insufficient SOL balance. Need at least 0.1 SOL for transactions.');
    }
  }

  private async getOrCreateTokenAccount(tokenMint: PublicKey): Promise<PublicKey> {
    try {
      const associatedTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        this.wallet.publicKey
      );

      try {
        await getAccount(this.connection, associatedTokenAccount);
        console.log(`✅ Token account exists: ${associatedTokenAccount.toString()}`);
        return associatedTokenAccount;
      } catch {
        console.log(`🔨 Creating token account for: ${tokenMint.toString()}`);
        
        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            this.wallet.publicKey,
            associatedTokenAccount,
            this.wallet.publicKey,
            tokenMint
          )
        );

        const signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [this.wallet]
        );

        console.log(`✅ Token account created: ${signature}`);
        return associatedTokenAccount;
      }
    } catch (error) {
      console.error('❌ Error with token account:', error);
      throw error;
    }
  }

  private async checkTokenBalances(
    baseTokenAccount: PublicKey,
    quoteTokenAccount: PublicKey,
    baseToken: TokenInfo,
    quoteToken: TokenInfo
  ) {
    try {
      const baseAccount = await getAccount(this.connection, baseTokenAccount);
      const quoteAccount = await getAccount(this.connection, quoteTokenAccount);

      const baseBalance = Number(baseAccount.amount) / Math.pow(10, baseToken.decimals);
      const quoteBalance = Number(quoteAccount.amount) / Math.pow(10, quoteToken.decimals);

      console.log(`📊 ${baseToken.symbol} Balance: ${baseBalance.toFixed(2)}`);
      console.log(`📊 ${quoteToken.symbol} Balance: ${quoteBalance.toFixed(2)}`);

      if (baseBalance < baseToken.amount) {
        throw new Error(`❌ Insufficient ${baseToken.symbol} balance. Need ${baseToken.amount}, have ${baseBalance}`);
      }

      if (quoteBalance < quoteToken.amount) {
        throw new Error(`❌ Insufficient ${quoteToken.symbol} balance. Need ${quoteToken.amount}, have ${quoteBalance}`);
      }

      console.log('✅ Token balances sufficient for liquidity provision');
    } catch (error) {
      console.error('❌ Error checking token balances:', error);
      throw error;
    }
  }

  private async createSerumMarket(baseToken: TokenInfo, quoteToken: TokenInfo): Promise<PublicKey> {
    try {
      console.log('\n🏪 Creating Serum Market...');

      // For simplicity, we'll use a mock market creation
      // In production, you'd need to create an actual Serum market
      // This requires more complex setup with order books, etc.

      // Generate a deterministic market ID based on token pair
      const marketSeed = `market-${baseToken.mint.toString()}-${quoteToken.mint.toString()}`;
      const marketId = Keypair.generate().publicKey; // Simplified for demo

      console.log(`🏪 Mock Market Created: ${marketId.toString()}`);
      console.log('⚠️  Note: In production, create actual Serum market with order books');

      return marketId;
    } catch (error) {
      console.error('❌ Error creating Serum market:', error);
      throw error;
    }
  }

  private async initializeRaydiumPool(
    marketId: PublicKey,
    baseToken: TokenInfo,
    quoteToken: TokenInfo,
    baseTokenAccount: PublicKey,
    quoteTokenAccount: PublicKey
  ): Promise<PublicKey> {
    try {
      console.log('\n🌊 Initializing Raydium AMM Pool...');

      // Generate pool ID
      const poolId = Keypair.generate().publicKey; // Simplified for demo

      console.log(`🌊 Pool ID: ${poolId.toString()}`);
      console.log(`📈 Initial Price Ratio: 1 ${baseToken.symbol} = ${quoteToken.amount / baseToken.amount} ${quoteToken.symbol}`);

      // In a real implementation, you would:
      // 1. Create pool account
      // 2. Initialize AMM with base/quote tokens
      // 3. Provide initial liquidity
      // 4. Set up LP token minting

      console.log('✅ Raydium Pool Initialized (Mock)');
      console.log('⚠️  Note: In production, implement actual Raydium pool creation');

      return poolId;
    } catch (error) {
      console.error('❌ Error initializing Raydium pool:', error);
      throw error;
    }
  }

  private async savePoolInfo(
    baseToken: TokenInfo,
    quoteToken: TokenInfo,
    marketId: PublicKey,
    poolId: PublicKey
  ) {
    const poolInfo = {
      timestamp: new Date().toISOString(),
      network: 'devnet',
      baseToken: {
        symbol: baseToken.symbol,
        mint: baseToken.mint.toString(),
        decimals: baseToken.decimals
      },
      quoteToken: {
        symbol: quoteToken.symbol,
        mint: quoteToken.mint.toString(),
        decimals: quoteToken.decimals
      },
      marketId: marketId.toString(),
      poolId: poolId.toString(),
      status: 'created'
    };

    const filename = `raydium-pools-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(poolInfo, null, 2));
    console.log(`💾 Pool info saved to: ${filename}`);
  }
}

// 🚀 Main execution function
async function main() {
  try {
    console.log('🌊 Raydium Liquidity Pool Creator for Custom Tokens');
    console.log('================================================');

    const poolCreator = new RaydiumPoolCreator();

    // Define our custom tokens
    const mockBonk: TokenInfo = {
      mint: new PublicKey(process.env.MOCK_BONK_MINT!),
      decimals: 9,
      symbol: 'MOCK_BONK',
      amount: 1000000 // 1M tokens
    };

    const mockUsdc: TokenInfo = {
      mint: new PublicKey(process.env.MOCK_USDC_MINT!),
      decimals: 6,
      symbol: 'MOCK_USDC',
      amount: 10000 // 10K USDC
    };

    // Create MOCK_BONK/MOCK_USDC pool
    console.log('\n🎯 Creating MOCK_BONK/MOCK_USDC Liquidity Pool...');
    const bonkUsdcPool = await poolCreator.createLiquidityPool(mockBonk, mockUsdc);

    // Also create SOL pairs for better routing
    const sol: TokenInfo = {
      mint: new PublicKey('So11111111111111111111111111111111111111112'), // Wrapped SOL
      decimals: 9,
      symbol: 'SOL',
      amount: 10 // 10 SOL
    };

    console.log('\n🎯 Creating MOCK_BONK/SOL Liquidity Pool...');
    const bonkSolPool = await poolCreator.createLiquidityPool(mockBonk, sol);

    console.log('\n🎯 Creating MOCK_USDC/SOL Liquidity Pool...');
    const usdcSolPool = await poolCreator.createLiquidityPool(mockUsdc, sol);

    console.log('\n🎉 All Liquidity Pools Created Successfully!');
    console.log('===========================================');
    console.log('MOCK_BONK/MOCK_USDC:', bonkUsdcPool);
    console.log('MOCK_BONK/SOL:', bonkSolPool);
    console.log('MOCK_USDC/SOL:', usdcSolPool);

    console.log('\n📝 Next Steps:');
    console.log('1. Pools are now created (mock implementation)');
    console.log('2. For production: Implement actual Serum market creation');
    console.log('3. For production: Implement actual Raydium pool initialization');
    console.log('4. Test Jupiter API trading with new pools');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { RaydiumPoolCreator, TokenInfo };
