import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';

const NETWORK = 'devnet';
const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

async function checkBalance() {
    console.log('💰 Checking wallet and token balances...');
    
    try {
        // Load wallet info
        const envPath = path.join(__dirname, '../../.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const publicKeyLine = envContent.split('\n').find(line => 
            line.startsWith('SOLANA_WALLET_PUBLIC_KEY=')
        );
        
        if (!publicKeyLine) {
            throw new Error('Wallet not found. Run "yarn setup-wallet" first.');
        }
        
        const publicKeyString = publicKeyLine.split('=')[1];
        const walletPublicKey = new PublicKey(publicKeyString);
        
        console.log('📝 Wallet:', walletPublicKey.toString());
        
        // Check SOL balance
        const solBalance = await connection.getBalance(walletPublicKey);
        console.log('💰 SOL Balance:', (solBalance / LAMPORTS_PER_SOL).toFixed(4), 'SOL');
        
        // Load token info if exists
        const tokenAddressesPath = path.join(__dirname, '../token-addresses.json');
        if (fs.existsSync(tokenAddressesPath)) {
            const tokenInfo = JSON.parse(fs.readFileSync(tokenAddressesPath, 'utf8'));
            
            console.log('\n🪙 Token Balances:');
            
            // Check BONK balance
            if (tokenInfo.tokens.BONK) {
                try {
                    const bonkTokenAccount = new PublicKey(tokenInfo.tokens.BONK.tokenAccount);
                    const bonkAccount = await getAccount(connection, bonkTokenAccount);
                    const bonkBalance = Number(bonkAccount.amount) / (10 ** tokenInfo.tokens.BONK.decimals);
                    console.log('🚀 Mock BONK:', bonkBalance.toLocaleString(), 'tokens');
                } catch (error) {
                    console.log('🚀 Mock BONK: Token account not found or empty');
                }
            }
            
            // Check USDC balance
            if (tokenInfo.tokens.USDC) {
                try {
                    const usdcTokenAccount = new PublicKey(tokenInfo.tokens.USDC.tokenAccount);
                    const usdcAccount = await getAccount(connection, usdcTokenAccount);
                    const usdcBalance = Number(usdcAccount.amount) / (10 ** tokenInfo.tokens.USDC.decimals);
                    console.log('💵 Mock USDC:', usdcBalance.toLocaleString(), 'tokens');
                } catch (error) {
                    console.log('💵 Mock USDC: Token account not found or empty');
                }
            }
            
            console.log('\n🔗 Explorer Links:');
            console.log('Wallet:', `https://explorer.solana.com/address/${walletPublicKey.toString()}?cluster=${NETWORK}`);
            if (tokenInfo.tokens.BONK) {
                console.log('BONK Mint:', `https://explorer.solana.com/address/${tokenInfo.tokens.BONK.mint}?cluster=${NETWORK}`);
            }
            if (tokenInfo.tokens.USDC) {
                console.log('USDC Mint:', `https://explorer.solana.com/address/${tokenInfo.tokens.USDC.mint}?cluster=${NETWORK}`);
            }
        } else {
            console.log('\n⚠️  No tokens deployed yet. Run "yarn create-tokens" to deploy tokens.');
        }
        
    } catch (error) {
        console.error('❌ Error checking balances:', error);
        throw error;
    }
}

if (require.main === module) {
    checkBalance()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Balance check failed:', error);
            process.exit(1);
        });
}

export { checkBalance };
