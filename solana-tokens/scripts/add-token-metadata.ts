import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createV1, TokenStandard, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, keypairIdentity, publicKey, percentAmount } from '@metaplex-foundation/umi';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';

async function addTokenMetadata() {
    console.log('📝 Adding metadata to our tokens...');
    
    try {
        // Initialize UMI
        const umi = createUmi('https://api.devnet.solana.com')
            .use(mplTokenMetadata());
        
        // Load our wallet keypair
        const walletKeypairData = JSON.parse(fs.readFileSync('wallet-keypair.json', 'utf8'));
        const walletKeypair = Keypair.fromSecretKey(new Uint8Array(walletKeypairData.secretKey));
        const umiKeypair = fromWeb3JsKeypair(walletKeypair);
        
        umi.use(keypairIdentity(umiKeypair));
        
        console.log('📝 Using wallet:', walletKeypair.publicKey.toString());
        
        // Our token mint addresses
        const bonkMint = publicKey('GpRTjXEn6gTPhvbA225gtsbQeapd12JDXii8b33orzb5');
        const usdcMint = publicKey('Boo4LSXTuduNMZp6nag4cA6kg4FEkwz7QTA29pXXW3c7');
        
        // Create BONK metadata
        console.log('🚀 Creating BONK metadata...');
        const bonkMetadata = generateSigner(umi);
        
        await createV1(umi, {
            mint: bonkMint,
            authority: umi.identity,
            name: 'Bonk',
            symbol: 'BONK',
            uri: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I', // Official BONK metadata URI
            sellerFeeBasisPoints: percentAmount(0),
            tokenStandard: TokenStandard.Fungible,
            isCollection: false,
            isMutable: true,
            primarySaleHappened: false,
            updateAuthority: umi.identity,
            decimals: 5
        }).sendAndConfirm(umi);
        
        console.log('✅ BONK metadata created successfully!');
        
        // Create USDC metadata
        console.log('💵 Creating USDC metadata...');
        const usdcMetadata = generateSigner(umi);
        
        await createV1(umi, {
            mint: usdcMint,
            authority: umi.identity,
            name: 'USD Coin',
            symbol: 'USDC',
            uri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png', // Official USDC metadata
            sellerFeeBasisPoints: percentAmount(0),
            tokenStandard: TokenStandard.Fungible,
            isCollection: false,
            isMutable: true,
            primarySaleHappened: false,
            updateAuthority: umi.identity,
            decimals: 6
        }).sendAndConfirm(umi);
        
        console.log('✅ USDC metadata created successfully!');
        
        console.log('\n🎉 Token metadata added! Your tokens should now display properly in wallets.');
        console.log('\n📋 Token Details:');
        console.log('🚀 BONK:');
        console.log(`   Name: Bonk`);
        console.log(`   Symbol: BONK`);
        console.log(`   Mint: ${bonkMint}`);
        console.log(`   Decimals: 5`);
        
        console.log('💵 USDC:');
        console.log(`   Name: USD Coin`);
        console.log(`   Symbol: USDC`);
        console.log(`   Mint: ${usdcMint}`);
        console.log(`   Decimals: 6`);
        
        console.log('\n⏰ Note: It may take a few minutes for wallets to update and show the new metadata.');
        
    } catch (error: any) {
        console.error('❌ Error adding metadata:', error);
        
        // If metadata already exists, that's okay
        if (error.message?.includes('already in use') || error.message?.includes('0x0')) {
            console.log('ℹ️ Metadata accounts may already exist. This is normal if you\'ve run this script before.');
        }
    }
}

addTokenMetadata().catch(console.error);
