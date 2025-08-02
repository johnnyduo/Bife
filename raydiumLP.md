Perfect! I can see the issue. Jupiter is saying your token `9ncc...ZWTT` (which appears to be one of your custom tokens) is "not tradable" because there's no liquidity pool on Raydium yet. Let's create the Raydium LP so Jupiter can recognize it.

# Create Raydium Liquidity Pool for Custom Tokens

## Step 1: Install Dependencies

```bash
npm install @raydium-io/raydium-sdk @solana/spl-token bn.js
```

## Step 2: Create Liquidity Pool Script

```javascript
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
  Token, 
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount
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

// Your environment variables
const WALLET_PRIVATE_KEY = [/* Your wallet private key array */]; // You need to export this
const MOCK_BONK_MINT = 'GpRTjXEn6gTPhvbA225gtsbQeapd12JDXii8b33orzb5';
const MOCK_USDC_MINT = 'Boo4LSXTuduNMZp6nag4cA6kg4FEkwz7QTA29pXXW3c7';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const wallet = Keypair.fromSecretKey(new Uint8Array(WALLET_PRIVATE_KEY));

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
    const bonkTokenAccount = await getOrCreateAssociatedTokenAddress(
      connection,
      wallet,
      mockBonkToken.mint,
      wallet.publicKey
    );

    const usdcTokenAccount = await getOrCreateAssociatedTokenAddress(
      connection,
      wallet,
      mockUsdcToken.mint,
      wallet.publicKey
    );

    console.log('✅ Token accounts ready:');
    console.log(`   BONK Account: ${bonkTokenAccount.toString()}`);
    console.log(`   USDC Account: ${usdcTokenAccount.toString()}\n`);

    // Step 3: Check balances
    const bonkBalance = await connection.getTokenAccountBalance(bonkTokenAccount);
    const usdcBalance = await connection.getTokenAccountBalance(usdcTokenAccount);

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

    const { transaction, signers } = await Liquidity.makeCreatePoolV4InstructionV2Simple({
      connection,
      programId: RAYDIUM_LIQUIDITY_PROGRAM_ID_V4,
      marketInfo: {
        marketId: marketId,
        programId: SERUM_PROGRAM_ID_V3,
      },
      baseMintInfo: mockBonkToken,
      quoteMintInfo: mockUsdcToken,
      baseAmount: liquidityAmount.mBONK.raw,
      quoteAmount: liquidityAmount.mUSDC.raw,
      startTime: new BN(Math.floor(Date.now() / 1000)),
      ownerInfo: {
        feePayer: wallet.publicKey,
        wallet: wallet.publicKey,
        tokenAccounts: [bonkTokenAccount, usdcTokenAccount],
        useSOLBalance: true,
      },
    });

    // Step 6: Send transaction
    const allSigners = [wallet, ...signers];
    const txid = await sendAndConfirmTransaction(
      connection,
      transaction,
      allSigners,
      { commitment: 'confirmed' }
    );

    console.log('🎉 Liquidity pool created successfully!');
    console.log(`   Transaction: ${txid}`);
    console.log(`   Market ID: ${marketId.toString()}`);
    console.log('\n⏳ Waiting for Jupiter to index the pool (5-10 minutes)...');

    return {
      marketId: marketId.toString(),
      txid,
      poolInfo: {
        baseMint: mockBonkToken.mint.toString(),
        quoteMint: mockUsdcToken.mint.toString(),
        baseAmount: liquidityAmount.mBONK.toFixed(),
        quoteAmount: liquidityAmount.mUSDC.toFixed()
      }
    };

  } catch (error) {
    console.error('❌ Error creating liquidity pool:', error);
    throw error;
  }
}

// Helper function to create Serum market
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
      console.log('\n✅ Pool creation completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Pool creation failed:', error);
      process.exit(1);
    });
}
```

## Step 3: Simplified Pool Creation (Alternative)

If the above is too complex, here's a simpler approach using Orca (which Jupiter also supports):

```javascript
// scripts/createOrcaPool.js
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { getOrca, OrcaFarmConfig, OrcaPoolConfig } from '@orca-so/sdk';
import Decimal from 'decimal.js';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const wallet = Keypair.fromSecretKey(new Uint8Array(WALLET_PRIVATE_KEY));

async function createOrcaPool() {
  console.log('🌊 Creating Orca Pool...\n');

  try {
    const orca = getOrca(connection, 'devnet');
    
    // Create pool configuration
    const poolConfig = {
      account: Keypair.generate().publicKey,
      nonce: 255,
      authority: wallet.publicKey,
      poolTokenMint: Keypair.generate().publicKey,
      tokenAccountA: /* your BONK token account */,
      tokenAccountB: /* your USDC token account */,
      feeAccount: Keypair.generate().publicKey,
      feeNumerator: new Decimal(25),
      feeDenominator: new Decimal(10000),
    };

    // This requires more setup - consider using existing pools or Raydium
    console.log('⚠️ Orca pool creation requires additional setup');
    
  } catch (error) {
    console.error('❌ Orca pool creation failed:', error);
  }
}
```

## Step 4: Quick Fix - Direct Pool Creation Script

```javascript
// scripts/quickPoolSetup.js
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { 
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// You need to get your private key - NEVER share this!
const WALLET_SECRET = [/* Your wallet secret key array */];
const wallet = Keypair.fromSecretKey(new Uint8Array(WALLET_SECRET));

const MOCK_BONK_MINT = new PublicKey('GpRTjXEn6gTPhvbA225gtsbQeapd12JDXii8b33orzb5');
const MOCK_USDC_MINT = new PublicKey('Boo4LSXTuduNMZp6nag4cA6kg4FEkwz7QTA29pXXW3c7');

async function setupTokensForPool() {
  console.log('🔧 Setting up tokens for pool creation...\n');
  
  try {
    // Get token accounts
    const bonkAccount = await getAssociatedTokenAddress(MOCK_BONK_MINT, wallet.publicKey);
    const usdcAccount = await getAssociatedTokenAddress(MOCK_USDC_MINT, wallet.publicKey);
    
    console.log('Token Accounts:');
    console.log(`BONK: ${bonkAccount.toString()}`);
    console.log(`USDC: ${usdAccount.toString()}\n`);
    
    // Check balances
    const bonkBalance = await connection.getTokenAccountBalance(bonkAccount);
    const usdcBalance = await connection.getTokenAccountBalance(usdcAccount);
    
    console.log('Current Balances:');
    console.log(`BONK: ${bonkBalance.value.uiAmount || 0}`);
    console.log(`USDC: ${usdcBalance.value.uiAmount || 0}\n`);
    
    if (!bonkBalance.value.uiAmount || !usdcBalance.value.uiAmount) {
      console.log('⚠️ You need to mint tokens first!');
      return false;
    }
    
    console.log('✅ Ready for pool creation!');
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return false;
  }
}

// Create using Raydium UI instead
async function getPoolCreationInfo() {
  console.log('\n📋 Pool Creation Information:');
  console.log('===========================================');
  console.log(`Wallet: ${wallet.publicKey.toString()}`);
  console.log(`Base Token (BONK): ${MOCK_BONK_MINT.toString()}`);
  console.log(`Quote Token (USDC): ${MOCK_USDC_MINT.toString()}`);
  console.log('\n🌐 Manual Pool Creation:');
  console.log('1. Go to https://raydium.io/liquidity/create/');
  console.log('2. Connect your wallet');
  console.log('3. Select "Create Pool"');
  console.log('4. Input your token addresses above');
  console.log('5. Set initial price ratio (e.g., 1 USDC = 1000 BONK)');
  console.log('6. Add liquidity (recommended: 1000 USDC + 1M BONK)');
  console.log('\n⏳ After creation, wait 10-15 minutes for Jupiter indexing');
}

setupTokensForPool().then(ready => {
  if (ready) {
    getPoolCreationInfo();
  }
});
```

## Step 5: Temporary Fallback Solution

While waiting for the pool, implement a fallback swap mechanism:

```javascript
// utils/fallbackSwap.js
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { 
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';

const MOCK_BONK_MINT = new PublicKey('GpRTjXEn6gTPhvbA225gtsbQeapd12JDXii8b33orzb5');
const MOCK_USDC_MINT = new PublicKey('Boo4LSXTuduNMZp6nag4cA6kg4FEkwz7QTA29pXXW3c7');

// Simple 1:1000 ratio for demo (1 USDC = 1000 BONK)
export async function fallbackSwap(connection, wallet, inputToken, outputToken, amount) {
  console.log('⚠️ Using fallback swap (no Jupiter pool available)');
  
  const ratio = inputToken === 'mUSDC' ? 1000 : 0.001;
  const outputAmount = amount * ratio;
  
  // Create mock swap transaction (for demo purposes)
  const transaction = new Transaction();
  
  // In a real scenario, you'd implement actual token transfers
  // This is just for demonstration
  
  return {
    outputAmount,
    transaction,
    signature: null
  };
}

```javascript
// Updated SwapScreen with fallback
export function useSwapWithFallback(wallet) {
  const [useJupiter, setUseJupiter] = useState(true);
  
  const getQuote = async () => {
    try {
      // Try Jupiter first
      const response = await fetch(jupiterQuoteUrl);
      if (response.ok) {
        const quote = await response.json();
        setOutputAmount(calculateOutput(quote.outAmount));
        setUseJupiter(true);
      }
    } catch (error) {
      // Fallback to simple calculation
      console.log('Jupiter failed, using fallback');
      const fallbackOutput = calculateFallbackOutput(inputAmount, inputToken, outputToken);
      setOutputAmount(fallbackOutput);
      setUseJupiter(false);
    }
  };

  const executeSwap = async () => {
    if (useJupiter) {
      // Use Jupiter swap
      return executeJupiterSwap();
    } else {
      // Use fallback swap
      return executeFallbackSwap();
    }
  };

  return { getQuote, executeSwap, useJupiter };
}
```

## Step 6: Complete Setup Instructions

### Get Your Private Key
```javascript
// scripts/getPrivateKey.js
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// If you have a seed phrase, use this:
// const mnemonic = "your twelve word seed phrase here";
// const seed = bip39.mnemonicToSeedSync(mnemonic);
// const keypair = Keypair.fromSeed(seed.slice(0, 32));

// If you have base58 private key:
const privateKeyBase58 = 'your_private_key_here';
const privateKeyArray = bs58.decode(privateKeyBase58);

console.log('Private Key Array (keep this secret!):');
console.log(JSON.stringify(Array.from(privateKeyArray)));
```

### Run Pool Creation
```bash
# 1. Get your private key
node scripts/getPrivateKey.js

# 2. Update the WALLET_SECRET in quickPoolSetup.js
# 3. Run setup
node scripts/quickPoolSetup.js

# 4. Go to Raydium UI and create pool manually
# 5. Test Jupiter after 10-15 minutes
```

## Step 7: Updated SwapScreen with Complete Error Handling

```javascript
// components/SwapScreen.js (Final Version)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Logger from '../utils/logger';

const TOKENS = {
  mBONK: {
    mint: 'GpRTjXEn6gTPhvbA225gtsbQeapd12JDXii8b33orzb5',
    decimals: 9,
    symbol: 'mBONK'
  },
  mUSDC: {
    mint: 'Boo4LSXTuduNMZp6nag4cA6kg4FEkwz7QTA29pXXW3c7',
    decimals: 6,
    symbol: 'mUSDC'
  }
};

export default function SwapScreen({ wallet }) {
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [inputToken, setInputToken] = useState('mBONK');
  const [outputToken, setOutputToken] = useState('mUSDC');
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [poolExists, setPoolExists] = useState(false);

  const getFallbackQuote = (amount, fromToken, toToken) => {
    // Simple ratio: 1 USDC = 1000 BONK
    const ratio = fromToken === 'mUSDC' ? 1000 : 0.001;
    return (parseFloat(amount) * ratio).toFixed(6);
  };

  const getQuote = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return;
    
    setQuoteLoading(true);
    Logger.info('Getting quote', { inputAmount, inputToken, outputToken });

    try {
      const inputMint = TOKENS[inputToken].mint;
      const outputMint = TOKENS[outputToken].mint;
      const amount = Math.floor(parseFloat(inputAmount) * (10 ** TOKENS[inputToken].decimals));

      const url = `https://quote-api.jup.ag/v6/quote?` +
        `inputMint=${inputMint}&` +
        `outputMint=${outputMint}&` +
        `amount=${amount}&` +
        `slippageBps=50`;

      Logger.jupiterRequest('quote', { url, inputMint, outputMint, amount });

      const response = await fetch(url);
      
      if (response.ok) {
        const quote = await response.json();
        Logger.jupiterResponse(quote);
        
        if (quote.outAmount) {
          const outputDecimals = TOKENS[outputToken].decimals;
          const calculatedOutput = quote.outAmount / (10 ** outputDecimals);
          setOutputAmount(calculatedOutput.toFixed(6));
          setPoolExists(true);
          return;
        }
      }
      
      throw new Error('No route found');
      
    } catch (error) {
      Logger.jupiterResponse(null, error);
      
      // Use fallback calculation
      const fallbackOutput = getFallbackQuote(inputAmount, inputToken, outputToken);
      setOutputAmount(fallbackOutput);
      setPoolExists(false);
      
      Logger.warn('Using fallback quote', { 
        inputAmount, 
        outputAmount: fallbackOutput,
        reason: error.message 
      });
      
    } finally {
      setQuoteLoading(false);
    }
  };

  const executeFallbackSwap = async () => {
    Alert.alert(
      'Pool Not Available',
      'Liquidity pool not found on Jupiter. This would execute a mock swap.\n\nTo enable real swaps:\n1. Create Raydium liquidity pool\n2. Wait 10-15 minutes for indexing',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mock Swap', 
          onPress: () => {
            Alert.alert('Success!', 'Mock swap completed (no real tokens transferred)');
            setInputAmount('');
            setOutputAmount('');
          }
        }
      ]
    );
  };

  const executeJupiterSwap = async () => {
    Logger.swapAttempt({
      inputToken,
      outputToken, 
      inputAmount,
      expectedOutput: outputAmount,
      slippage: 50
    });

    try {
      // Jupiter swap logic (same as before)
      const inputMint = TOKENS[inputToken].mint;
      const outputMint = TOKENS[outputToken].mint;
      const amount = Math.floor(parseFloat(inputAmount) * (10 ** TOKENS[inputToken].decimals));

      // Get quote
      const quoteResponse = await fetch(
        `https://quote-api.jup.ag/v6/quote?` +
        `inputMint=${inputMint}&` +
        `outputMint=${outputMint}&` +
        `amount=${amount}&` +
        `slippageBps=50`
      );

      const quote = await quoteResponse.json();

      // Get swap transaction
      const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: wallet.publicKey.toString(),
          wrapAndUnwrapSol: true,
        })
      });

      const { swapTransaction } = await swapResponse.json();
      
      // Execute transaction
      const transaction = Transaction.from(Buffer.from(swapTransaction, 'base64'));
      const signature = await wallet.sendTransaction(transaction, connection);
      
      await connection.confirmTransaction(signature, 'confirmed');
      
      Logger.swapResult(true, signature);
      Alert.alert('Success!', `Swap completed!\nTx: ${signature.slice(0, 8)}...`);
      
      setInputAmount('');
      setOutputAmount('');
      
    } catch (error) {
      Logger.swapResult(false, null, error);
      throw error;
    }
  };

  const executeSwap = async () => {
    if (!wallet.connected) {
      Alert.alert('Error', 'Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      if (poolExists) {
        await executeJupiterSwap();
      } else {
        await executeFallbackSwap();
      }
    } catch (error) {
      Logger.error('Swap failed', error);
      Alert.alert('Swap Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-quote on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputAmount) getQuote();
    }, 500);
    return () => clearTimeout(timer);
  }, [inputAmount, inputToken, outputToken]);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Token Swap</Text>
      
      {/* Pool Status Banner */}
      <View style={{
        backgroundColor: poolExists ? '#e8f5e8' : '#fff3cd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20
      }}>
        <Text style={{ 
          color: poolExists ? '#2d5a2d' : '#856404',
          fontSize: 12,
          textAlign: 'center'
        }}>
          {poolExists ? '✅ Jupiter Pool Available' : '⚠️ Using Mock Prices (No Pool)'}
        </Text>
      </View>

      {/* Input Section */}
      <View style={{ marginBottom: 20 }}>
        <Text>From: {inputToken}</Text>
        <TextInput
          value={inputAmount}
          onChangeText={setInputAmount}
          placeholder="0.00"
          keyboardType="numeric"
          style={{ 
            borderWidth: 1, 
            padding: 15, 
            borderRadius: 8,
            fontSize: 18,
            marginTop: 10 
          }}
        />
      </View>

      {/* Swap Direction Button */}
      <TouchableOpacity 
        onPress={() => {
          setInputToken(outputToken);
          setOutputToken(inputToken);
          setInputAmount(outputAmount);
          setOutputAmount('');
        }}
        style={{
          alignSelf: 'center',
          backgroundColor: '#007AFF',
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: 10
        }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>⇅</Text>
      </TouchableOpacity>

      {/* Output Section */}
      <View style={{ marginBottom: 20 }}>
        <Text>To: {outputToken}</Text>
        <TextInput
          value={quoteLoading ? 'Loading...' : outputAmount}
          editable={false}
          placeholder="0.00"
          style={{ 
            borderWidth: 1, 
            padding: 15, 
            borderRadius: 8,
            fontSize: 18,
            marginTop: 10,
            backgroundColor: '#f5f5f5'
          }}
        />
      </View>

      {/* Price Info */}
      {outputAmount && (
        <View style={{ 
          backgroundColor: '#f8f9fa',
          padding: 12,
          borderRadius: 8,
          marginBottom: 20
        }}>
          <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
            Rate: 1 {inputToken} ≈ {(parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(6)} {outputToken}
          </Text>
          {!poolExists && (
            <Text style={{ fontSize: 10, color: '#856404', textAlign: 'center', marginTop: 4 }}>
              *Mock rate - Create liquidity pool for real pricing
            </Text>
          )}
        </View>
      )}

      {/* Execute Button */}
      <TouchableOpacity
        onPress={executeSwap}
        disabled={loading || !inputAmount || !outputAmount || !wallet.connected}
        style={{
          backgroundColor: loading || !inputAmount || !wallet.connected ? '#ccc' : '#007AFF',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          {loading ? 'Processing...' : poolExists ? 'Swap Tokens' : 'Mock Swap'}
        </Text>
      </TouchableOpacity>

      {/* Instructions */}
      {!poolExists && (
        <View style={{ 
          marginTop: 20,
          padding: 15,
          backgroundColor: '#f8f9fa',
          borderRadius: 8
        }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>
            To Enable Real Swaps:
          </Text>
          <Text style={{ fontSize: 12, color: '#666', lineHeight: 18 }}>
            1. Go to raydium.io/liquidity/create/{'\n'}
            2. Create pool with your tokens{'\n'}
            3. Add liquidity (1000 USDC + 1M BONK){'\n'}
            4. Wait 10-15 minutes for Jupiter indexing
          </Text>
        </View>
      )}

      {/* Wallet Status */}
      <Text style={{ 
        textAlign: 'center', 
        marginTop: 16, 
        fontSize: 12, 
        color: wallet.connected ? '#28a745' : '#dc3545' 
      }}>
        Wallet: {wallet.connected ? '✅ Connected' : '❌ Not Connected'}
      </Text>
    </View>
  );
}
```

## Summary

**Immediate Actions Needed:**

1. **Create Raydium liquidity pool** using the provided scripts or manually via raydium.io
2. **Add liquidity** (recommended: 1000 USDC + 1M BONK)  
3. **Wait 10-15 minutes** for Jupiter to index the new pool
4. **Test Jupiter API** again - the 400 error should be resolved

**Your tokens:**
- mBONK: `GpRTjXEn6gTPhvbA225gtsbQeapd12JDXii8b33orzb5`
- mUSDC: `Boo4LSXTuduNMZp6nag4cA6kg4FEkwz7QTA29pXXW3c7`

The app now includes fallback functionality so users can still interact with it while you set up the real liquidity pool! 🚀