import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

async function checkNewTokenBalances() {
    console.log('🔍 Checking new token balances...');
    
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const walletPubkey = new PublicKey('3kFU8bBJm7epTYcJUGhPCxFfyK52o2WmyMQX9SbDWr48');
    
    // New token mints
    const bonkMint = new PublicKey('GpRTjXEn6gTPhvbA225gtsbQeapd12JDXii8b33orzb5');
    const usdcMint = new PublicKey('Boo4LSXTuduNMZp6nag4cA6kg4FEkwz7QTA29pXXW3c7');
    
    try {
        // Check BONK balance
        const bonkTokenAccount = new PublicKey('6yp5wqt3XPV9aUEGah1iG4Yx2zTpPQGRXyfp5GAmddsu');
        try {
            const bonkAccount = await getAccount(connection, bonkTokenAccount);
            console.log(`🚀 BONK Balance: ${bonkAccount.amount.toString()} (${Number(bonkAccount.amount) / 1e9} BONK)`);
        } catch (error) {
            console.log('❌ BONK token account not found or has no balance');
            console.log(error);
        }
        
        // Check USDC balance  
        const usdcTokenAccount = new PublicKey('Ba56XXsmMRdwshZiwkUrsjvfUaDBVRgk4EyPzVdzaGu7');
        try {
            const usdcAccount = await getAccount(connection, usdcTokenAccount);
            console.log(`💵 USDC Balance: ${usdcAccount.amount.toString()} (${Number(usdcAccount.amount) / 1e6} USDC)`);
        } catch (error) {
            console.log('❌ USDC token account not found or has no balance');
            console.log(error);
        }
        
        // Also check if the associated token addresses are correct
        const bonkATA = await getAssociatedTokenAddress(bonkMint, walletPubkey);
        const usdcATA = await getAssociatedTokenAddress(usdcMint, walletPubkey);
        
        console.log('\n🔗 Expected Associated Token Addresses:');
        console.log(`BONK ATA: ${bonkATA.toString()}`);
        console.log(`USDC ATA: ${usdcATA.toString()}`);
        
        console.log('\n📝 Current Token Addresses in .env:');
        console.log(`BONK: 6yp5wqt3XPV9aUEGah1iG4Yx2zTpPQGRXyfp5GAmddsu`);
        console.log(`USDC: Ba56XXsmMRdwshZiwkUrsjvfUaDBVRgk4EyPzVdzaGu7`);
        
    } catch (error) {
        console.error('Error checking balances:', error);
    }
}

checkNewTokenBalances().catch(console.error);
