import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { findMetadataPda, fetchMetadata, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';

async function verifyTokenMetadata() {
    console.log('🔍 Verifying token metadata...');
    
    try {
        // Initialize UMI
        const umi = createUmi('https://api.devnet.solana.com')
            .use(mplTokenMetadata());
        
        // Our token mint addresses
        const bonkMint = publicKey('GpRTjXEn6gTPhvbA225gtsbQeapd12JDXii8b33orzb5');
        const usdcMint = publicKey('Boo4LSXTuduNMZp6nag4cA6kg4FEkwz7QTA29pXXW3c7');
        
        // Check BONK metadata
        console.log('\n🚀 BONK Metadata:');
        try {
            const bonkMetadataPda = findMetadataPda(umi, { mint: bonkMint });
            const bonkMetadata = await fetchMetadata(umi, bonkMetadataPda);
            
            console.log(`✅ Name: ${bonkMetadata.name}`);
            console.log(`✅ Symbol: ${bonkMetadata.symbol}`);
            console.log(`✅ URI: ${bonkMetadata.uri}`);
            console.log(`✅ Metadata Account: ${bonkMetadataPda[0]}`);
        } catch (error) {
            console.log('❌ BONK metadata not found:', error);
        }
        
        // Check USDC metadata
        console.log('\n💵 USDC Metadata:');
        try {
            const usdcMetadataPda = findMetadataPda(umi, { mint: usdcMint });
            const usdcMetadata = await fetchMetadata(umi, usdcMetadataPda);
            
            console.log(`✅ Name: ${usdcMetadata.name}`);
            console.log(`✅ Symbol: ${usdcMetadata.symbol}`);
            console.log(`✅ URI: ${usdcMetadata.uri}`);
            console.log(`✅ Metadata Account: ${usdcMetadataPda[0]}`);
        } catch (error) {
            console.log('❌ USDC metadata not found:', error);
        }
        
        console.log('\n🔗 Explorer Links:');
        console.log(`BONK Mint: https://explorer.solana.com/address/${bonkMint}?cluster=devnet`);
        console.log(`USDC Mint: https://explorer.solana.com/address/${usdcMint}?cluster=devnet`);
        
    } catch (error) {
        console.error('❌ Error verifying metadata:', error);
    }
}

verifyTokenMetadata().catch(console.error);
