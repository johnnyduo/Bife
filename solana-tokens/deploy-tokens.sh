#!/bin/bash

echo "🚀 BIFE Mock Token Deployment Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found. Please install it first:${NC}"
    echo "sh -c \"\$(curl -sSfL https://release.solana.com/v1.17.0/install)\""
    exit 1
fi

# Check if anchor is installed
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor not found. Please install it first:${NC}"
    echo "cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked"
    exit 1
fi

echo -e "${BLUE}📡 Configuring Solana for devnet...${NC}"
solana config set --url https://api.devnet.solana.com

echo -e "${BLUE}💰 Checking wallet balance...${NC}"
BALANCE=$(solana balance)
echo "Current balance: $BALANCE"

if [[ "$BALANCE" == *"0 SOL"* ]]; then
    echo -e "${YELLOW}💸 Requesting devnet SOL...${NC}"
    solana airdrop 2
    sleep 5
    echo "New balance: $(solana balance)"
fi

# Create keypair if it doesn't exist
if [ ! -f ~/.config/solana/id.json ]; then
    echo -e "${BLUE}🗝️  Creating new keypair...${NC}"
    solana-keygen new --no-bip39-passphrase
fi

echo -e "${BLUE}📝 Current wallet address:${NC}"
solana address

echo -e "${BLUE}🏗️  Building Anchor programs...${NC}"
anchor build

echo -e "${BLUE}🚀 Deploying to devnet...${NC}"
anchor deploy --provider.cluster devnet

echo -e "${GREEN}✅ Programs deployed!${NC}"

echo -e "${BLUE}🪙 Creating token mints...${NC}"
# Create simple SPL tokens instead of complex programs for now

# Create Mock BONK (5 decimals)
echo -e "${YELLOW}Creating Mock BONK...${NC}"
BONK_MINT=$(spl-token create-token --decimals 5 --output json-compact | jq -r .mint)
echo "Mock BONK Mint: $BONK_MINT"

# Create Mock USDC (6 decimals) 
echo -e "${YELLOW}Creating Mock USDC...${NC}"
USDC_MINT=$(spl-token create-token --decimals 6 --output json-compact | jq -r .mint)
echo "Mock USDC Mint: $USDC_MINT"

# Create token accounts
echo -e "${YELLOW}Creating token accounts...${NC}"
BONK_ACCOUNT=$(spl-token create-account $BONK_MINT --output json-compact | jq -r .account)
USDC_ACCOUNT=$(spl-token create-account $USDC_MINT --output json-compact | jq -r .account)

echo "BONK Token Account: $BONK_ACCOUNT"
echo "USDC Token Account: $USDC_ACCOUNT"

# Mint tokens
echo -e "${YELLOW}Minting tokens...${NC}"

# Mint massive BONK supply (93 trillion like real BONK)
echo "Minting 93 trillion Mock BONK..."
spl-token mint $BONK_MINT 93000000000000 $BONK_ACCOUNT

# Mint reasonable USDC supply (10 million for testing)
echo "Minting 10 million Mock USDC..."
spl-token mint $USDC_MINT 10000000 $USDC_ACCOUNT

# Create token info JSON
cat > token-addresses.json << EOF
{
  "network": "devnet",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
  "wallet": "$(solana address)",
  "tokens": {
    "BONK": {
      "mint": "$BONK_MINT",
      "decimals": 5,
      "tokenAccount": "$BONK_ACCOUNT",
      "supply": "9300000000000000000",
      "description": "Mock BONK token with 93 trillion supply"
    },
    "USDC": {
      "mint": "$USDC_MINT", 
      "decimals": 6,
      "tokenAccount": "$USDC_ACCOUNT",
      "supply": "10000000000000",
      "description": "Mock USDC token with 10 million supply"
    }
  },
  "explorerUrls": {
    "BONK": "https://explorer.solana.com/address/$BONK_MINT?cluster=devnet",
    "USDC": "https://explorer.solana.com/address/$USDC_MINT?cluster=devnet"
  }
}
EOF

echo -e "${GREEN}✅ Token deployment completed!${NC}"
echo -e "${GREEN}📋 Token addresses saved to token-addresses.json${NC}"
echo ""
echo -e "${BLUE}🎯 Summary:${NC}"
echo "===================="
echo "Network: devnet"
echo "Mock BONK Mint: $BONK_MINT"
echo "Mock USDC Mint: $USDC_MINT"
echo "BONK Balance: $(spl-token balance $BONK_MINT) BONK"
echo "USDC Balance: $(spl-token balance $USDC_MINT) USDC"
echo ""
echo -e "${BLUE}🔗 View on Solana Explorer:${NC}"
echo "BONK: https://explorer.solana.com/address/$BONK_MINT?cluster=devnet"
echo "USDC: https://explorer.solana.com/address/$USDC_MINT?cluster=devnet"
echo ""
echo -e "${GREEN}🎉 Ready for BIFE app integration!${NC}"
