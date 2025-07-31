import { 
    Connection, 
    Keypair, 
    PublicKey, 
    clusterApiUrl,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    getMint,
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccount
} from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const NETWORK = 'devnet';
const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

// Load wallet from environment
function loadWallet(): Keypair {
    console.log('🔑 Loading wallet from environment...');
    
    const envPath = path.join(__dirname, '../../.env');
    
    if (!fs.existsSync(envPath)) {
        throw new Error('❌ .env file not found. Run "yarn setup-wallet" first.');
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const secretKeyLine = envContent.split('\n').find(line => 
        line.startsWith('SOLANA_WALLET_SECRET_KEY=')
    );
    
    if (!secretKeyLine) {
        throw new Error('❌ SOLANA_WALLET_SECRET_KEY not found in .env. Run "yarn setup-wallet" first.');
    }
    
    const secretKeyString = secretKeyLine.split('=')[1];
    const secretKeyArray = JSON.parse(secretKeyString);
    const secretKey = Uint8Array.from(secretKeyArray);
    
    const wallet = Keypair.fromSecretKey(secretKey);
    console.log('✅ Wallet loaded:', wallet.publicKey.toString());
    
    return wallet;
}

async function createTokens() {
    console.log('🪙 Creating Mock BONK and USDC tokens on Solana', NETWORK);
    console.log('===============================================');
    
    // Load wallet
    const payer = loadWallet();
    console.log('📝 Using wallet:', payer.publicKey.toString());
    
    // Check balance
    const balance = await connection.getBalance(payer.publicKey);
    console.log('💰 Wallet balance:', balance / LAMPORTS_PER_SOL, 'SOL');
    
    if (balance < 0.1 * LAMPORTS_PER_SOL) {
        throw new Error('❌ Insufficient SOL balance. Need at least 0.1 SOL for token creation. Run "yarn setup-wallet" to get more SOL.');
    }
    
    const tokenInfo: any = {
        network: NETWORK,
        timestamp: new Date().toISOString(),
        deployer: payer.publicKey.toString(),
        deployerBalance: balance / LAMPORTS_PER_SOL,
        tokens: {}
    };
    
    try {
        // Create Mock BONK Token
        console.log('\n🚀 Creating Mock BONK token...');
        console.log('Creating mint with 5 decimals (same as real BONK)...');
        
        const bonkMint = await createMint(
            connection,
            payer,              // Fee payer
            payer.publicKey,    // Mint authority
            payer.publicKey,    // Freeze authority (can be null)
            5                   // Decimals (same as real BONK)
        );
        
        console.log('✅ Mock BONK mint created:', bonkMint.toString());
        console.log('🔗 Explorer:', `https://explorer.solana.com/address/${bonkMint.toString()}?cluster=${NETWORK}`);
        
        // Create associated token account for BONK
        console.log('🏦 Creating associated token account for BONK...');
        const bonkTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            bonkMint,
            payer.publicKey
        );
        
        console.log('✅ Mock BONK token account:', bonkTokenAccount.address.toString());
        
        // Store BONK info
        tokenInfo.tokens.BONK = {
            name: 'Mock BONK',
            symbol: 'mBONK',
            decimals: 5,
            mint: bonkMint.toString(),
            tokenAccount: bonkTokenAccount.address.toString(),
            authority: payer.publicKey.toString(),
            supply: '0',
            targetSupply: '93000000000000', // 93 trillion
            targetSupplyFormatted: '93,000,000,000,000'
        };
        
        // Create Mock USDC Token
        console.log('\n💵 Creating Mock USDC token...');
        console.log('Creating mint with 6 decimals (same as real USDC)...');
        
        const usdcMint = await createMint(
            connection,
            payer,              // Fee payer
            payer.publicKey,    // Mint authority
            payer.publicKey,    // Freeze authority
            6                   // Decimals (same as real USDC)
        );
        
        console.log('✅ Mock USDC mint created:', usdcMint.toString());
        console.log('🔗 Explorer:', `https://explorer.solana.com/address/${usdcMint.toString()}?cluster=${NETWORK}`);
        
        // Create associated token account for USDC
        console.log('🏦 Creating associated token account for USDC...');
        const usdcTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            usdcMint,
            payer.publicKey
        );
        
        console.log('✅ Mock USDC token account:', usdcTokenAccount.address.toString());
        
        // Store USDC info
        tokenInfo.tokens.USDC = {
            name: 'Mock USD Coin',
            symbol: 'mUSDC',
            decimals: 6,
            mint: usdcMint.toString(),
            tokenAccount: usdcTokenAccount.address.toString(),
            authority: payer.publicKey.toString(),
            supply: '0',
            targetSupply: '10000000', // 10 million
            targetSupplyFormatted: '10,000,000'
        };
        
        // Save token addresses (before minting)
        const tokenAddressesPath = path.join(__dirname, '../token-addresses.json');
        fs.writeFileSync(tokenAddressesPath, JSON.stringify(tokenInfo, null, 2));
        console.log('\n💾 Token addresses saved to:', tokenAddressesPath);
        
        // Initial minting
        console.log('\n🪙 Minting initial token supplies...');
        console.log('===================================');
        
        // Mint 93 trillion BONK (same as real BONK supply)
        console.log('\n🚀 Minting Mock BONK...');
        const bonkSupply = BigInt(93_000_000_000_000) * BigInt(10 ** 5); // 93T with 5 decimals
        console.log('Minting amount:', bonkSupply.toString(), 'raw units');
        
        await mintTo(
            connection,
            payer,
            bonkMint,
            bonkTokenAccount.address,
            payer.publicKey,
            bonkSupply
        );
        
        const bonkReadableSupply = Number(bonkSupply) / (10 ** 5);
        console.log('✅ Minted', bonkReadableSupply.toLocaleString(), 'Mock BONK tokens');
        
        // Mint 10 million USDC for testing
        console.log('\n💵 Minting Mock USDC...');
        const usdcSupply = BigInt(10_000_000) * BigInt(10 ** 6); // 10M with 6 decimals
        console.log('Minting amount:', usdcSupply.toString(), 'raw units');
        
        await mintTo(
            connection,
            payer,
            usdcMint,
            usdcTokenAccount.address,
            payer.publicKey,
            usdcSupply
        );
        
        const usdcReadableSupply = Number(usdcSupply) / (10 ** 6);
        console.log('✅ Minted', usdcReadableSupply.toLocaleString(), 'Mock USDC tokens');
        
        // Update supply info and save again
        tokenInfo.tokens.BONK.supply = bonkSupply.toString();
        tokenInfo.tokens.USDC.supply = usdcSupply.toString();
        tokenInfo.mintTimestamp = new Date().toISOString();
        
        fs.writeFileSync(tokenAddressesPath, JSON.stringify(tokenInfo, null, 2));
        
        // Final balance check
        const finalBalance = await connection.getBalance(payer.publicKey);
        const deploymentCost = (balance - finalBalance) / LAMPORTS_PER_SOL;
        
        console.log('\n🎯 Token Creation Summary:');
        console.log('==========================');
        console.log('Network:', NETWORK);
        console.log('Deployer:', payer.publicKey.toString());
        console.log('Deployment Cost:', deploymentCost.toFixed(4), 'SOL');
        console.log('Remaining Balance:', (finalBalance / LAMPORTS_PER_SOL).toFixed(4), 'SOL');
        
        console.log('\n🚀 Mock BONK:');
        console.log('  Name:', tokenInfo.tokens.BONK.name);
        console.log('  Symbol:', tokenInfo.tokens.BONK.symbol);
        console.log('  Decimals:', tokenInfo.tokens.BONK.decimals);
        console.log('  Mint:', bonkMint.toString());
        console.log('  Supply:', bonkReadableSupply.toLocaleString(), 'tokens');
        console.log('  Explorer:', `https://explorer.solana.com/address/${bonkMint.toString()}?cluster=${NETWORK}`);
        
        console.log('\n💵 Mock USDC:');
        console.log('  Name:', tokenInfo.tokens.USDC.name);
        console.log('  Symbol:', tokenInfo.tokens.USDC.symbol);
        console.log('  Decimals:', tokenInfo.tokens.USDC.decimals);
        console.log('  Mint:', usdcMint.toString());
        console.log('  Supply:', usdcReadableSupply.toLocaleString(), 'tokens');
        console.log('  Explorer:', `https://explorer.solana.com/address/${usdcMint.toString()}?cluster=${NETWORK}`);
        
        console.log('\n🎉 SUCCESS! All tokens created and minted successfully!');
        console.log('💡 You can now integrate these addresses into your BIFE app');
        
        return tokenInfo;
        
    } catch (error) {
        console.error('❌ Error creating tokens:', error);
        throw error;
    }
}

if (require.main === module) {
    createTokens()
        .then((tokenInfo) => {
            console.log('\n🏁 Token creation completed successfully');
            console.log('\n📋 Next steps:');
            console.log('1. Copy the token addresses from token-addresses.json');
            console.log('2. Update your BIFE app with these addresses');
            console.log('3. Test trading functionality with real deployed tokens');
            console.log('4. Use "yarn airdrop" to send tokens to test wallets');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Token creation failed:', error);
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Make sure you ran "yarn setup-wallet" first');
            console.log('2. Ensure you have enough SOL (check with "solana balance")');
            console.log('3. Try again or request more SOL from https://faucet.solana.com/');
            process.exit(1);
        });
}

export { createTokens };
