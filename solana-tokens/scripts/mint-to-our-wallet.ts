import { Connection, PublicKey, clusterApiUrl, Keypair, Transaction } from '@solana/web3.js';
import { 
    mintTo, 
    getOrCreateAssociatedTokenAccount,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';

const NETWORK = 'devnet';
const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

async function mintTokensToOurWallet() {
    console.log('🪙 Minting tokens to our wallet...');
    
    try {
        // Load our wallet keypair
        const walletKeypairData = JSON.parse(fs.readFileSync('wallet-keypair.json', 'utf8'));
        const walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletKeypairData.secretKey));
        
        console.log('📝 Our wallet:', walletKeypair.publicKey.toString());
        
        // Load token info
        const tokenInfo = JSON.parse(fs.readFileSync('token-addresses.json', 'utf8'));
        
        // BONK Token
        const bonkMint = new PublicKey(tokenInfo.tokens.BONK.mint);
        const bonkTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            walletKeypair,
            bonkMint,
            walletKeypair.publicKey
        );
        
        console.log('🚀 Minting 93 trillion BONK...');
        await mintTo(
            connection,
            walletKeypair,
            bonkMint,
            bonkTokenAccount.address,
            walletKeypair, // mint authority (we are the authority)
            93000000000000 * (10 ** tokenInfo.tokens.BONK.decimals)
        );
        
        // USDC Token
        const usdcMint = new PublicKey(tokenInfo.tokens.USDC.mint);
        const usdcTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            walletKeypair,
            usdcMint,
            walletKeypair.publicKey
        );
        
        console.log('💵 Minting 10 million USDC...');
        await mintTo(
            connection,
            walletKeypair,
            usdcMint,
            usdcTokenAccount.address,
            walletKeypair, // mint authority
            10000000 * (10 ** tokenInfo.tokens.USDC.decimals)
        );
        
        console.log('✅ Successfully minted tokens to our wallet!');
        
        // Update token addresses file
        tokenInfo.tokens.BONK.tokenAccount = bonkTokenAccount.address.toString();
        tokenInfo.tokens.USDC.tokenAccount = usdcTokenAccount.address.toString();
        tokenInfo.deployer = walletKeypair.publicKey.toString();
        
        fs.writeFileSync('token-addresses.json', JSON.stringify(tokenInfo, null, 2));
        
        console.log('📄 Updated token-addresses.json with new accounts');
        
    } catch (error) {
        console.error('❌ Error minting tokens:', error);
        
        // If minting fails because we're not the authority, let's just get SOL
        console.log('🔄 Requesting SOL airdrop instead...');
        
        try {
            const walletKeypairData = JSON.parse(fs.readFileSync('wallet-keypair.json', 'utf8'));
            const walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletKeypairData.secretKey));
            
            const signature = await connection.requestAirdrop(
                walletKeypair.publicKey,
                2 * 1000000000 // 2 SOL
            );
            
            await connection.confirmTransaction(signature);
            console.log('✅ Received 2 SOL airdrop');
            
        } catch (airdropError) {
            console.error('❌ Airdrop also failed:', airdropError);
        }
    }
}

mintTokensToOurWallet();
