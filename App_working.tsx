// Bife - Voice-First AI DeFi Companion
// Main App Component - Core Implementation

import React, { useEffect, useState, useRef } from 'react';
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Bife Avatar State Types
type EmotionType = 'neutral' | 'happy' | 'excited' | 'thinking' | 'concerned' | 'confused';
type ActivityType = 'idle' | 'listening' | 'speaking' | 'processing';

interface BifeState {
  emotion: EmotionType;
  activity: ActivityType;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  portfolioValue: number;
  lastCommand: string;
  greeting: string;
}

// Simple Mock Services for Demo
class MockVoiceService {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  async startListening() {
    this.emit('listening-start');
    
    // Simulate voice recognition after 2 seconds
    setTimeout(() => {
      const mockCommands = [
        "What's my portfolio worth?",
        "Swap 100 USDC for SOL",
        "Show me DeFi tutorials",
        "Check Bonk token price",
        "Stake 5 SOL with Marinade"
      ];
      const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
      this.emit('transcript', randomCommand);
      
      // Simulate AI response
      setTimeout(() => {
        this.emit('response', this.generateMockResponse(randomCommand));
      }, 1000);
    }, 2000);
  }

  stopListening() {
    this.emit('listening-end');
  }

  private generateMockResponse(command: string): string {
    if (command.includes('portfolio')) {
      return "Your portfolio is currently worth $1,247.83, up 5.2% today! You're holding SOL, USDC, and Bonk tokens. 📈";
    }
    if (command.includes('swap')) {
      return "I can help you swap tokens! For 100 USDC, you'd get approximately 0.24 SOL at current rates. Would you like to proceed? 🔄";
    }
    if (command.includes('tutorial') || command.includes('learn')) {
      return "Great choice! I have tutorials on DeFi basics, yield farming, and liquidity pools. Which topic interests you most? 🎓";
    }
    if (command.includes('price')) {
      return "Bonk is currently trading at $0.000021, up 12% in the last 24 hours! The DeFi market is looking bullish today! 🚀";
    }
    if (command.includes('stake')) {
      return "Staking 5 SOL with Marinade will earn you approximately 7.2% APY. Your staked SOL will be liquid as mSOL tokens! 💰";
    }
    return "I'm here to help with all your DeFi needs! Try asking about your portfolio, token swaps, or DeFi tutorials. 🤖";
  }
}

const voiceService = new MockVoiceService();

// Avatar Component
const BifeAvatar: React.FC<{ state: BifeState; onPress: () => void }> = ({ state, onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Glow animation when listening or speaking
    if (state.isListening || state.isSpeaking) {
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [state.isListening, state.isSpeaking]);

  const getAvatarEmoji = () => {
    if (state.isListening) return '👂';
    if (state.isSpeaking) return '🗣️';
    if (state.isProcessing) return '🤔';
    
    switch (state.emotion) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'thinking': return '🧐';
      case 'concerned': return '😟';
      case 'confused': return '😕';
      default: return '🤖';
    }
  };

  const getStatusEmoji = () => {
    switch (state.activity) {
      case 'listening': return '🎤';
      case 'speaking': return '🔊';
      case 'processing': return '⚡';
      default: return '💫';
    }
  };

  return (
    <View style={styles.avatarContainer}>
      <Animated.View
        style={[
          styles.avatarCircle,
          {
            transform: [{ scale: pulseAnim }],
            shadowColor: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(108, 92, 231, 0.3)', 'rgba(108, 92, 231, 0.8)'],
            }),
          },
        ]}
      >
        <TouchableOpacity style={styles.avatar} onPress={onPress}>
          <Text style={styles.avatarEmoji}>{getAvatarEmoji()}</Text>
          <Text style={styles.statusEmoji}>{getStatusEmoji()}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Main App Component
const App: React.FC = () => {
  const [bifeState, setBifeState] = useState<BifeState>({
    emotion: 'neutral',
    activity: 'idle',
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    portfolioValue: 1247.83,
    lastCommand: '',
    greeting: "Hello! I'm Bife, your AI DeFi companion. Tap me to start our conversation! 🚀",
  });

  const [currentScreen, setCurrentScreen] = useState<'home' | 'portfolio' | 'swap' | 'learn'>('home');

  useEffect(() => {
    initializeBife();
    setupVoiceListeners();
  }, []);

  const initializeBife = async () => {
    console.log('🚀 Initializing Bife...');
    
    // Request permissions
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      } catch (error) {
        console.warn('Audio permission not granted');
      }
    }

    // Update greeting based on time
    const hour = new Date().getHours();
    let timeGreeting = 'Hello';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    setBifeState(prev => ({
      ...prev,
      greeting: `${timeGreeting}! I'm Bife, your DeFi companion. Your portfolio is worth $${prev.portfolioValue.toFixed(2)}. How can I help? 💰`,
    }));
  };

  const setupVoiceListeners = () => {
    voiceService.on('listening-start', () => {
      setBifeState(prev => ({
        ...prev,
        isListening: true,
        activity: 'listening',
        emotion: 'thinking',
        greeting: "I'm listening... 👂",
      }));
    });

    voiceService.on('listening-end', () => {
      setBifeState(prev => ({
        ...prev,
        isListening: false,
        isProcessing: true,
        activity: 'processing',
        greeting: "Processing your request... 🤔",
      }));
    });

    voiceService.on('transcript', (command: string) => {
      setBifeState(prev => ({
        ...prev,
        lastCommand: command,
        greeting: `I heard: "${command}"`,
      }));
    });

    voiceService.on('response', (response: string) => {
      setBifeState(prev => ({
        ...prev,
        isProcessing: false,
        isSpeaking: true,
        activity: 'speaking',
        emotion: 'happy',
        greeting: response,
      }));

      // Stop speaking after 3 seconds
      setTimeout(() => {
        setBifeState(prev => ({
          ...prev,
          isSpeaking: false,
          activity: 'idle',
          emotion: 'neutral',
        }));
      }, 3000);
    });
  };

  const handleAvatarPress = async () => {
    if (bifeState.isListening) {
      voiceService.stopListening();
    } else if (!bifeState.isSpeaking && !bifeState.isProcessing) {
      await voiceService.startListening();
    }
  };

  const renderHomeScreen = () => (
    <View style={styles.homeScreen}>
      <BifeAvatar state={bifeState} onPress={handleAvatarPress} />
      
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>{bifeState.greeting}</Text>
      </View>

      {bifeState.lastCommand && (
        <View style={styles.commandContainer}>
          <Text style={styles.commandLabel}>Last Command:</Text>
          <Text style={styles.commandText}>"{bifeState.lastCommand}"</Text>
        </View>
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setCurrentScreen('portfolio')}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>Portfolio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => setCurrentScreen('swap')}>
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionText}>Swap</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => setCurrentScreen('learn')}>
          <Text style={styles.actionIcon}>🎓</Text>
          <Text style={styles.actionText}>Learn</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Portfolio Value</Text>
          <Text style={styles.statValue}>${bifeState.portfolioValue.toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>24h Change</Text>
          <Text style={[styles.statValue, { color: '#00D4AA' }]}>+5.2%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Voice Commands</Text>
          <Text style={styles.statValue}>Ready</Text>
        </View>
      </View>
    </View>
  );

  const renderOtherScreen = (title: string, emoji: string) => (
    <View style={styles.screenContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('home')}>
        <Text style={styles.backButtonText}>← Back to Bife</Text>
      </TouchableOpacity>
      
      <Text style={styles.screenTitle}>{emoji} {title}</Text>
      <Text style={styles.screenSubtitle}>Coming soon in the full Bife experience!</Text>
      
      <View style={styles.featureList}>
        {title === 'Portfolio' && (
          <>
            <Text style={styles.featureItem}>• Real-time portfolio tracking</Text>
            <Text style={styles.featureItem}>• Multi-chain asset support</Text>
            <Text style={styles.featureItem}>• DeFi yield tracking</Text>
            <Text style={styles.featureItem}>• Voice-controlled analysis</Text>
          </>
        )}
        {title === 'Token Swap' && (
          <>
            <Text style={styles.featureItem}>• Jupiter aggregator integration</Text>
            <Text style={styles.featureItem}>• Best price discovery</Text>
            <Text style={styles.featureItem}>• MEV protection</Text>
            <Text style={styles.featureItem}>• Voice swap commands</Text>
          </>
        )}
        {title === 'Learn DeFi' && (
          <>
            <Text style={styles.featureItem}>• Interactive tutorials</Text>
            <Text style={styles.featureItem}>• Gamified learning paths</Text>
            <Text style={styles.featureItem}>• Bonk token rewards</Text>
            <Text style={styles.featureItem}>• AI-powered explanations</Text>
          </>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Bife</Text>
        <Text style={styles.subtitle}>Voice-First AI DeFi Companion</Text>
      </View>

      {/* Content */}
      {currentScreen === 'home' && renderHomeScreen()}
      {currentScreen === 'portfolio' && renderOtherScreen('Portfolio', '📊')}
      {currentScreen === 'swap' && renderOtherScreen('Token Swap', '🔄')}
      {currentScreen === 'learn' && renderOtherScreen('Learn DeFi', '🎓')}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6C5CE7',
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginTop: 5,
  },
  homeScreen: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginVertical: 30,
  },
  avatarCircle: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  avatar: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 70,
  },
  statusEmoji: {
    fontSize: 24,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  greetingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
    minHeight: 80,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  commandContainer: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    width: '100%',
  },
  commandLabel: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 5,
  },
  commandText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    minWidth: 80,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#A0A0A0',
    fontSize: 11,
    marginBottom: 5,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#6C5CE7',
    fontSize: 16,
  },
  screenTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 30,
  },
  featureList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
  },
  featureItem: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 24,
  },
});

export default App;
