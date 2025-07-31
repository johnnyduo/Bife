# BIFE Mock Tokens for Solana Devnet 🚀

This directory contains mock BONK and USDC token contracts for the BIFE DeFi application, designed to replicate the real tokens on Solana devnet for testing purposes.

## 🎯 Overview

- **Mock BONK**: Replicates the real BONK token with 93 trillion supply and 5 decimals
- **Mock USDC**: Stable coin for testing with 10 million initial supply and 6 decimals
- **Network**: Solana Devnet
- **Framework**: Anchor & SPL Token Program

## 📋 Token Specifications

### Mock BONK Token
- **Supply**: 93,000,000,000,000 (93 trillion, matching real BONK)
- **Decimals**: 5 (same as real BONK)
- **Symbol**: BONK
- **Use Case**: Meme token trading, yield farming

### Mock USDC Token  
- **Supply**: 10,000,000 (10 million for testing)
- **Decimals**: 6 (same as real USDC)
- **Symbol**: USDC
- **Use Case**: Stable coin trading, base currency

## 🚀 Quick Deployment

### Option 1: Simple SPL Token Deployment (Recommended)
```bash
# Make sure you have Solana CLI and some devnet SOL
./deploy-tokens.sh
```

### Option 2: Manual Anchor Deployment
```bash
# Install dependencies
yarn install

# Build the programs
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Create and mint tokens
yarn create-tokens
yarn mint-tokens
```

## 📦 Prerequisites

1. **Solana CLI**: Install the Solana command line tools
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
```

2. **Anchor Framework** (for advanced deployment):
```bash
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

3. **Node.js & Yarn**: For TypeScript scripts
```bash
# Install Node.js 18+ and yarn
npm install -g yarn
```

4. **Devnet SOL**: Get test SOL from the faucet
```bash
solana airdrop 2 --url https://api.devnet.solana.com
```

## 🔧 Configuration

### Wallet Setup
```bash
# Create a new keypair if needed
solana-keygen new

# Set devnet as default
solana config set --url https://api.devnet.solana.com

# Check your address
solana address
```

### Environment Variables
Create a `.env` file (optional):
```env
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/id.json
```

## 📁 Project Structure

```
solana-tokens/
├── programs/
│   ├── mock-bonk/          # BONK token program
│   │   ├── src/lib.rs      # Main contract logic
│   │   └── Cargo.toml      # Rust dependencies
│   └── mock-usdc/          # USDC token program
│       ├── src/lib.rs      # Main contract logic
│       └── Cargo.toml      # Rust dependencies
├── scripts/
│   ├── create-tokens.ts    # Token creation script
│   └── mint-tokens.ts      # Token minting script
├── deploy-tokens.sh        # Simple deployment script
├── Anchor.toml            # Anchor configuration
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## 🎮 Usage Examples

### Create Additional Token Accounts
```bash
# Create token account for another user
spl-token create-account <BONK_MINT_ADDRESS>
spl-token create-account <USDC_MINT_ADDRESS>
```

### Transfer Tokens
```bash
# Transfer BONK tokens
spl-token transfer <BONK_MINT_ADDRESS> 1000000 <RECIPIENT_ADDRESS>

# Transfer USDC tokens  
spl-token transfer <USDC_MINT_ADDRESS> 1000 <RECIPIENT_ADDRESS>
```

### Check Balances
```bash
# Check BONK balance
spl-token balance <BONK_MINT_ADDRESS>

# Check USDC balance
spl-token balance <USDC_MINT_ADDRESS>
```

## 🔗 Integration with BIFE App

After deployment, copy the token addresses to your BIFE app:

```javascript
// From token-addresses.json
const MOCK_TOKENS = {
  BONK: {
    mint: "BonkMintAddressHere...",
    decimals: 5
  },
  USDC: {
    mint: "UsdcMintAddressHere...",
    decimals: 6
  }
};
```

## 🧪 Testing

### Basic Token Operations
```bash
# Test minting (as authority)
spl-token mint <MINT_ADDRESS> 1000000 <TOKEN_ACCOUNT>

# Test transfers
spl-token transfer <MINT_ADDRESS> 1000 <RECIPIENT>

# Check supply
spl-token supply <MINT_ADDRESS>
```

### Advanced Testing with TypeScript
```bash
# Run test scripts
yarn test

# Mint additional tokens for testing
yarn mint-tokens
```

## 🌐 Explorer Links

After deployment, view your tokens on Solana Explorer:
- Devnet: `https://explorer.solana.com/address/<MINT_ADDRESS>?cluster=devnet`
- Mainnet Beta: `https://explorer.solana.com/address/<MINT_ADDRESS>`

## 🛠️ Troubleshooting

### Common Issues

1. **Insufficient SOL Balance**
   ```bash
   solana airdrop 2
   ```

2. **Wrong Network**
   ```bash
   solana config set --url https://api.devnet.solana.com
   ```

3. **Missing Keypair**
   ```bash
   solana-keygen new --no-bip39-passphrase
   ```

4. **Build Errors**
   ```bash
   anchor clean
   anchor build
   ```

### Getting Help
- Check Solana logs: `solana logs`
- View transaction details on Solana Explorer
- Anchor documentation: https://anchor-lang.com/

## 📄 License

MIT License - Feel free to use this for testing and development.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Test thoroughly on devnet
4. Submit a pull request

## ⚠️ Disclaimer

These are **MOCK TOKENS** for testing purposes only. They have no real value and should only be used on Solana devnet or localnet for development and testing.

---

🎉 **Happy Building with BIFE!** 🚀
