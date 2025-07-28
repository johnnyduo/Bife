# 🚀 Bife - Voice-First AI DeFi Companion

**Version:** 2.1.0  
**Build:** React Native 0.74.1 (Bare Workflow)  
**AI Engine:** Gemini 1.5 Pro + Claude 3 Opus + Whisper.cpp  
**Avatar System:** Babylon.js 6.54 + VRM 1.0  
**Blockchain:** Solana (Jupiter SDK v7, Wallet Adapter v2.1)  

## 🎯 Overview

Bife is a revolutionary voice-first AI companion that democratizes DeFi access through natural conversation. Built for mobile-first experiences, Bife combines cutting-edge AI, 3D avatar technology, and seamless blockchain integration to make decentralized finance as easy as talking to a friend.

### ✨ Key Features

- **🎙️ Voice-First Interface**: Natural conversation with wake word detection
- **🤖 AI-Powered Companion**: Emotional intelligence with Babylon.js VRM avatar  
- **⚡ Solana Integration**: Jupiter aggregator, staking, portfolio management
- **🎓 Educational Platform**: Interactive DeFi tutorials with gamification
- **🔐 Enterprise Security**: Biometric auth, hardware wallet support
- **📱 Cross-Platform**: Optimized for iOS & Android with adaptive performance

## 🏗️ Architecture

### Core Technologies

```
Frontend:    React Native 0.74.1 + TypeScript
State:       Zustand + MMKV (persistent storage)
Navigation:  React Navigation v6 (Stack + Tabs)
Animation:   React Native Reanimated v3
UI:          React Native Gesture Handler
Storage:     React Native MMKV (encrypted)
```

### AI & Voice Stack

```
ASR:         Gemini 1.5 Pro → Whisper.cpp (fallback)
NLP:         Claude 3 Opus → Gemini 1.5 Pro (fallback)  
TTS:         Google Cloud TTS → React Native TTS
Wake Word:   Porcupine v2.1 (on-device)
```

### 3D Avatar System

```
Engine:      Babylon.js 6.54 + React Native integration
Models:      VRM 1.0 format (400k polygons max)
Physics:     cannon-es (cloth/hair simulation)
Performance: Adaptive LOD based on device class
```

### Blockchain Integration

```
Primary Chain:  Solana (devnet/mainnet)
RPC:           Custom endpoints + fallbacks
DEX:           Jupiter Aggregator v7 (MEV protection)
Wallets:       Phantom, Solflare, Ledger support
Cross-chain:   Wormhole SDK v4 (Ethereum L2s)
```

## 📁 Project Structure

```
bife/
├── src/
│   ├── ai/                 # AI service integrations
│   │   └── claude.ts       # Claude 3 Opus integration
│   ├── avatar/             # 3D avatar system
│   │   └── BabylonAvatarSystem.ts
│   ├── blockchain/         # Blockchain services
│   │   └── solana.ts       # Solana integration
│   ├── components/         # Reusable UI components
│   ├── screens/            # App screens
│   │   └── HomeScreen.tsx  # Main interface
│   ├── services/           # Core services
│   │   └── voice.ts        # Voice processing
│   ├── store/              # State management
│   │   └── index.ts        # Zustand stores
│   ├── types/              # TypeScript definitions
│   │   └── index.ts        # Core types
│   └── utils/              # Utility functions
├── android/                # Android native code
├── ios/                    # iOS native code
├── App.tsx                 # Main app component
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── babel.config.js         # Babel configuration
├── metro.config.js         # Metro bundler config
└── .env                    # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ with **Yarn 4.0+**
- **React Native CLI** 0.74+
- **Android Studio** (for Android development)
- **Xcode** 15+ (for iOS development)
- **Google Cloud Account** (for AI services)
- **Anthropic API Key** (for Claude integration)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/bife.git
cd bife
```

2. **Install dependencies** (Yarn-only, as per PRD)
```bash
yarn install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. **Setup iOS dependencies** (iOS only)
```bash
cd ios && pod install && cd ..
```

5. **Start the Metro bundler**
```bash
yarn start
```

6. **Run on device/simulator**
```bash
# iOS
yarn ios

# Android  
yarn android
```

### Environment Configuration

Create a `.env` file with the following keys:

```bash
# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here

# Google Cloud Services  
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json

# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Jupiter Aggregator
JUPITER_API_URL=https://quote-api.jup.ag/v6

# Porcupine Wake Word
PORCUPINE_ACCESS_KEY=your_porcupine_access_key

# Feature Flags
ENABLE_BABYLON_VRM=true
ENABLE_CROSS_CHAIN=false
ENABLE_CLAUDE_FALLBACK=true
```

## 🎮 Usage

### Voice Commands

Bife responds to natural language commands:

```
"Hey Bife, what's my portfolio worth?"
"Swap 100 USDC for SOL"
"Stake 5 SOL with Marinade"
"Show me how DeFi lending works"
"What's the price of Bonk token?"
```

### Avatar Emotions

The Babylon.js avatar responds with contextual emotions:

- **😊 Happy**: Successful transactions, positive portfolio performance
- **🤔 Thinking**: Processing complex queries, analyzing data  
- **😕 Concerned**: Market warnings, high-risk operations
- **🤩 Excited**: Major gains, achievement unlocks
- **😐 Neutral**: Default state, general information

### Performance Optimization

Bife automatically adapts to device capabilities:

| Device Class | Avatar Quality | Target FPS | Memory Limit |
|--------------|----------------|------------|--------------|
| Flagship     | Ultra (1024px) | 60 FPS     | 8GB+         |
| High-end     | High (512px)   | 45 FPS     | 6-8GB        |
| Mid-range    | Medium (512px) | 45 FPS     | 4-6GB        |
| Entry-level  | Low (256px)    | 30 FPS     | <4GB         |

## 🧪 Testing

### Unit Tests
```bash
yarn test
```

### E2E Tests (Detox)
```bash
yarn e2e:build
yarn e2e
```

### Voice Service Testing
```bash
# Test wake word detection
yarn test:voice

# Test AI integrations  
yarn test:ai

# Test blockchain connectivity
yarn test:blockchain
```

## 🔧 Development

### Adding New Voice Commands

1. **Define intent** in `src/types/index.ts`:
```typescript
export type VoiceIntent = 
  | 'existing_intents'
  | 'your_new_intent';
```

2. **Implement handler** in `src/services/voice.ts`:
```typescript
private inferBasicIntent(transcript: string): VoiceIntent {
  if (transcript.includes('your_keyword')) {
    return 'your_new_intent';
  }
  // ... existing logic
}
```

3. **Add avatar response** in `src/ai/claude.ts`:
```typescript
private inferActivity(intent: VoiceIntent): ActivityType {
  switch (intent) {
    case 'your_new_intent':
      return 'your_activity_type';
    // ... existing cases
  }
}
```

### Customizing Avatar Appearance

1. **Prepare VRM model** (max 400k polygons, 1024px textures)
2. **Add to assets**: `src/assets/models/your-avatar.vrm`
3. **Update configuration**:
```typescript
const avatarConfig = {
  modelUrl: 'assets/models/your-avatar.vrm',
  textureQuality: 'high',
  // ... other options
};
```

### Blockchain Integration

1. **Extend Solana service** in `src/blockchain/solana.ts`
2. **Add new DeFi protocols** (Mango, Serum, etc.)
3. **Implement cross-chain support** via Wormhole SDK

## 🚀 Deployment

### Android APK
```bash
yarn build:android
# Output: android/app/build/outputs/apk/release/
```

### iOS Archive
```bash
yarn build:ios
# Use Xcode for App Store submission
```

### Production Environment Variables
```bash
SOLANA_NETWORK=mainnet-beta
NODE_ENV=production
ENABLE_FLIPPER=false
```

## 📊 Performance Metrics

### Target KPIs (as per PRD)

| Metric              | Target     | Current Status |
|---------------------|------------|----------------|
| VRM Load Time       | <2s P95    | ⚠️ In Progress  |
| Avatar FPS          | >45fps P95 | ⚠️ In Progress  |
| Voice Response Time | <200ms     | ⚠️ In Progress  |
| Memory Usage        | <350MB     | ⚠️ In Progress  |
| MAU Target          | 50K+       | 🚀 Launch Ready |

### Monitoring

- **Performance**: React Native Flipper + custom metrics
- **Errors**: Crashlytics integration
- **Analytics**: Custom event tracking for voice interactions
- **Blockchain**: RPC endpoint health monitoring

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- **TypeScript**: Strict mode enabled, no implicit any
- **Testing**: Unit tests required for new features  
- **Voice UX**: All features must be voice-accessible
- **Performance**: 60fps target on flagship devices
- **Security**: No private keys in code, secure storage only

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **Babylon.js Team** - 3D engine and VRM support
- **Solana Foundation** - Blockchain infrastructure  
- **Anthropic** - Claude AI integration
- **Google** - Gemini AI and Cloud services
- **Jupiter Exchange** - DEX aggregation protocol
- **Picovoice** - Wake word detection technology

## 📞 Support

- **Documentation**: [docs.bife.ai](https://docs.bife.ai)
- **Discord**: [discord.gg/bife](https://discord.gg/bife)  
- **Email**: support@bife.ai
- **GitHub Issues**: [github.com/bife/issues](https://github.com/bife/issues)

---

**Built with ❤️ by the Bife Team**  
*Making DeFi accessible through voice-first AI experiences*
