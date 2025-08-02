// scripts/quickPoolSetup.js
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Get wallet from environment
const WALLET_SECRET = JSON.parse(process.env.SOLANA_WALLET_SECRET_KEY);
const wallet = Keypair.fromSecretKey(new Uint8Array(WALLET_SECRET));

const MOCK_BONK_MINT = new PublicKey(process.env.MOCK_BONK_MINT);
const MOCK_USDC_MINT = new PublicKey(process.env.MOCK_USDC_MINT);

async function setupTokensForPool() {
  console.log('🔧 Setting up tokens for pool creation...\n');
  
  try {
    // Get token accounts
    const bonkAccount = await getAssociatedTokenAddress(MOCK_BONK_MINT, wallet.publicKey);
    const usdcAccount = await getAssociatedTokenAddress(MOCK_USDC_MINT, wallet.publicKey);
    
    console.log('🔑 Wallet Information:');
    console.log(`Public Key: ${wallet.publicKey.toString()}`);
    console.log(`SOL Balance: ${await connection.getBalance(wallet.publicKey) / 1e9} SOL\n`);
    
    console.log('🪙 Token Accounts:');
    console.log(`BONK: ${bonkAccount.toString()}`);
    console.log(`USDC: ${usdcAccount.toString()}\n`);
    
    // Check balances
    const bonkBalance = await connection.getTokenAccountBalance(bonkAccount);
    const usdcBalance = await connection.getTokenAccountBalance(usdcAccount);
    
    console.log('💰 Current Balances:');
    console.log(`mBONK: ${bonkBalance.value.uiAmount || 0}`);
    console.log(`mUSDC: ${usdcBalance.value.uiAmount || 0}\n`);
    
    if (!bonkBalance.value.uiAmount || !usdcBalance.value.uiAmount) {
      console.log('⚠️ You need to mint tokens first!');
      console.log('Run: yarn mint-tokens');
      return false;
    }
    
    console.log('✅ Ready for pool creation!\n');
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

// Create using Raydium UI instead
async function getPoolCreationInfo() {
  console.log('📋 Pool Creation Information:');
  console.log('===========================================');
  console.log(`Wallet: ${wallet.publicKey.toString()}`);
  console.log(`Base Token (BONK): ${MOCK_BONK_MINT.toString()}`);
  console.log(`Quote Token (USDC): ${MOCK_USDC_MINT.toString()}`);
  console.log('\n🌐 Manual Pool Creation Steps:');
  console.log('1. Go to https://raydium.io/liquidity/create/');
  console.log('2. Connect your wallet with the address above');
  console.log('3. Select "Create Pool"');
  console.log('4. Input token addresses:');
  console.log(`   - Base: ${MOCK_BONK_MINT.toString()}`);
  console.log(`   - Quote: ${MOCK_USDC_MINT.toString()}`);
  console.log('5. Set initial price ratio (e.g., 1 USDC = 1000 BONK)');
  console.log('6. Add liquidity (recommended: 1000 USDC + 1M BONK)');
  console.log('\n⏳ After creation:');
  console.log('- Wait 10-15 minutes for Jupiter indexing');
  console.log('- Test Jupiter API again');
  console.log('- The "TOKEN_NOT_TRADABLE" error should be resolved');
  
  console.log('\n🚀 Alternative: Use SOL/BONK or SOL/USDC pairs');
  console.log('These are more common and might be easier to create');
}

// Check if tokens exist and are properly configured
async function validateTokens() {
  console.log('🔍 Validating Token Configuration...\n');
  
  try {
    // Check if tokens exist
    const bonkInfo = await connection.getAccountInfo(MOCK_BONK_MINT);
    const usdcInfo = await connection.getAccountInfo(MOCK_USDC_MINT);
    
    console.log('✅ Token Validation:');
    console.log(`mBONK exists: ${bonkInfo ? '✅' : '❌'}`);
    console.log(`mUSDC exists: ${usdcInfo ? '✅' : '❌'}`);
    
    if (!bonkInfo || !usdcInfo) {
      console.log('\n❌ Tokens not found! You need to create them first.');
      console.log('Run: yarn create-tokens');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Token validation failed:', error);
    return false;
  }
}

async function main() {
  console.log('🌊 Raydium Pool Setup Tool\n');
  
  const tokensValid = await validateTokens();
  if (!tokensValid) return;
  
  const tokensReady = await setupTokensForPool();
  if (tokensReady) {
    await getPoolCreationInfo();
  }
}

main().catch(console.error);
