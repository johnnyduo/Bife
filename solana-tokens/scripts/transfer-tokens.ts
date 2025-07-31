import { Connection, PublicKey, clusterApiUrl, Keypair, Transaction } from '@solana/web3.js';
import { 
    transfer, 
    getOrCreateAssociatedTokenAccount,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAccount
} from '@solana/spl-token';
import * as fs from 'fs';

const NETWORK = 'devnet';
const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

async function transferTokensToNewWallet() {
    console.log('🔄 Transferring tokens from old wallet to new wallet...');
    
    try {
        // Old wallet (where tokens currently are) - we need its private key
        const oldWalletPublicKey = new PublicKey('5qX8VcUJGhHwXuVUknPa2TuQoKffWZnk5HPNUeUbpJnA');
        
        // New wallet (our wallet with private key)
        const walletKeypairData = JSON.parse(fs.readFileSync('wallet-keypair.json', 'utf8'));
        const newWalletKeypair = Keypair.fromSecretKey(new Uint8Array(walletKeypairData.secretKey));
        
        console.log('📝 Old wallet:', oldWalletPublicKey.toString());
        console.log('📝 New wallet:', newWalletKeypair.publicKey.toString());
        
        // Load token info
        const tokenInfo = JSON.parse(fs.readFileSync('token-addresses.json', 'utf8'));
        
        const bonkMint = new PublicKey(tokenInfo.tokens.BONK.mint);
        const usdcMint = new PublicKey(tokenInfo.tokens.USDC.mint);
        
        // Check balances in old wallet first
        console.log('🔍 Checking token balances in old wallet...');
        
        try {
            // Get old wallet's token accounts
            const oldWalletTokenAccounts = await connection.getParsedTokenAccountsByOwner(
                oldWalletPublicKey,
                { programId: TOKEN_PROGRAM_ID }
            );
            
            console.log('📊 Found', oldWalletTokenAccounts.value.length, 'token accounts in old wallet');
            
            let bonkBalance = 0;
            let usdcBalance = 0;
            let bonkTokenAccount = null;
            let usdcTokenAccount = null;
            
            oldWalletTokenAccounts.value.forEach(account => {
                const mint = account.account.data.parsed.info.mint;
                const balance = account.account.data.parsed.info.tokenAmount.uiAmount;
                
                if (mint === bonkMint.toString()) {
                    bonkBalance = balance;
                    bonkTokenAccount = new PublicKey(account.pubkey);
                    console.log('🚀 BONK balance in old wallet:', bonkBalance);
                }
                if (mint === usdcMint.toString()) {
                    usdcBalance = balance;
                    usdcTokenAccount = new PublicKey(account.pubkey);
                    console.log('💵 USDC balance in old wallet:', usdcBalance);
                }
            });
            
            if (bonkBalance === 0 && usdcBalance === 0) {
                console.log('ℹ️ No tokens found in old wallet to transfer');
                return;
            }
            
            console.log('❌ Cannot transfer: We do not have the private key for the old wallet');
            console.log('💡 The tokens are currently in wallet 5qX8VcUJGhHwXuVUknPa2TuQoKffWZnk5HPNUeUbpJnA');
            console.log('💡 We only have the private key for wallet 3kFU8bBJm7epTYcJUGhPCxFfyK52o2WmyMQX9SbDWr48');
            
        } catch (error) {
            console.log('ℹ️ Old wallet has no token accounts or is empty');
        }
        
        // Check new wallet balances
        console.log('🔍 Checking current balances in new wallet...');
        const newWalletTokenAccounts = await connection.getParsedTokenAccountsByOwner(
            newWalletKeypair.publicKey,
            { programId: TOKEN_PROGRAM_ID }
        );
        
        console.log('📊 Found', newWalletTokenAccounts.value.length, 'token accounts in new wallet');
        
        newWalletTokenAccounts.value.forEach(account => {
            const mint = account.account.data.parsed.info.mint;
            const balance = account.account.data.parsed.info.tokenAmount.uiAmount;
            
            if (mint === bonkMint.toString()) {
                console.log('🚀 BONK balance in new wallet:', balance);
            }
            if (mint === usdcMint.toString()) {
                console.log('💵 USDC balance in new wallet:', balance);
            }
        });
        
        console.log('✅ Balance check complete');
        
    } catch (error) {
        console.error('❌ Error during transfer attempt:', error);
    }
}

transferTokensToNewWallet();
