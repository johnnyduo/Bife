import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { 
    mintTo, 
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount
} from "@solana/spl-token";

// Configuration
const NETWORK = "devnet";
const connection = new Connection(clusterApiUrl(NETWORK), "confirmed");

async function mintTokens() {
    console.log("🪙 Minting Mock BONK and USDC tokens on Solana", NETWORK);
    
    // Load token addresses
    const fs = require('fs');
    let tokenInfo;
    try {
        const tokenData = fs.readFileSync('./token-addresses.json', 'utf8');
        tokenInfo = JSON.parse(tokenData);
        console.log("📋 Loaded token addresses from file");
    } catch (error) {
        console.error("❌ Could not load token-addresses.json. Run 'yarn create-tokens' first.");
        return;
    }
    
    const wallet = anchor.AnchorProvider.env().wallet;
    console.log("📝 Using wallet:", wallet.publicKey.toString());
    
    const bonkMint = new PublicKey(tokenInfo.tokens.BONK.mint);
    const usdcMint = new PublicKey(tokenInfo.tokens.USDC.mint);
    const bonkTokenAccount = new PublicKey(tokenInfo.tokens.BONK.tokenAccount);
    const usdcTokenAccount = new PublicKey(tokenInfo.tokens.USDC.tokenAccount);
    
    try {
        // Mint massive BONK supply (93 trillion like real BONK)
        console.log("\n🚀 Minting Mock BONK supply...");
        const bonkSupply = BigInt(93_000_000_000_000) * BigInt(10 ** 5); // 93T BONK with 5 decimals
        console.log("Target BONK supply:", bonkSupply.toString());
        
        await mintTo(
            connection,
            wallet.payer,
            bonkMint,
            bonkTokenAccount,
            wallet.publicKey,
            bonkSupply
        );
        console.log("✅ Mock BONK minted:", bonkSupply.toString(), "raw units");
        console.log("   That's", (Number(bonkSupply) / 10**5).toLocaleString(), "BONK tokens");
        
        // Mint reasonable USDC supply (10 million for testing)
        console.log("\n💵 Minting Mock USDC supply...");
        const usdcSupply = BigInt(10_000_000) * BigInt(10 ** 6); // 10M USDC with 6 decimals
        console.log("Target USDC supply:", usdcSupply.toString());
        
        await mintTo(
            connection,
            wallet.payer,
            usdcMint,
            usdcTokenAccount,
            wallet.publicKey,
            usdcSupply
        );
        console.log("✅ Mock USDC minted:", usdcSupply.toString(), "raw units");
        console.log("   That's", (Number(usdcSupply) / 10**6).toLocaleString(), "USDC tokens");
        
        // Verify balances
        console.log("\n🔍 Verifying token balances...");
        
        const bonkAccount = await getAccount(connection, bonkTokenAccount);
        const usdcAccount = await getAccount(connection, usdcTokenAccount);
        
        console.log("BONK balance:", bonkAccount.amount.toString(), "raw units");
        console.log("BONK balance:", (Number(bonkAccount.amount) / 10**5).toLocaleString(), "BONK");
        console.log("USDC balance:", usdcAccount.amount.toString(), "raw units");
        console.log("USDC balance:", (Number(usdcAccount.amount) / 10**6).toLocaleString(), "USDC");
        
        // Update token info file
        tokenInfo.tokens.BONK.supply = bonkAccount.amount.toString();
        tokenInfo.tokens.USDC.supply = usdcAccount.amount.toString();
        tokenInfo.mintTimestamp = new Date().toISOString();
        
        fs.writeFileSync('./token-addresses.json', JSON.stringify(tokenInfo, null, 2));
        console.log("\n💾 Updated token-addresses.json with supply info");
        
        console.log("\n🎯 Minting Summary:");
        console.log("===================");
        console.log("Network:", NETWORK);
        console.log("Mock BONK:", (Number(bonkAccount.amount) / 10**5).toLocaleString(), "tokens");
        console.log("Mock USDC:", (Number(usdcAccount.amount) / 10**6).toLocaleString(), "tokens");
        console.log("\n✅ Token minting completed successfully!");
        console.log("🔗 View on Solana Explorer:");
        console.log("BONK:", `https://explorer.solana.com/address/${bonkMint.toString()}?cluster=${NETWORK}`);
        console.log("USDC:", `https://explorer.solana.com/address/${usdcMint.toString()}?cluster=${NETWORK}`);
        
    } catch (error) {
        console.error("❌ Error minting tokens:", error);
        throw error;
    }
}

// Helper function to mint additional tokens for testing
export async function mintAdditionalTokens(tokenSymbol: string, amount: bigint, recipient?: PublicKey) {
    console.log(`🪙 Minting additional ${tokenSymbol}:`, amount.toString());
    
    const fs = require('fs');
    const tokenData = fs.readFileSync('./token-addresses.json', 'utf8');
    const tokenInfo = JSON.parse(tokenData);
    
    const wallet = anchor.AnchorProvider.env().wallet;
    const targetRecipient = recipient || wallet.publicKey;
    
    if (tokenSymbol === "BONK") {
        const bonkMint = new PublicKey(tokenInfo.tokens.BONK.mint);
        const recipientTokenAccount = await getAssociatedTokenAddress(bonkMint, targetRecipient);
        
        await mintTo(
            connection,
            wallet.payer,
            bonkMint,
            recipientTokenAccount,
            wallet.publicKey,
            amount
        );
        console.log("✅ Additional BONK minted to:", recipientTokenAccount.toString());
        
    } else if (tokenSymbol === "USDC") {
        const usdcMint = new PublicKey(tokenInfo.tokens.USDC.mint);
        const recipientTokenAccount = await getAssociatedTokenAddress(usdcMint, targetRecipient);
        
        await mintTo(
            connection,
            wallet.payer,
            usdcMint,
            recipientTokenAccount,
            wallet.publicKey,
            amount
        );
        console.log("✅ Additional USDC minted to:", recipientTokenAccount.toString());
    }
}

// Run the script
if (require.main === module) {
    mintTokens()
        .then(() => {
            console.log("🏁 Minting script completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Minting script failed:", error);
            process.exit(1);
        });
}

export { mintTokens };
