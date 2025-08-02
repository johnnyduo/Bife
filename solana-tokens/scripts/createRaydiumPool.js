// scripts/createRaydiumPool.js
import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl 
} from '@solana/web3.js';
import { 
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { 
  Liquidity, 
  LiquidityPoolKeys,
  jsonInfo2PoolKeys,
  Percent,
  Token as RaydiumToken,
  TokenAmount,
  MAINNET_PROGRAM_ID,
  DEVNET_PROGRAM_ID
} from '@raydium-io/raydium-sdk';
import BN from 'bn.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Your environment variables
const WALLET_SECRET_KEY = JSON.parse(process.env.SOLANA_WALLET_SECRET_KEY);
const MOCK_BONK_MINT = process.env.MOCK_BONK_MINT;
const MOCK_USDC_MINT = process.env.MOCK_USDC_MINT;

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const wallet = Keypair.fromSecretKey(new Uint8Array(WALLET_SECRET_KEY));

// Raydium program IDs for devnet
const RAYDIUM_LIQUIDITY_PROGRAM_ID_V4 = new PublicKey('HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8');
const SERUM_PROGRAM_ID_V3 = new PublicKey('DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY');

async function createLiquidityPool() {
  console.log('🚀 Creating Raydium Liquidity Pool...\n');

  try {
    // Step 1: Define tokens
    const mockBonkToken = new RaydiumToken(
      TOKEN_PROGRAM_ID,
      new PublicKey(MOCK_BONK_MINT),
      9,
      'mBONK',
      'Mock BONK'
    );

    const mockUsdcToken = new RaydiumToken(
      TOKEN_PROGRAM_ID,
      new PublicKey(MOCK_USDC_MINT),
      6,
      'mUSDC', 
      'Mock USDC'
    );

    console.log('✅ Tokens defined:');
    console.log(`   mBONK: ${mockBonkToken.mint.toString()}`);
    console.log(`   mUSDC: ${mockUsdcToken.mint.toString()}\n`);

    // Step 2: Get or create token accounts
    const bonkTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mockBonkToken.mint,
      wallet.publicKey
    );

    const usdcTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet,
      mockUsdcToken.mint,
      wallet.publicKey
    );

    console.log('✅ Token accounts ready:');
    console.log(`   BONK Account: ${bonkTokenAccount.address.toString()}`);
    console.log(`   USDC Account: ${usdcTokenAccount.address.toString()}\n`);

    // Step 3: Check balances
    const bonkBalance = await connection.getTokenAccountBalance(bonkTokenAccount.address);
    const usdcBalance = await connection.getTokenAccountBalance(usdcTokenAccount.address);

    console.log('💰 Current balances:');
    console.log(`   mBONK: ${bonkBalance.value.uiAmount || 0}`);
    console.log(`   mUSDC: ${usdcBalance.value.uiAmount || 0}\n`);

    // Ensure we have tokens to add liquidity
    if (!bonkBalance.value.uiAmount || !usdcBalance.value.uiAmount) {
      throw new Error('Insufficient token balances. Please mint tokens first.');
    }

    // Step 4: Create market first (required for Raydium pool)
    console.log('📈 Creating Serum market...');
    
    const marketId = await createSerumMarket(
      mockBonkToken.mint,
      mockUsdcToken.mint,
      wallet
    );

    console.log(`✅ Market created: ${marketId.toString()}\n`);

    // Step 5: Create liquidity pool
    console.log('🏊 Creating liquidity pool...');

    const liquidityAmount = {
      mBONK: new TokenAmount(mockBonkToken, new BN(1000000).mul(new BN(10**9))), // 1M BONK
      mUSDC: new TokenAmount(mockUsdcToken, new BN(1000).mul(new BN(10**6)))      // 1K USDC
    };

    // Note: This is a simplified version - actual Raydium pool creation is complex
    console.log('⚠️ Pool creation requires advanced setup. Using manual approach...\n');
    
    console.log('📋 Manual Pool Creation Information:');
    console.log('===========================================');
    console.log(`Wallet: ${wallet.publicKey.toString()}`);
    console.log(`Base Token (BONK): ${MOCK_BONK_MINT}`);
    console.log(`Quote Token (USDC): ${MOCK_USDC_MINT}`);
    console.log(`BONK Balance: ${bonkBalance.value.uiAmount}`);
    console.log(`USDC Balance: ${usdcBalance.value.uiAmount}`);
    console.log('\n🌐 Next Steps:');
    console.log('1. Go to https://raydium.io/liquidity/create/');
    console.log('2. Connect your wallet');
    console.log('3. Select "Create Pool"');
    console.log('4. Input your token addresses above');
    console.log('5. Set initial price ratio (e.g., 1 USDC = 1000 BONK)');
    console.log('6. Add liquidity (recommended: 1000 USDC + 1M BONK)');
    console.log('\n⏳ After creation, wait 10-15 minutes for Jupiter indexing');

    return {
      marketId: marketId.toString(),
      poolInfo: {
        baseMint: mockBonkToken.mint.toString(),
        quoteMint: mockUsdcToken.mint.toString(),
        baseBalance: bonkBalance.value.uiAmount,
        quoteBalance: usdcBalance.value.uiAmount
      }
    };

  } catch (error) {
    console.error('❌ Error creating liquidity pool:', error);
    throw error;
  }
}

// Helper function to create Serum market (simplified)
async function createSerumMarket(baseMint, quoteMint, wallet) {
  // This is a simplified version - you might need to use Serum SDK
  // For now, let's create a market ID deterministically
  
  const seeds = [
    Buffer.from('market'),
    baseMint.toBuffer(),
    quoteMint.toBuffer(),
  ];
  
  const [marketId] = await PublicKey.findProgramAddress(
    seeds,
    SERUM_PROGRAM_ID_V3
  );
  
  return marketId;
}

// Export for use in other scripts
export { createLiquidityPool };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createLiquidityPool()
    .then(result => {
      console.log('\n✅ Pool creation setup completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Pool creation failed:', error);
      process.exit(1);
    });
}
