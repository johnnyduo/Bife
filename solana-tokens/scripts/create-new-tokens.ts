import { Connection, PublicKey, clusterApiUrl, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { 
    createMint,
    mintTo, 
    getOrCreateAssociatedTokenAccount,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import * as fs from 'fs';

const NETWORK = 'devnet';
const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

async function createAndMintNewTokens() {
    console.log('🪙 Creating new tokens with our wallet as mint authority...');
    
    try {
        // Our wallet keypair
        const walletKeypairData = JSON.parse(fs.readFileSync('wallet-keypair.json', 'utf8'));
        const walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletKeypairData.secretKey));
        
        console.log('📝 Our wallet:', walletKeypair.publicKey.toString());
        
        // Create BONK token
        console.log('🚀 Creating BONK token...');
        const bonkMint = await createMint(
            connection,
            walletKeypair,
            walletKeypair.publicKey, // mint authority
            walletKeypair.publicKey, // freeze authority
            5 // decimals (same as original)
        );
        
        console.log('✅ BONK mint created:', bonkMint.toString());
        
        // Create USDC token
        console.log('💵 Creating USDC token...');
        const usdcMint = await createMint(
            connection,
            walletKeypair,
            walletKeypair.publicKey, // mint authority
            walletKeypair.publicKey, // freeze authority
            6 // decimals (same as original)
        );
        
        console.log('✅ USDC mint created:', usdcMint.toString());
        
        // Create token accounts for our wallet
        const bonkTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            walletKeypair,
            bonkMint,
            walletKeypair.publicKey
        );
        
        const usdcTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            walletKeypair,
            usdcMint,
            walletKeypair.publicKey
        );
        
        console.log('🚀 BONK token account:', bonkTokenAccount.address.toString());
        console.log('💵 USDC token account:', usdcTokenAccount.address.toString());
        
        // Mint 10% of original supply
        // Original: 93T BONK, 10% = 9.3T BONK
        const bonkSupply = 9300000000000; // 9.3 trillion
        const bonkAmount = bonkSupply * (10 ** 5); // 5 decimals
        
        console.log('🚀 Minting 9.3 trillion BONK (10% of original supply)...');
        await mintTo(
            connection,
            walletKeypair,
            bonkMint,
            bonkTokenAccount.address,
            walletKeypair,
            bonkAmount
        );
        
        // Original: 10M USDC, 10% = 1M USDC
        const usdcSupply = 1000000; // 1 million
        const usdcAmount = usdcSupply * (10 ** 6); // 6 decimals
        
        console.log('💵 Minting 1 million USDC (10% of original supply)...');
        await mintTo(
            connection,
            walletKeypair,
            usdcMint,
            usdcTokenAccount.address,
            walletKeypair,
            usdcAmount
        );
        
        // Update token addresses file
        const tokenInfo = {
            network: 'devnet',
            timestamp: new Date().toISOString(),
            deployer: walletKeypair.publicKey.toString(),
            deployerBalance: await connection.getBalance(walletKeypair.publicKey) / 1000000000,
            tokens: {
                BONK: {
                    name: 'BONK',
                    symbol: 'BONK',
                    decimals: 5,
                    mint: bonkMint.toString(),
                    tokenAccount: bonkTokenAccount.address.toString(),
                    authority: walletKeypair.publicKey.toString(),
                    supply: bonkAmount.toString(),
                    targetSupply: bonkSupply,
                    targetSupplyFormatted: bonkSupply.toLocaleString()
                },
                USDC: {
                    name: 'USD Coin',
                    symbol: 'USDC',
                    decimals: 6,
                    mint: usdcMint.toString(),
                    tokenAccount: usdcTokenAccount.address.toString(),
                    authority: walletKeypair.publicKey.toString(),
                    supply: usdcAmount.toString(),
                    targetSupply: usdcSupply,
                    targetSupplyFormatted: usdcSupply.toLocaleString()
                }
            },
            mintTimestamp: new Date().toISOString()
        };
        
        fs.writeFileSync('token-addresses-new.json', JSON.stringify(tokenInfo, null, 2));
        
        console.log('📄 Created token-addresses-new.json with new token info');
        console.log('✅ Successfully created and minted new tokens!');
        console.log('🚀 BONK:', bonkSupply.toLocaleString(), 'tokens minted');
        console.log('💵 USDC:', usdcSupply.toLocaleString(), 'tokens minted');
        
        // Update .env file with new addresses
        const envContent = fs.readFileSync('../.env', 'utf8');
        const updatedEnv = envContent
            .replace(/MOCK_BONK_MINT=.*/g, `MOCK_BONK_MINT=${bonkMint.toString()}`)
            .replace(/MOCK_USDC_MINT=.*/g, `MOCK_USDC_MINT=${usdcMint.toString()}`)
            .replace(/BONK_TOKEN_ACCOUNT=.*/g, `BONK_TOKEN_ACCOUNT=${bonkTokenAccount.address.toString()}`)
            .replace(/USDC_TOKEN_ACCOUNT=.*/g, `USDC_TOKEN_ACCOUNT=${usdcTokenAccount.address.toString()}`);
        
        fs.writeFileSync('../.env', updatedEnv);
        console.log('📝 Updated .env file with new token addresses');
        
    } catch (error) {
        console.error('❌ Error creating tokens:', error);
    }
}

createAndMintNewTokens();
