// Bife - Voice-First AI DeFi Companion
// Main App Component - Android Optimized

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  BackHandler,
  ToastAndroid,
  Animated,
} from 'react-native';

// Define Android Material Design inspired theme
const BifeTheme = {
  colors: {
    primary: '#6C5CE7',
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    accent: '#00D4AA',
    error: '#CF6679',
    warning: '#FF9800',
  },
};

// Bife Avatar Component for Android
const BifeAvatar: React.FC<{ onPress: () => void; isListening: boolean; isSpeaking: boolean }> = ({ 
  onPress, 
  isListening, 
  isSpeaking 
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Continuous pulse animation
    const pulse = Animated.loop(
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
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const getAvatarEmoji = () => {
    if (isListening) return '👂';
    if (isSpeaking) return '🗣️';
    return '🤖';
  };

  return (
    <View style={styles.avatarContainer}>
      <Animated.View style={[styles.avatarCircle, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity 
          style={[
            styles.avatar,
            isListening && styles.avatarListening,
            isSpeaking && styles.avatarSpeaking,
          ]} 
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.avatarEmoji}>{getAvatarEmoji()}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Simple Tab Navigation Component
const TabBar: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'portfolio', icon: '📊', label: 'Portfolio' },
    { id: 'swap', icon: '🔄', label: 'Swap' },
    { id: 'learn', icon: '🎓', label: 'Learn' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tabItem,
            activeTab === tab.id && styles.tabItemActive,
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text style={[
            styles.tabIcon,
            activeTab === tab.id && styles.tabTextActive,
          ]}>
            {tab.icon}
          </Text>
          <Text style={[
            styles.tabLabel,
            activeTab === tab.id && styles.tabTextActive,
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Mock Voice Service for Android
class AndroidVoiceService {
  private isListening = false;
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
    if (this.isListening) return;
    
    this.isListening = true;
    this.emit('listening-start');
    
    // Show Android toast
    ToastAndroid.show('🎤 Listening for voice command...', ToastAndroid.SHORT);
    
    // Simulate voice recognition
    setTimeout(() => {
      const mockCommands = [
        "What's my Solana portfolio worth?",
        "Swap 50 USDC for SOL on Jupiter",
        "Show me DeFi yield farming tutorials",
        "Check current Bonk token price",
        "Stake my SOL with Marinade Finance"
      ];
      const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
      this.emit('transcript', randomCommand);
      
      setTimeout(() => {
        this.emit('response', this.generateAndroidResponse(randomCommand));
        this.isListening = false;
      }, 1500);
    }, 2500);
  }

  stopListening() {
    this.isListening = false;
    this.emit('listening-end');
  }

  private generateAndroidResponse(command: string): string {
    if (command.includes('portfolio')) {
      return "Your Solana portfolio is worth $1,847.23! You're up 8.4% today with SOL, USDC, and BONK holdings. 📈";
    }
    if (command.includes('swap')) {
      return "I'll help you swap on Jupiter! 50 USDC gets you ~0.12 SOL at current rates. Tap to confirm the trade! 🔄";
    }
    if (command.includes('tutorial') || command.includes('learn')) {
      return "Perfect! I have interactive DeFi tutorials: Yield Farming 101, Liquidity Pools, and Solana Staking. Pick one! 🎓";
    }
    if (command.includes('price')) {
      return "BONK is trading at $0.000024, up 18% today! The memecoin market is pumping hard right now! 🚀";
    }
    if (command.includes('stake')) {
      return "Staking with Marinade gives you 7.4% APY! You'll get liquid mSOL tokens that you can use in other DeFi protocols! 💰";
    }
    return "I'm your Android DeFi companion! Ask me about your portfolio, token swaps, or DeFi education. Let's make some money! 🤖💎";
  }
}

const voiceService = new AndroidVoiceService();

// Main App Component
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("Hey! I'm Bife, your Android DeFi companion. Tap me to start! 🚀");
  const [lastCommand, setLastCommand] = useState('');
  const [portfolioValue] = useState(1847.23);

  useEffect(() => {
    initializeAndroidApp();
    setupVoiceListeners();
    setupBackHandler();

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  const initializeAndroidApp = async () => {
    console.log('🤖 Initializing Bife for Android...');
    
    try {
      // Request Android permissions
      await requestAndroidPermissions();
      
      // Initialize Android-specific services
      await initializeAndroidServices();
      
      // Set welcome message
      const hour = new Date().getHours();
      let greeting = 'Hello';
      if (hour < 12) greeting = 'Good morning';
      else if (hour < 18) greeting = 'Good afternoon';
      else greeting = 'Good evening';
      
      setCurrentMessage(`${greeting}! I'm Bife, your Android DeFi companion. Your portfolio: $${portfolioValue.toFixed(2)}. Tap to chat! 💰`);
      
      setIsLoading(false);
      
      // Show welcome toast
      ToastAndroid.show('🚀 Bife initialized successfully!', ToastAndroid.LONG);
      
    } catch (error) {
      console.error('Failed to initialize Android app:', error);
      Alert.alert('Initialization Error', 'Failed to initialize Bife. Please try again.');
      setIsLoading(false);
    }
  };

  const requestAndroidPermissions = async () => {
    console.log('📋 Requesting Android permissions...');
    
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);
      
      Object.entries(results).forEach(([permission, result]) => {
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          console.log(`✅ ${permission} granted`);
        } else {
          console.warn(`⚠️ ${permission} denied`);
          ToastAndroid.show(`Permission ${permission} was denied`, ToastAndroid.SHORT);
        }
      });
    } catch (error) {
      console.warn('Android permission request failed:', error);
    }
  };

  const initializeAndroidServices = async () => {
    console.log('🛠️ Initializing Android services...');
    
    // Mock service initialization for Android
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('✅ Android services initialized');
        resolve(true);
      }, 1000);
    });
  };

  const setupVoiceListeners = () => {
    voiceService.on('listening-start', () => {
      setIsListening(true);
      setCurrentMessage("🎤 I'm listening... Speak your DeFi command!");
    });

    voiceService.on('listening-end', () => {
      setIsListening(false);
      setCurrentMessage("🤔 Processing your request...");
    });

    voiceService.on('transcript', (command: string) => {
      setLastCommand(command);
      setCurrentMessage(`I heard: "${command}"`);
    });

    voiceService.on('response', (response: string) => {
      setIsSpeaking(true);
      setCurrentMessage(response);
      
      // Show response as Android toast
      ToastAndroid.show('🤖 Bife responded!', ToastAndroid.SHORT);
      
      setTimeout(() => {
        setIsSpeaking(false);
      }, 3000);
    });
  };

  const setupBackHandler = () => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  };

  const handleBackPress = () => {
    if (activeTab !== 'home') {
      setActiveTab('home');
      return true;
    }
    
    // Show exit confirmation
    Alert.alert(
      'Exit Bife',
      'Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => BackHandler.exitApp() },
      ]
    );
    return true;
  };

  const handleAvatarPress = async () => {
    if (isListening) {
      voiceService.stopListening();
    } else if (!isSpeaking) {
      await voiceService.startListening();
    }
  };

  const renderHomeScreen = () => (
    <View style={styles.homeScreen}>
      <View style={styles.header}>
        <Text style={styles.logo}>Bife</Text>
        <Text style={styles.subtitle}>Android DeFi Companion</Text>
      </View>

      <BifeAvatar 
        onPress={handleAvatarPress}
        isListening={isListening}
        isSpeaking={isSpeaking}
      />
      
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{currentMessage}</Text>
      </View>

      {lastCommand && (
        <View style={styles.commandContainer}>
          <Text style={styles.commandLabel}>Last Command:</Text>
          <Text style={styles.commandText}>"{lastCommand}"</Text>
        </View>
      )}

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${portfolioValue.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Portfolio</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: BifeTheme.colors.accent }]}>+8.4%</Text>
          <Text style={styles.statLabel}>24h Change</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>🎤</Text>
          <Text style={styles.statLabel}>Voice Ready</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>🤖</Text>
          <Text style={styles.statLabel}>AI Active</Text>
        </View>
      </View>
    </View>
  );

  const renderPlaceholderScreen = (title: string, emoji: string, description: string) => (
    <View style={styles.placeholderScreen}>
      <Text style={styles.placeholderEmoji}>{emoji}</Text>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderDescription}>{description}</Text>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setActiveTab('home')}
      >
        <Text style={styles.backButtonText}>← Back to Bife</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor={BifeTheme.colors.background} barStyle="light-content" />
        <Text style={styles.loadingEmoji}>🚀</Text>
        <Text style={styles.loadingTitle}>Bife</Text>
        <Text style={styles.loadingSubtitle}>Android DeFi Companion</Text>
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={BifeTheme.colors.background} barStyle="light-content" />
      
      <View style={styles.content}>
        {activeTab === 'home' && renderHomeScreen()}
        {activeTab === 'portfolio' && renderPlaceholderScreen(
          'Portfolio Dashboard', 
          '📊', 
          'Real-time Solana portfolio tracking with Jupiter integration coming soon!'
        )}
        {activeTab === 'swap' && renderPlaceholderScreen(
          'Token Swap', 
          '🔄', 
          'Jupiter aggregator integration for best swap rates coming soon!'
        )}
        {activeTab === 'learn' && renderPlaceholderScreen(
          'DeFi Education', 
          '🎓', 
          'Interactive Solana DeFi tutorials with Bonk rewards coming soon!'
        )}
      </View>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BifeTheme.colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BifeTheme.colors.background,
    padding: 20,
  },
  loadingEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: BifeTheme.colors.primary,
    marginBottom: 10,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: BifeTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 18,
    color: BifeTheme.colors.text,
    opacity: 0.8,
  },
  homeScreen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: BifeTheme.colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: BifeTheme.colors.textSecondary,
    marginTop: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  avatarCircle: {
    shadowColor: BifeTheme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: BifeTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: BifeTheme.colors.primary,
  },
  avatarListening: {
    borderColor: BifeTheme.colors.accent,
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
  },
  avatarSpeaking: {
    borderColor: BifeTheme.colors.warning,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  avatarEmoji: {
    fontSize: 60,
  },
  messageContainer: {
    backgroundColor: BifeTheme.colors.surface,
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
    minHeight: 80,
  },
  messageText: {
    color: BifeTheme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  commandContainer: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  commandLabel: {
    color: BifeTheme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 5,
  },
  commandText: {
    color: BifeTheme.colors.text,
    fontSize: 14,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: BifeTheme.colors.surface,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BifeTheme.colors.text,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: BifeTheme.colors.textSecondary,
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BifeTheme.colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  placeholderDescription: {
    fontSize: 16,
    color: BifeTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: BifeTheme.colors.primary,
    borderRadius: 25,
  },
  backButtonText: {
    color: BifeTheme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: BifeTheme.colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: BifeTheme.colors.card,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: BifeTheme.colors.textSecondary,
  },
  tabTextActive: {
    color: BifeTheme.colors.primary,
  },
});

export default App;
