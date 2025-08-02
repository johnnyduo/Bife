import { Connection, PublicKey } from '@solana/web3.js'
import {
  ALL_PROGRAM_ID,
  liquidityStateV4Layout,
  PoolInfoLayout,
  CpmmPoolInfoLayout,
  struct,
  publicKey,
} from '@raydium-io/raydium-sdk-v2'

const connection = new Connection('rpc url')

const getAmmPoolInfo = async (poolId: PublicKey) => {
  const data = await connection.getAccountInfo(poolId)
  if (!data) throw new Error(`pool not found: ${poolId.toBase58()}`)
  return liquidityStateV4Layout.decode(data.data)
}

const getMultipleAmmPoolInfo = async (poolIdList: PublicKey[]) => {
  const data = await connection.getMultipleAccountsInfo(poolIdList)

  return data.map((d, idx) => {
    if (!d) return null
    return {
      poolId: poolIdList[idx],
      ...liquidityStateV4Layout.decode(d.data),
    }
  })
}

async function fetchAllPools() {
  // since amm pool data at least > 1GB might cause error
  // let's limit data size and get poolId/baseMint/quoteMint first
  const layoutAmm = struct([publicKey('baseMint'), publicKey('quoteMint')])
  const ammPools: (ReturnType<typeof layoutAmm.decode> & { poolId: PublicKey })[] = []

  console.log('amm fetching...')
  const ammPoolsData = await connection.getProgramAccounts(ALL_PROGRAM_ID.AMM_V4, {
    filters: [{ dataSize: liquidityStateV4Layout.span }],
    dataSlice: { offset: liquidityStateV4Layout.offsetOf('baseMint'), length: 64 },
    encoding: 'base64' as any,
  })
  console.log('amm fetch done')
  ammPoolsData.forEach((a) => {
    ammPools.push({
      poolId: a.pubkey,
      ...layoutAmm.decode(a.account.data),
    })
  })

  // after get all amm pools id, we can fetch amm pool info one by one or by group separately

  // e.g. 1:1  ammPools.forEach((a) => getAmmPoolInfo(a.poolId))
  // e.g. 200 per group  getMultipleAmmPoolInfo(ammPools.slice(0, 100).map((a) => a.poolId))

  const clmmPools: (ReturnType<typeof PoolInfoLayout.decode> & { poolId: PublicKey })[] = []
  console.log('clmm fetching...')
  const clmmPoolsData = await connection.getProgramAccounts(ALL_PROGRAM_ID.CLMM_PROGRAM_ID, {
    filters: [{ dataSize: PoolInfoLayout.span }],
  })

  console.log('clmm fetch done')
  clmmPoolsData.forEach((c) => {
    clmmPools.push({
      poolId: c.pubkey,
      ...PoolInfoLayout.decode(c.account.data),
    })
  })

  const cpmmPools: (ReturnType<typeof CpmmPoolInfoLayout.decode> & { poolId: PublicKey })[] = []
  console.log('cpmm fetching...')
  const cpmmPoolsData = await connection.getProgramAccounts(ALL_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, {
    filters: [{ dataSize: CpmmPoolInfoLayout.span }],
  })
  cpmmPoolsData.forEach((c) => {
    cpmmPools.push({
      poolId: c.pubkey,
      ...CpmmPoolInfoLayout.decode(c.account.data),
    })
  })
  console.log('cpmm fetch done')

  console.log(ammPools.length, {
    amm: ammPools,
    clmmPools: clmmPools,
    cpmmPools,
  })
}

fetchAllPools()



import {
  USDCMint,
  toFeeConfig,
  toApiV3Token,
  Router,
  TokenAmount,
  Token,
  DEVNET_PROGRAM_ID,
  printSimulate,
  setLoggerLevel,
  LogLevel,
} from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { NATIVE_MINT, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { initSdk, txVersion } from '../config'
import { readCachePoolData, writeCachePoolData } from '../cache/utils'
import { printSimulateInfo } from '../util'

const poolType: Record<number, string> = {
  4: 'AMM',
  5: 'AMM Stable',
  6: 'CLMM',
  7: 'CPMM',
}

setLoggerLevel('Raydium_tradeV2', LogLevel.Debug)

async function routeSwap() {
  const raydium = await initSdk()
  await raydium.fetchChainTime()

  const inputAmount = '8000000'
  const SOL = NATIVE_MINT // or WSOLMint
  const [inputMint, outputMint] = [SOL, new PublicKey('7i5XE77hnx1a6hjWgSuYwmqdmLoDJNTU1rYA6Gqx7QiE')]
  const [inputMintStr, outputMintStr] = [inputMint.toBase58(), outputMint.toBase58()]

  // strongly recommend cache all pool data, it will reduce lots of data fetching time
  // code below is a simple way to cache it, you can implement it with any other ways
  // let poolData = readCachePoolData() // initial cache time is 10 mins(1000 * 60 * 10), if wants to cache longer, set bigger number in milliseconds
  let poolData = readCachePoolData(1000 * 60 * 60 * 24 * 10) // example for cache 1 day
  if (poolData.ammPools.length === 0) {
    console.log(
      '**Please ensure you are using "paid" rpc node or you might encounter fetch data error due to pretty large pool data**'
    )
    console.log('fetching all pool basic info, this might take a while (more than 1 minutes)..')
    poolData = await raydium.tradeV2.fetchRoutePoolBasicInfo()
    // devent pool info
    // fetchRoutePoolBasicInfo({
    //   amm: DEVNET_PROGRAM_ID.AmmV4,
    //   clmm: DEVNET_PROGRAM_ID.CLMM,
    //   cpmm: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
    // })
    writeCachePoolData(poolData)
  }

  console.log('computing swap route..')
  // route here also can cache for a time period by pair to reduce time
  // e.g.{inputMint}-${outputMint}'s routes, if poolData don't change, routes should be almost same
  const routes = raydium.tradeV2.getAllRoute({
    inputMint,
    outputMint,
    ...poolData,
  })

  // data here also can try to cache if you wants e.g. mintInfos
  // but rpc related info doesn't suggest to cache it for a long time, because base/quote reserve and pool price change by time
  const {
    routePathDict,
    mintInfos,
    ammPoolsRpcInfo,
    ammSimulateCache,

    clmmPoolsRpcInfo,
    computeClmmPoolInfo,
    computePoolTickData,

    computeCpmmData,
  } = await raydium.tradeV2.fetchSwapRoutesData({
    routes,
    inputMint,
    outputMint,
  })

  console.log('calculating available swap routes...')
  const swapRoutes = raydium.tradeV2.getAllRouteComputeAmountOut({
    inputTokenAmount: new TokenAmount(
      new Token({
        mint: inputMintStr,
        decimals: mintInfos[inputMintStr].decimals,
        isToken2022: mintInfos[inputMintStr].programId.equals(TOKEN_2022_PROGRAM_ID),
      }),
      inputAmount
    ),
    directPath: routes.directPath.map(
      (p) =>
        ammSimulateCache[p.id.toBase58()] || computeClmmPoolInfo[p.id.toBase58()] || computeCpmmData[p.id.toBase58()]
    ),
    routePathDict,
    simulateCache: ammSimulateCache,
    tickCache: computePoolTickData,
    mintInfos: mintInfos,
    outputToken: toApiV3Token({
      ...mintInfos[outputMintStr],
      programId: mintInfos[outputMintStr].programId.toBase58(),
      address: outputMintStr,
      freezeAuthority: undefined,
      mintAuthority: undefined,
      extensions: {
        feeConfig: toFeeConfig(mintInfos[outputMintStr].feeConfig),
      },
    }),
    chainTime: Math.floor(raydium.chainTimeData?.chainTime ?? Date.now() / 1000),
    slippage: 0.005, // range: 1 ~ 0.0001, means 100% ~ 0.01%
    epochInfo: await raydium.connection.getEpochInfo(),
  })

  // swapRoutes are sorted by out amount, so first one should be the best route
  const targetRoute = swapRoutes[0]
  if (!targetRoute) throw new Error('no swap routes were found')

  console.log('best swap route:', {
    input: targetRoute.amountIn.amount.toExact(),
    output: targetRoute.amountOut.amount.toExact(),
    minimumOut: targetRoute.minAmountOut.amount.toExact(),
    swapType: targetRoute.routeType,
    routes: targetRoute.poolInfoList.map((p) => `${poolType[p.version]} ${p.id} ${(p as any).status}`).join(` -> `),
  })

  console.log('fetching swap route pool keys..')
  const poolKeys = await raydium.tradeV2.computePoolToPoolKeys({
    pools: targetRoute.poolInfoList,
    ammRpcData: ammPoolsRpcInfo,
    clmmRpcData: clmmPoolsRpcInfo,
  })

  console.log('build swap tx..')
  const { execute, transactions } = await raydium.tradeV2.swap({
    routeProgram: Router,
    txVersion,
    swapInfo: targetRoute,
    swapPoolKeys: poolKeys,
    ownerInfo: {
      associatedOnly: true,
      checkCreateATAOwner: true,
    },
    computeBudgetConfig: {
      units: 600000,
      microLamports: 465915,
    },
  })

  // printSimulate(transactions)

  printSimulateInfo()
  console.log('execute tx..')
  // sequentially should always to be true because first tx does initialize token accounts needed for swap
  const { txIds } = await execute({ sequentially: true })
  console.log('txIds:', txIds)
  txIds.forEach((txId) => console.log(`https://explorer.solana.com/tx/${txId}`))

  process.exit() // if you don't want to end up node execution, comment this line
}
/** uncomment code below to execute */
// routeSwap()


import { Transaction, VersionedTransaction, sendAndConfirmTransaction } from '@solana/web3.js'
import { NATIVE_MINT } from '@solana/spl-token'
import axios from 'axios'
import { connection, owner, fetchTokenAccountData } from '../config'
import { API_URLS } from '@raydium-io/raydium-sdk-v2'

interface SwapCompute {
  id: string
  success: true
  version: 'V0' | 'V1'
  openTime?: undefined
  msg: undefined
  data: {
    swapType: 'BaseIn' | 'BaseOut'
    inputMint: string
    inputAmount: string
    outputMint: string
    outputAmount: string
    otherAmountThreshold: string
    slippageBps: number
    priceImpactPct: number
    routePlan: {
      poolId: string
      inputMint: string
      outputMint: string
      feeMint: string
      feeRate: number
      feeAmount: string
    }[]
  }
}

export const apiSwap = async () => {
  const inputMint = NATIVE_MINT.toBase58()
  const outputMint = '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' // RAY
  const amount = 10000
  const slippage = 0.5 // in percent, for this example, 0.5 means 0.5%
  const txVersion: string = 'V0' // or LEGACY
  const isV0Tx = txVersion === 'V0'

  const [isInputSol, isOutputSol] = [inputMint === NATIVE_MINT.toBase58(), outputMint === NATIVE_MINT.toBase58()]

  const { tokenAccounts } = await fetchTokenAccountData()
  const inputTokenAcc = tokenAccounts.find((a) => a.mint.toBase58() === inputMint)?.publicKey
  const outputTokenAcc = tokenAccounts.find((a) => a.mint.toBase58() === outputMint)?.publicKey

  if (!inputTokenAcc && !isInputSol) {
    console.error('do not have input token account')
    return
  }

  // get statistical transaction fee from api
  /**
   * vh: very high
   * h: high
   * m: medium
   */
  const { data } = await axios.get<{
    id: string
    success: boolean
    data: { default: { vh: number; h: number; m: number } }
  }>(`${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`)

  const { data: swapResponse } = await axios.get<SwapCompute>(
    `${
      API_URLS.SWAP_HOST
    }/compute/swap-base-in?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${
      slippage * 100
    }&txVersion=${txVersion}`
  )

  const { data: swapTransactions } = await axios.post<{
    id: string
    version: string
    success: boolean
    data: { transaction: string }[]
  }>(`${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
    computeUnitPriceMicroLamports: String(data.data.default.h),
    swapResponse,
    txVersion,
    wallet: owner.publicKey.toBase58(),
    wrapSol: isInputSol,
    unwrapSol: isOutputSol, // true means output mint receive sol, false means output mint received wsol
    inputAccount: isInputSol ? undefined : inputTokenAcc?.toBase58(),
    outputAccount: isOutputSol ? undefined : outputTokenAcc?.toBase58(),
  })

  const allTxBuf = swapTransactions.data.map((tx) => Buffer.from(tx.transaction, 'base64'))
  const allTransactions = allTxBuf.map((txBuf) =>
    isV0Tx ? VersionedTransaction.deserialize(txBuf) : Transaction.from(txBuf)
  )

  console.log(`total ${allTransactions.length} transactions`, swapTransactions)

  let idx = 0
  if (!isV0Tx) {
    for (const tx of allTransactions) {
      console.log(`${++idx} transaction sending...`)
      const transaction = tx as Transaction
      transaction.sign(owner)
      const txId = await sendAndConfirmTransaction(connection, transaction, [owner], { skipPreflight: true })
      console.log(`${++idx} transaction confirmed, txId: ${txId}`)
    }
  } else {
    for (const tx of allTransactions) {
      idx++
      const transaction = tx as VersionedTransaction
      transaction.sign([owner])
      const txId = await connection.sendTransaction(tx as VersionedTransaction, { skipPreflight: true })
      const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash({
        commitment: 'finalized',
      })
      console.log(`${idx} transaction sending..., txId: ${txId}`)
      await connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          signature: txId,
        },
        'confirmed'
      )
      console.log(`${idx} transaction confirmed`)
    }
  }
}
// apiSwap()

import { ApiV3PoolInfoStandardItem, AmmV4Keys, AmmRpcData } from '@raydium-io/raydium-sdk-v2'
import { initSdk, txVersion } from '../config'
import BN from 'bn.js'
import { isValidAmm } from './utils'
import Decimal from 'decimal.js'
import { NATIVE_MINT } from '@solana/spl-token'
import { printSimulateInfo } from '../util'
import { PublicKey } from '@solana/web3.js'

export const swap = async () => {
  const raydium = await initSdk()
  const amountIn = 500
  const inputMint = NATIVE_MINT.toBase58()
  const poolId = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2' // SOL-USDC pool

  let poolInfo: ApiV3PoolInfoStandardItem | undefined
  let poolKeys: AmmV4Keys | undefined
  let rpcData: AmmRpcData

  if (raydium.cluster === 'mainnet') {
    // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
    // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
    const data = await raydium.api.fetchPoolById({ ids: poolId })
    poolInfo = data[0] as ApiV3PoolInfoStandardItem
    if (!isValidAmm(poolInfo.programId)) throw new Error('target pool is not AMM pool')
    poolKeys = await raydium.liquidity.getAmmPoolKeys(poolId)
    rpcData = await raydium.liquidity.getRpcPoolInfo(poolId)
  } else {
    // note: getPoolInfoFromRpc method only return required pool data for computing not all detail pool info
    const data = await raydium.liquidity.getPoolInfoFromRpc({ poolId })
    poolInfo = data.poolInfo
    poolKeys = data.poolKeys
    rpcData = data.poolRpcData
  }
  const [baseReserve, quoteReserve, status] = [rpcData.baseReserve, rpcData.quoteReserve, rpcData.status.toNumber()]

  if (poolInfo.mintA.address !== inputMint && poolInfo.mintB.address !== inputMint)
    throw new Error('input mint does not match pool')

  const baseIn = inputMint === poolInfo.mintA.address
  const [mintIn, mintOut] = baseIn ? [poolInfo.mintA, poolInfo.mintB] : [poolInfo.mintB, poolInfo.mintA]

  const out = raydium.liquidity.computeAmountOut({
    poolInfo: {
      ...poolInfo,
      baseReserve,
      quoteReserve,
      status,
      version: 4,
    },
    amountIn: new BN(amountIn),
    mintIn: mintIn.address,
    mintOut: mintOut.address,
    slippage: 0.01, // range: 1 ~ 0.0001, means 100% ~ 0.01%
  })

  console.log(
    `computed swap ${new Decimal(amountIn)
      .div(10 ** mintIn.decimals)
      .toDecimalPlaces(mintIn.decimals)
      .toString()} ${mintIn.symbol || mintIn.address} to ${new Decimal(out.amountOut.toString())
      .div(10 ** mintOut.decimals)
      .toDecimalPlaces(mintOut.decimals)
      .toString()} ${mintOut.symbol || mintOut.address}, minimum amount out ${new Decimal(out.minAmountOut.toString())
      .div(10 ** mintOut.decimals)
      .toDecimalPlaces(mintOut.decimals)} ${mintOut.symbol || mintOut.address}`
  )

  const { execute } = await raydium.liquidity.swap({
    poolInfo,
    poolKeys,
    amountIn: new BN(amountIn),
    amountOut: out.minAmountOut, // out.amountOut means amount 'without' slippage
    fixedSide: 'in',
    inputMint: mintIn.address,
    txVersion,

    // optional: set up token account
    // config: {
    //   inputUseSolBalance: true, // default: true, if you want to use existed wsol token account to pay token in, pass false
    //   outputUseSolBalance: true, // default: true, if you want to use existed wsol token account to receive token out, pass false
    //   associatedOnly: true, // default: true, if you want to use ata only, pass true
    // },

    // optional: set up priority fee here
    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 46591500,
    // },

    // optional: add transfer sol to tip account instruction. e.g sent tip to jito
    // txTipConfig: {
    //   address: new PublicKey('96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5'),
    //   amount: new BN(10000000), // 0.01 sol
    // },
  })

  printSimulateInfo()
  // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
  const { txId } = await execute({ sendAndConfirm: true })
  console.log(`swap successfully in amm pool:`, { txId: `https://explorer.solana.com/tx/${txId}` })

  process.exit() // if you don't want to end up node execution, comment this line
}

/** uncomment code below to execute */
// swap()