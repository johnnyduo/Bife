# 🚀 Bife - Voice-First AI DeFi Companion

**Version:** 2.1.0  
**Build:** React Native 0.74.1 → WebView Architecture (Android-only)  
**AI Engine:** Gemini 1.5 Pro (Planned)  
**Avatar System:** Three.js 3D Primitives (Pink Bonk's Wife Theme)  
**Blockchain:** Solana Integration (Planned)  

## 🎯 Overview

Bife is a revolutionary voice-first AI companion featuring an adorable pink-themed 3D animated Shiba Inu ("Bonk's wife"). Currently implemented as a working Android WebView app with beautiful 3D animations, interactive features, and a charming feminine pink aesthetic.

### ✨ Current Features (Working)

- **� Beautiful 3D Dog Companion**: Real-time Three.js rendered pink Shiba Inu
- **💕 Interactive Animations**: Hover effects, click responses, floating hearts
- **✨ Particle Effects**: Pink sparkles, breathing animations, tail wagging
- **� Feminine Pink Theme**: Complete pink aesthetic as "Bonk's wife"
- **� Android WebView**: Native Android app with smooth performance
- **�️ Touch Interactions**: Tap for excitement, hover for gentle responses

## 🏗️ Current Architecture

### Working Implementation

```
Frontend:    HTML5 + CSS3 + JavaScript (WebView)
3D Engine:   Three.js r128 (CDN-delivered)
Animation:   GSAP 3.12.2 + CSS transforms
UI Theme:    Pink feminine aesthetic for "Bonk's wife"
Container:   Android WebView (Native Kotlin)
Storage:     Local assets (3.9MB APK)
```

### Technology Stack

```
3D Rendering:   Three.js primitives (spheres, cylinders, cones)
Materials:      MeshPhongMaterial with pink color variations
Lighting:       Ambient + Directional lights for depth
Animations:     Float, breathe, tail wag, ear flutter
Interactions:   Mouse/touch events with GSAP transitions
Effects:        Particle sparkles, floating hearts, glow
```

## 📁 Current Project Structure

```
bife/
├── android/                # Android WebView app
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/
│   │   │   │   ├── index.html      # Main 3D companion app
│   │   │   │   └── models/         # 3D assets (Shiba.fbx)
│   │   │   ├── java/com/tempproject/
│   │   │   │   ├── MainActivity.kt # WebView container
│   │   │   │   └── MainApplication.kt
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle    # Android build config
│   ├── build.gradle        # Project build config
│   └── gradlew            # Gradle wrapper
├── App.tsx                 # React Native entry (unused)
├── package.json            # Node.js dependencies
├── README.md              # This documentation
└── .gitignore             # Git exclusions
```

### Key Files

- **`android/app/src/main/assets/index.html`**: Complete 3D companion app
- **`android/app/src/main/java/.../MainActivity.kt`**: WebView loader
- **`android/app/build.gradle`**: APK build configuration

## 🚀 Getting Started

### Prerequisites

- **Android Studio** (for Android development)
- **Android SDK** API 34+
- **ADB** (Android Debug Bridge)
- **Git** for version control

### Quick Start

#### For Web Deployment (Vercel)

1. **Clone the repository**
```bash
git clone <repository-url>
cd bife
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your Gemini API key
```

4. **Deploy to Vercel**
```bash
npm run build:vercel
# Or connect your GitHub repo to Vercel dashboard
```

#### For Android Development

1. **Build the Android APK**
```bash
cd android
./gradlew assembleDebug
```

2. **Install on Android device/emulator**
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

4. **Launch the app**
   - Open "Bife" app on your Android device
   - Enjoy your adorable pink 3D Bonk's wife companion!

### Development Workflow

```bash
# Make changes to android/app/src/main/assets/index.html
# Rebuild and reinstall
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
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
