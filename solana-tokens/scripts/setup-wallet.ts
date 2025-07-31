import { Keypair, PublicKey, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

const NETWORK = 'devnet';
const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

async function setupWallet() {
    console.log('🔐 Generating new Solana wallet for devnet deployment...');
    
    // Generate new keypair
    const wallet = Keypair.generate();
    const publicKey = wallet.publicKey.toString();
    const privateKeyArray = Array.from(wallet.secretKey);
    const privateKeyBase58 = Buffer.from(wallet.secretKey).toString('base64');
    
    console.log('✅ New wallet generated:');
    console.log('Public Key:', publicKey);
    console.log('Private Key (Base58):', privateKeyBase58.substring(0, 20) + '...');
    
    // Check initial balance
    const initialBalance = await connection.getBalance(wallet.publicKey);
    console.log('💰 Initial balance:', initialBalance / LAMPORTS_PER_SOL, 'SOL');
    
    // Create .env file in project root
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';
    
    try {
        envContent = fs.readFileSync(envPath, 'utf8');
        console.log('📝 Found existing .env file, updating...');
    } catch (error) {
        console.log('📝 Creating new .env file...');
    }
    
    // Remove existing wallet entries
    const envLines = envContent.split('\n').filter(line => 
        !line.startsWith('SOLANA_WALLET_PUBLIC_KEY=') &&
        !line.startsWith('SOLANA_WALLET_PRIVATE_KEY=') &&
        !line.startsWith('SOLANA_WALLET_SECRET_KEY=') &&
        !line.startsWith('SOLANA_NETWORK=')
    );
    
    // Add new wallet configuration
    envLines.push('');
    envLines.push('# Solana Devnet Wallet Configuration');
    envLines.push(`SOLANA_WALLET_PUBLIC_KEY=${publicKey}`);
    envLines.push(`SOLANA_WALLET_PRIVATE_KEY=${privateKeyBase58}`);
    envLines.push(`SOLANA_WALLET_SECRET_KEY=[${privateKeyArray.join(',')}]`);
    envLines.push(`SOLANA_NETWORK=${NETWORK}`);
    envLines.push('');
    
    // Write updated .env
    fs.writeFileSync(envPath, envLines.join('\n'));
    console.log('💾 Updated .env file with wallet credentials');
    
    // Save wallet keypair to file for backup
    const walletPath = path.join(__dirname, '../wallet-keypair.json');
    fs.writeFileSync(walletPath, JSON.stringify({
        publicKey: publicKey,
        secretKey: privateKeyArray,
        privateKeyBase58: privateKeyBase58,
        network: NETWORK,
        generated: new Date().toISOString()
    }, null, 2));
    
    console.log('🔑 Wallet keypair saved to:', walletPath);
    
    // Request devnet SOL airdrop
    console.log('\n🚰 Requesting devnet SOL airdrop...');
    try {
        const airdropSignature = await connection.requestAirdrop(
            wallet.publicKey,
            2 * LAMPORTS_PER_SOL // Request 2 SOL
        );
        
        console.log('📡 Airdrop transaction:', airdropSignature);
        console.log('⏳ Waiting for confirmation...');
        
        await connection.confirmTransaction(airdropSignature);
        
        // Check new balance
        const newBalance = await connection.getBalance(wallet.publicKey);
        console.log('✅ Airdrop successful!');
        console.log('💰 New balance:', newBalance / LAMPORTS_PER_SOL, 'SOL');
        
        if (newBalance < 1 * LAMPORTS_PER_SOL) {
            console.log('⚠️  Balance might be low. Requesting additional SOL...');
            try {
                const secondAirdrop = await connection.requestAirdrop(
                    wallet.publicKey,
                    1 * LAMPORTS_PER_SOL
                );
                await connection.confirmTransaction(secondAirdrop);
                const finalBalance = await connection.getBalance(wallet.publicKey);
                console.log('💰 Final balance:', finalBalance / LAMPORTS_PER_SOL, 'SOL');
            } catch (secondError) {
                console.log('⚠️  Second airdrop failed, but we have enough SOL to proceed');
            }
        }
        
    } catch (error) {
        console.error('❌ Airdrop failed:', error);
        console.log('💡 You can manually request SOL from: https://faucet.solana.com/');
        console.log('🔗 Use this public key:', publicKey);
        console.log('⚠️  Make sure to get at least 1 SOL for token deployment');
    }
    
    console.log('\n🎯 Wallet Setup Complete!');
    console.log('=========================');
    console.log('Network:', NETWORK);
    console.log('Public Key:', publicKey);
    console.log('Explorer URL:', `https://explorer.solana.com/address/${publicKey}?cluster=${NETWORK}`);
    console.log('\n🚀 Ready to deploy tokens!');
    
    return {
        wallet,
        publicKey,
        privateKey: privateKeyBase58
    };
}

if (require.main === module) {
    setupWallet()
        .then(() => {
            console.log('🏁 Wallet setup completed successfully');
            console.log('💡 Next step: Run "yarn create-tokens" to deploy tokens');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Wallet setup failed:', error);
            process.exit(1);
        });
}

export { setupWallet };
