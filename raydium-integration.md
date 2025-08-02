# Real Raydium Devnet Integration Plan

## 🎯 Goal: Replace Simulation with Real SDK Calls

Based on the `dexswap_principle.md`, we have 3 approaches for real swaps:

### 1. Direct AMM Pool Swap (Recommended for Devnet)
```javascript
// Key integration points from dexswap_principle.md:

// A. Pool Detection
const poolId = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2' // SOL-USDC example
const poolInfo = await raydium.liquidity.getPoolInfoFromRpc({ poolId })

// B. Real Quote Calculation  
const out = raydium.liquidity.computeAmountOut({
  poolInfo: { ...poolInfo.poolInfo, baseReserve, quoteReserve, status, version: 4 },
  amountIn: new BN(amountIn),
  mintIn: mintIn.address,
  mintOut: mintOut.address,
  slippage: 0.01
})

// C. Real Swap Execution
const { execute } = await raydium.liquidity.swap({
  poolInfo,
  poolKeys,
  amountIn: new BN(amountIn),
  amountOut: out.minAmountOut,
  fixedSide: 'in',
  inputMint: mintIn.address,
  txVersion: 'V0'
})

const { txId } = await execute({ sendAndConfirm: true })
```

### 2. Your Devnet Token Integration

For your deployed tokens:
- MOCK_BONK: `GpRTjXEn6gTPhvbA225gtsbQeapd12JDXii8b33orzb5`
- MOCK_USDC: `Boo4LSXTuduNMZp6nag4cA6kg4FEkwz7QTA29pXXW3c7`

You need to:
1. **Deploy Raydium pools** for these token pairs on devnet
2. **Get the pool IDs** from your deployment
3. **Use the pool IDs** in the real swap functions

### 3. Implementation Strategy

```javascript
// Replace simulation functions with real SDK calls:

// OLD: calculateRaydiumQuoteWithAMM() - simulation
// NEW: getRealRaydiumQuote() - using SDK

// OLD: executeRaydiumSwap() - fake transaction  
// NEW: executeRealRaydiumSwap() - real blockchain transaction
```

## 🔧 Next Steps

1. **Install Raydium SDK**: Add to package.json
2. **Configure Devnet RPC**: Update connection settings
3. **Deploy Real Pools**: For your MOCK tokens
4. **Replace Functions**: Update quote and swap functions
5. **Test Real Swaps**: On devnet with your tokens

## 📋 Required Pool Deployments

You need to deploy these pools on devnet:
- SOL ↔ MOCK_BONK pool
- SOL ↔ MOCK_USDC pool  
- MOCK_USDC ↔ MOCK_BONK pool

Once deployed, you'll get pool IDs to use in the real swap functions.
