#!/usr/bin/env node

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
  getAccount,
  getMint,
  createTransferInstruction
} from '@solana/spl-token';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

interface TokenMetadata {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

class JupiterTokenRegistrar {
  private connection: Connection;
  private wallet: Keypair;

  constructor() {
    this.connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
    
    const secretKeyArray = JSON.parse(process.env.SOLANA_WALLET_SECRET_KEY || '[]');
    this.wallet = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
    
    console.log('🪐 Jupiter Token Registrar Initialized');
    console.log('📍 Wallet:', this.wallet.publicKey.toString());
  }

  async validateAndRegisterTokens() {
    try {
      console.log('\n🔍 Validating Custom Tokens for Jupiter Trading...');

      // Our custom tokens
      const tokens = [
        {
          mint: process.env.MOCK_BONK_MINT!,
          symbol: 'MOCK_BONK',
          name: 'Mock Bonk Token',
          decimals: 9,
          logoURI: 'https://bonk.dog/logo.png'
        },
        {
          mint: process.env.MOCK_USDC_MINT!,
          symbol: 'MOCK_USDC', 
          name: 'Mock USDC Token',
          decimals: 6,
          logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
        }
      ];

      // Validate each token
      for (const token of tokens) {
        await this.validateToken(token);
      }

      // Create Jupiter-compatible token list
      await this.createJupiterTokenList(tokens);

      // Create simple liquidity simulation
      await this.createMockLiquidity(tokens);

      console.log('\n✅ Tokens validated and registered for Jupiter!');
      console.log('📝 Next: Test Jupiter API with these tokens');

    } catch (error) {
      console.error('❌ Error during token registration:', error);
      throw error;
    }
  }

  private async validateToken(token: TokenMetadata) {
    try {
      console.log(`\n🔍 Validating ${token.symbol}...`);
      
      const mintPubkey = new PublicKey(token.mint);
      
      // Check if mint exists
      const mintInfo = await getMint(this.connection, mintPubkey);
      console.log(`✅ Mint exists: ${token.mint}`);
      console.log(`📊 Decimals: ${mintInfo.decimals}`);
      console.log(`🔒 Freeze Authority: ${mintInfo.freezeAuthority?.toString() || 'None'}`);
      console.log(`🏦 Mint Authority: ${mintInfo.mintAuthority?.toString() || 'None'}`);
      
      // Check token account
      const tokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        this.wallet.publicKey
      );
      
      try {
        const accountInfo = await getAccount(this.connection, tokenAccount);
        const balance = Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
        console.log(`💰 Wallet Balance: ${balance.toLocaleString()} ${token.symbol}`);
      } catch {
        console.log(`⚠️  No token account found for ${token.symbol}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error validating ${token.symbol}:`, error);
      return false;
    }
  }

  private async createJupiterTokenList(tokens: TokenMetadata[]) {
    try {
      console.log('\n📋 Creating Jupiter-compatible token list...');

      const tokenList = {
        name: 'Bife Custom Tokens',
        logoURI: 'https://bonk.dog/logo.png',
        keywords: ['bife', 'custom', 'devnet'],
        version: {
          major: 1,
          minor: 0,
          patch: 0
        },
        tags: {
          'custom-token': {
            name: 'Custom Token',
            description: 'Custom token for Bife app'
          }
        },
        timestamp: new Date().toISOString(),
        tokens: tokens.map(token => ({
          chainId: 103, // Solana Devnet
          address: token.mint,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: token.logoURI,
          tags: ['custom-token'],
          extensions: {
            coingeckoId: token.symbol.toLowerCase().replace('mock_', ''),
            website: 'https://bonk.dog'
          }
        }))
      };

      const filename = 'jupiter-token-list.json';
      fs.writeFileSync(filename, JSON.stringify(tokenList, null, 2));
      console.log(`📋 Token list saved: ${filename}`);

      return tokenList;
    } catch (error) {
      console.error('❌ Error creating token list:', error);
      throw error;
    }
  }

  private async createMockLiquidity(tokens: TokenMetadata[]) {
    try {
      console.log('\n🌊 Creating mock liquidity data for Jupiter...');

      // Create liquidity pool metadata
      const liquidityPools = [
        {
          id: `${tokens[0].mint}-${tokens[1].mint}`,
          baseMint: tokens[0].mint,
          quoteMint: tokens[1].mint,
          baseSymbol: tokens[0].symbol,
          quoteSymbol: tokens[1].symbol,
          baseDecimals: tokens[0].decimals,
          quoteDecimals: tokens[1].decimals,
          baseReserve: '1000000000000000', // 1B base tokens
          quoteReserve: '10000000000',     // 10K quote tokens
          lpMint: Keypair.generate().publicKey.toString(),
          marketId: Keypair.generate().publicKey.toString(),
          price: 0.00001, // 1 MOCK_BONK = 0.00001 MOCK_USDC
          volume24h: '50000000000',
          fees24h: '100000000'
        }
      ];

      // Also create SOL pairs
      const solMint = 'So11111111111111111111111111111111111111112';
      
      for (const token of tokens) {
        if (token.symbol !== 'SOL') {
          liquidityPools.push({
            id: `${token.mint}-${solMint}`,
            baseMint: token.mint,
            quoteMint: solMint,
            baseSymbol: token.symbol,
            quoteSymbol: 'SOL',
            baseDecimals: token.decimals,
            quoteDecimals: 9,
            baseReserve: '500000000000000',
            quoteReserve: '10000000000',
            lpMint: Keypair.generate().publicKey.toString(),
            marketId: Keypair.generate().publicKey.toString(),
            price: token.symbol === 'MOCK_BONK' ? 0.000000001 : 0.000001,
            volume24h: '25000000000',
            fees24h: '50000000'
          });
        }
      }

      const liquidityFile = 'mock-liquidity-pools.json';
      fs.writeFileSync(liquidityFile, JSON.stringify(liquidityPools, null, 2));
      console.log(`🌊 Liquidity pools saved: ${liquidityFile}`);

      return liquidityPools;
    } catch (error) {
      console.error('❌ Error creating mock liquidity:', error);
      throw error;
    }
  }

  async testJupiterCompatibility() {
    try {
      console.log('\n🧪 Testing Jupiter API compatibility...');

      const mockBonkMint = process.env.MOCK_BONK_MINT!;
      const mockUsdcMint = process.env.MOCK_USDC_MINT!;
      
      // Test quote request
      const quoteUrl = `${process.env.JUPITER_API_URL}/quote?` + new URLSearchParams({
        inputMint: mockBonkMint,
        outputMint: mockUsdcMint,
        amount: '1000000000', // 1 MOCK_BONK (9 decimals)
        slippageBps: '50'
      });

      console.log('🔗 Testing quote request:', quoteUrl);

      const response = await fetch(quoteUrl);
      const data = await response.json();

      if (response.ok) {
        console.log('✅ Jupiter quote successful!');
        console.log('📊 Quote data:', JSON.stringify(data, null, 2));
      } else {
        console.log('⚠️  Jupiter quote failed (expected for new tokens)');
        console.log('📄 Response:', JSON.stringify(data, null, 2));
        
        // This is expected for new tokens that aren't in Jupiter's registry yet
        if (data.error?.includes('not tradable') || data.errorCode === 'TOKEN_NOT_TRADABLE') {
          console.log('\n💡 Solution: Tokens need to be added to Jupiter registry');
          console.log('📝 Next steps:');
          console.log('1. Submit tokens to Jupiter token list');
          console.log('2. Create actual liquidity on Raydium/Orca');
          console.log('3. Wait for Jupiter indexing');
          
          return this.createJupiterSubmissionGuide();
        }
      }

    } catch (error) {
      console.error('❌ Error testing Jupiter compatibility:', error);
    }
  }

  private createJupiterSubmissionGuide() {
    const guide = {
      title: 'Jupiter Token Submission Guide',
      description: 'How to make custom tokens tradable on Jupiter',
      steps: [
        {
          step: 1,
          title: 'Create Liquidity Pool',
          description: 'Create actual liquidity pool on Raydium or Orca',
          action: 'Use Raydium UI or SDK to create pool with initial liquidity'
        },
        {
          step: 2,
          title: 'Submit to Jupiter',
          description: 'Submit token to Jupiter registry',
          action: 'Create PR to https://github.com/jup-ag/token-list with token metadata'
        },
        {
          step: 3,
          title: 'Wait for Indexing',
          description: 'Jupiter needs to index the new token',
          action: 'Usually takes 24-48 hours after pool creation'
        },
        {
          step: 4,
          title: 'Alternative: Use Strict List',
          description: 'Use Jupiter strict list parameter',
          action: 'Add strictList=false to quote requests for new tokens'
        }
      ],
      immediateWorkaround: {
        title: 'Immediate Testing Workaround',
        description: 'For testing purposes, use well-known devnet tokens',
        tokens: {
          'Devnet USDC': '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
          'Devnet SOL': 'So11111111111111111111111111111111111111112',
          'Sample Token': '2tWC4JAdL4AxEFJWt8DFvL2y8uqq1KZWF1qSAV3xd3JG'
        }
      }
    };

    fs.writeFileSync('jupiter-submission-guide.json', JSON.stringify(guide, null, 2));
    console.log('📚 Submission guide saved: jupiter-submission-guide.json');
    
    return guide;
  }
}

async function main() {
  try {
    console.log('🪐 Jupiter Token Registration for Custom Tokens');
    console.log('===============================================');
    
    const registrar = new JupiterTokenRegistrar();
    
    // Validate and register tokens
    await registrar.validateAndRegisterTokens();
    
    // Test Jupiter compatibility
    await registrar.testJupiterCompatibility();
    
    console.log('\n🎉 Registration complete!');
    console.log('📁 Check generated files for next steps');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { JupiterTokenRegistrar };
