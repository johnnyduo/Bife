# 🚀 BIFE - Bonk-Powered Voice DeFi Space Mission

<div align="center">

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/johnnyduo/bife)
[![Platform](https://img.shields.io/badge/platform-Android-green.svg)](https://developer.android.com/)
[![Solana](https://img.shields.io/badge/blockchain-Solana-purple.svg)](https://solana.com/)
[![Network](https://img.shields.io/badge/network-Devnet-orange.svg)](https://docs.solana.com/clusters#devnet)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

*Next-Generation Voice-First AI DeFi Companion with Advanced Trading Capabilities*

[Demo](#-demo) • [Features](#-features) • [Architecture](#-architecture) • [Setup](#-quick-start) • [API](#-api-reference)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Technical Architecture](#-technical-architecture)
- [Deployed Tokens](#-deployed-tokens)
- [AI Companions](#-ai-companions)
- [Trading Engine](#-trading-engine)
- [Smart Contracts](#-smart-contracts)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Contributing](#-contributing)

---

## 🌟 Overview

**BIFE** is a revolutionary voice-first AI DeFi companion built on the Solana blockchain, featuring advanced trading capabilities, AI-powered portfolio analysis, and immersive animated companions. The application combines cutting-edge Web3 technology with intuitive voice commands and professional-grade DeFi operations.

### 🎯 Mission Statement

To democratize DeFi access through voice-first interaction, making complex blockchain operations as simple as having a conversation with your AI companion.

### 🏆 Key Differentiators

- **Voice-First Interface**: Natural language processing for DeFi operations
- **AI-Powered Analysis**: Real-time portfolio insights with Gemini AI
- **Professional Trading**: Direct integration with Raydium AMM
- **Animated Companions**: Interactive Lottie-based AI characters
- **Mobile-Native**: Optimized Android WebView experience
- **Secure Architecture**: Environment-based token management

---

## ✨ Core Features

### 🎤 Voice AI System
- **Natural Language Processing**: Powered by Google Gemini AI
- **Multi-Language Support**: English voice commands with AI interpretation
- **Context-Aware Responses**: Understands DeFi terminology and operations
- **Real-Time Transcription**: Live voice-to-text with immediate feedback

### 📊 Advanced Trading Engine
- **Raydium Integration**: Direct AMM trading with real-time quotes
- **Multi-Token Support**: SOL, BONK, USDC with dynamic pricing
- **Smart Slippage Management**: Automatic slippage calculation and protection
- **Transaction Simulation**: Comprehensive pre-execution validation

### 🤖 AI Companion Gallery
- **Astronaut Dog**: Space-themed portfolio navigator
- **Happy Unicorn**: Magical portfolio analyst with ML insights
- **Smiling Dog**: Optimistic trading expert with market analysis
- **Shiba NFT Artist**: Creative NFT generation and management

### 🔗 Blockchain Infrastructure
- **Solana Network**: High-performance, low-cost transactions
- **Mobile Wallet Adapter**: Seamless wallet connectivity
- **Custom Token Deployment**: Live devnet tokens with real trading
- **Explorer Integration**: Direct links to Solscan and Solana Explorer

---

## 🏗️ Technical Architecture

### 📱 Frontend Architecture
```
Android Native WebView
├── HTML5/CSS3/JavaScript
├── Lottie Animation Engine
├── Real-time Voice Recognition
└── WebView-to-Native Bridge
```

### 🔧 Backend Integration
```
Solana Blockchain
├── Web3.js Integration
├── Mobile Wallet Adapter
├── Raydium AMM Protocol
└── Jupiter Aggregator API
```

### 🧠 AI/ML Stack
```
Google Gemini AI
├── Natural Language Processing
├── Context-Aware Responses
├── Portfolio Analysis
└── Trading Recommendations
```

### 🎨 Animation System
```
Lottie Animation Framework
├── Vector-based Companions
├── Performance Optimization
├── Device-Adaptive Rendering
└── Interactive Gestures
```

---

## 🪙 Deployed Tokens

### 📈 Token Specifications

#### BONK Token (mBONK)
```json
{
  "name": "Mock BONK",
  "symbol": "mBONK",
  "decimals": 5,
  "mint": "8wg7hAtfF1eJZLLb7TCHZhVuS3NkBdm8R7dtRPvn9BiP",
  "supply": "93,000,000,000,000",
  "network": "devnet",
  "authority": "5qX8VcUJGhHwXuVUknPa2TuQoKffWZnk5HPNUeUbpJnA"
}
```

#### USDC Token (mUSDC)
```json
{
  "name": "Mock USD Coin",
  "symbol": "mUSDC",
  "decimals": 6,
  "mint": "9nccat6babNG1u32Xu6d8XojGy7BGH6shwCLzoCrZWTT",
  "supply": "10,000,000",
  "network": "devnet",
  "authority": "5qX8VcUJGhHwXuVUknPa2TuQoKffWZnk5HPNUeUbpJnA"
}
```

### 🔗 Token Explorer Links
- **BONK Explorer**: [View on Solscan](https://solscan.io/token/8wg7hAtfF1eJZLLb7TCHZhVuS3NkBdm8R7dtRPvn9BiP?cluster=devnet)
- **USDC Explorer**: [View on Solscan](https://solscan.io/token/9nccat6babNG1u32Xu6d8XojGy7BGH6shwCLzoCrZWTT?cluster=devnet)
- **Deployer Wallet**: [View on Solscan](https://solscan.io/account/5qX8VcUJGhHwXuVUknPa2TuQoKffWZnk5HPNUeUbpJnA?cluster=devnet)

### 💱 Liquidity Pools
- **SOL-BONK Pool**: [Trade on Raydium](https://raydium.io/swap/?inputMint=sol&outputMint=8wg7hAtfF1eJZLLb7TCHZhVuS3NkBdm8R7dtRPvn9BiP)
- **USDC-BONK Pool**: [Trade on Raydium](https://raydium.io/swap/?inputMint=9nccat6babNG1u32Xu6d8XojGy7BGH6shwCLzoCrZWTT&outputMint=8wg7hAtfF1eJZLLb7TCHZhVuS3NkBdm8R7dtRPvn9BiP)

---

## 🤖 AI Companions

### 🚀 Astronaut Dog - Space Navigator
**Role**: Primary companion and voice interface
- **Capabilities**: Voice command processing, space-themed responses
- **Animation**: Astronaut-themed Lottie with space effects
- **Specialization**: Navigation and general DeFi guidance

### 🦄 Happy Unicorn - Portfolio Analyst
**Role**: AI-powered portfolio management
- **Capabilities**: ML-based portfolio analysis, prediction algorithms
- **Animation**: Magical unicorn with sparkle effects
- **Specialization**: Portfolio optimization and risk assessment

### 😊 Smiling Dog - Trading Expert
**Role**: Advanced trading and market analysis
- **Capabilities**: Real-time market data, trading strategy suggestions
- **Animation**: Optimistic dog with trading indicators
- **Specialization**: Swap execution and market sentiment analysis

### 🎨 Shiba NFT Artist - Creative Companion
**Role**: NFT creation and digital art generation
- **Capabilities**: AI art generation, NFT metadata creation
- **Animation**: Artistic shiba with creative tools
- **Specialization**: NFT marketplace integration and creative content

---

## ⚡ Trading Engine

### 🔄 Swap Mechanism
```typescript
interface SwapInterface {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  amount: BigNumber;
  slippage: number;
  priceImpact: number;
  estimatedOutput: BigNumber;
}
```

### 📊 Price Oracle Integration
- **Primary**: Raydium AMM real-time pricing
- **Secondary**: Jupiter Aggregator API
- **Fallback**: CoinGecko public API
- **Update Frequency**: 30-second intervals

### 🛡️ Security Features
- **Slippage Protection**: Automatic 1-5% slippage management
- **Transaction Simulation**: Pre-execution validation
- **Wallet Integration**: Secure mobile wallet adapter
- **Error Handling**: Comprehensive failure recovery

### 💹 Supported Trading Pairs
| Pair | Liquidity | Fee | Status |
|------|-----------|-----|--------|
| SOL/USDC | High | 0.25% | ✅ Active |
| BONK/SOL | Medium | 0.25% | ✅ Active |
| BONK/USDC | Medium | 0.25% | ✅ Active |

---

## 📋 Smart Contracts

### 🏭 Token Program Interactions
```rust
// Token mint authorities and metadata
pub struct TokenConfig {
    pub mint: Pubkey,
    pub authority: Pubkey,
    pub decimals: u8,
    pub supply: u64,
}
```

### 🌊 AMM Integration
- **Protocol**: Raydium V4
- **Pool Type**: Constant Product (x * y = k)
- **Fee Structure**: 0.25% trading fee
- **Liquidity Mining**: Automated rewards distribution

### 🔐 Security Model
- **Multi-signature**: 2/3 authority requirements
- **Time-locked**: 24-hour delay for critical operations
- **Audit Status**: Community-reviewed smart contracts
- **Upgrade Path**: Transparent upgrade mechanism

---

## 🚀 Quick Start

### 📋 Prerequisites
- **Android Studio**: Latest stable version
- **Android SDK**: API level 21+ (Android 5.0+)
- **Java**: JDK 11 or higher
- **Yarn**: Package manager
- **Git**: Version control

### 📦 Installation

1. **Clone the Repository**
```bash
git clone https://github.com/johnnyduo/bife.git
cd bife
```

2. **Install Dependencies**
```bash
yarn install
cd android
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Build Android APK**
```bash
./gradlew assembleDebug
```

5. **Install on Device**
```bash
./gradlew installDebug
```

### 🔧 Environment Configuration

#### Required Environment Variables
```bash
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro-latest

# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WALLET_PUBLIC_KEY=your_wallet_public_key

# Token Addresses (Devnet)
BONK_TOKEN_ADDRESS=8wg7hAtfF1eJZLLb7TCHZhVuS3NkBdm8R7dtRPvn9BiP
USDC_TOKEN_ADDRESS=9nccat6babNG1u32Xu6d8XojGy7BGH6shwCLzoCrZWTT
SOL_BONK_LP_ADDRESS=your_sol_bonk_lp_address
USDC_BONK_LP_ADDRESS=your_usdc_bonk_lp_address
```

### 📱 Device Requirements
- **Android**: 5.0+ (API level 21+)
- **RAM**: 4GB+ recommended
- **Storage**: 500MB available space
- **Network**: Internet connection required
- **Permissions**: Microphone access for voice features

---

## 💻 Development

### 🛠️ Development Workflow

#### Local Development
```bash
# Start development server
yarn start

# Build for development
cd android && ./gradlew assembleDebug

# Run tests
yarn test

# Lint code
yarn lint
```

#### Production Build
```bash
# Clean build
cd android && ./gradlew clean

# Release build
./gradlew assembleRelease

# Sign APK (requires keystore)
./gradlew bundleRelease
```

### 🔧 Architecture Components

#### Android WebView Bridge
```kotlin
@JavascriptInterface
fun getSolanaWalletPublicKey(): String {
    return BuildConfig.SOLANA_WALLET_PUBLIC_KEY
}

@JavascriptInterface
fun openExternalUrl(url: String) {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
    startActivity(intent)
}
```

#### JavaScript Integration
```javascript
// Access Android interface
const walletKey = Android.getSolanaWalletPublicKey();
const bonkAddress = Android.getBonkTokenAddress();

// External browser integration
Android.openExternalUrl(explorerUrl);
```

### 🎨 Animation System

#### Lottie Configuration
```javascript
const animationSettings = {
    container: document.getElementById('animation'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: animationJson
};
```

#### Performance Optimization
- **Device Detection**: Hardware capability assessment
- **Quality Scaling**: Adaptive rendering quality
- **Memory Management**: Automatic cleanup and recycling
- **Frame Rate Control**: 30-60 FPS based on device

---

## 📚 API Reference

### 🔗 Solana Web3 Integration

#### Wallet Connection
```javascript
async function connectSolanaWallet() {
    const connection = new Connection(clusterApiUrl('devnet'));
    const wallet = new PublicKey(walletPublicKey);
    return { connection, wallet };
}
```

#### Token Operations
```javascript
async function getTokenBalance(mint, owner) {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        owner,
        { mint: new PublicKey(mint) }
    );
    return tokenAccounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
}
```

### 🤖 AI Integration

#### Gemini API
```javascript
async function callGeminiAPI(prompt) {
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });
    return response.json();
}
```

### 💱 Trading API

#### Swap Execution
```javascript
async function executeSwap(fromToken, toToken, amount) {
    // Get quote from Raydium
    const quote = await getRaydiumQuote(fromToken, toToken, amount);
    
    // Execute swap
    const transaction = await buildSwapTransaction(quote);
    const signature = await sendTransaction(transaction);
    
    return { signature, expectedOutput: quote.outputAmount };
}
```

---

## 🔒 Security

### 🛡️ Security Features

#### Wallet Security
- **Environment Variables**: Sensitive data stored in build configuration
- **No Private Key Storage**: Public keys only for read operations
- **Mobile Wallet Integration**: Secure transaction signing
- **Transaction Simulation**: Pre-execution validation

#### API Security
- **Rate Limiting**: API call throttling and caching
- **Error Handling**: Secure error messages without sensitive data
- **Input Validation**: Comprehensive parameter sanitization
- **Network Security**: HTTPS-only communications

#### Smart Contract Security
- **Read-Only Operations**: No direct contract modifications
- **Trusted Protocols**: Integration with audited AMM protocols
- **Slippage Protection**: Automatic price impact safeguards
- **Emergency Stops**: Circuit breakers for unusual conditions

### 🔍 Security Audit

#### Vulnerability Assessment
- **Static Analysis**: Automated code scanning
- **Dynamic Testing**: Runtime security validation
- **Dependency Audit**: Third-party library security review
- **Penetration Testing**: Simulated attack scenarios

---

## 🤝 Contributing

### 📝 Contributing Guidelines

#### Development Process
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

#### Code Standards
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Conventional Commits**: Semantic commit messages
- **Testing**: Unit tests for new features

#### Bug Reports
Please use the [issue tracker](https://github.com/johnnyduo/bife/issues) with:
- **Device Information**: Android version, device model
- **Steps to Reproduce**: Detailed reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: Visual evidence when applicable

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Solana Foundation** - Blockchain infrastructure
- **Raydium Protocol** - AMM integration
- **Google Gemini** - AI capabilities
- **Lottie Animation** - Interactive animations
- **React Native Community** - Mobile development framework

---

## 📞 Support

### 🆘 Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Use GitHub issues for bug reports
- **Community**: Join our Discord community
- **Email**: Contact the development team

### 🔗 Links
- **Website**: [BIFE Official](https://bife.vercel.app)
- **GitHub**: [Source Code](https://github.com/johnnyduo/bife)
- **Solscan**: [Token Explorer](https://solscan.io/?cluster=devnet)
- **Raydium**: [Trading Interface](https://raydium.io/swap)

---

<div align="center">

**🚀 Built with ❤️ for the future of DeFi**

*Empowering everyone to navigate the decentralized financial universe through voice and AI*

</div>
