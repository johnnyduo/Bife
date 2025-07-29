// Home Screen for Bife - Main interface with avatar and voice controls

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAvatarStore, useVoiceStore, useUserStore, usePortfolioStore } from '@store/index';
import { voiceService } from '@services/voice';
import { BabylonAvatarSystem } from '@avatar/BabylonAvatarSystem';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const avatarStore = useAvatarStore();
  const voiceStore = useVoiceStore();
  const userStore = useUserStore();
  const portfolioStore = usePortfolioStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [currentGreeting, setCurrentGreeting] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarSystemRef = useRef<BabylonAvatarSystem | null>(null);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeScreen();
    setupVoiceServiceListeners();
    startPulseAnimation();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    // Update avatar when store state changes
    if (avatarSystemRef.current && avatarStore.state) {
      avatarSystemRef.current.updateAvatarState(avatarStore.state);
    }
  }, [avatarStore.state]);

  useEffect(() => {
    // Update greeting based on voice state
    updateGreeting();
  }, [voiceStore.isListening, voiceStore.isSpeaking, voiceStore.isProcessing]);

  const initializeScreen = async () => {
    try {
      // Initialize avatar system if canvas is available
      if (canvasRef.current) {
        avatarSystemRef.current = new BabylonAvatarSystem(canvasRef.current);
        await avatarSystemRef.current.loadVRMAvatar();
        avatarStore.setLoaded(true);
      }

      // Load user portfolio
      if (userStore.isAuthenticated) {
        await portfolioStore.refresh();
      }

      // Generate personalized greeting
      generateGreeting();

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize home screen:', error);
      avatarStore.setError('Failed to load avatar');
    }
  };

  const setupVoiceServiceListeners = () => {
    voiceService.onWakeWord(() => {
      avatarStore.setEmotion('excited');
      startGlowAnimation();
    });

    voiceService.onListeningStarted(() => {
      voiceStore.setListening(true);
      avatarStore.setActivity('listening');
    });

    voiceService.onListeningEnded(() => {
      voiceStore.setListening(false);
    });

    voiceService.onTranscript((transcript) => {
      setCurrentGreeting(`I heard: "${transcript}"`);
    });

    voiceService.onResponse((response) => {
      setCurrentGreeting(response.text);
      avatarStore.setEmotion(response.avatarEmotion);
      avatarStore.setActivity(response.avatarActivity);
    });

    voiceService.onSpeechStarted(() => {
      voiceStore.setSpeaking(true);
      avatarStore.setActivity('speaking');
    });

    voiceService.onSpeechEnded(() => {
      voiceStore.setSpeaking(false);
      avatarStore.setActivity('idle');
    });

    voiceService.onErrorOccurred((error) => {
      console.error('Voice service error:', error);
      setCurrentGreeting('Sorry, I encountered an error. Please try again.');
      avatarStore.setEmotion('confused');
    });
  };

  const generateGreeting = () => {
    const hour = new Date().getHours();
    const user = userStore.user;
    
    let timeGreeting = 'Hello';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    const userName = user?.preferences ? ', friend' : '';
    const portfolio = portfolioStore.portfolio;
    
    let greetingMessage = `${timeGreeting}${userName}! I'm Bife, your DeFi companion.`;
    
    if (portfolio) {
      const portfolioValue = portfolio.totalValue.toFixed(2);
      const change = portfolio.pnl24h >= 0 ? '+' : '';
      greetingMessage += ` Your portfolio is worth $${portfolioValue}`;
      
      if (portfolio.pnl24h !== 0) {
        greetingMessage += ` (${change}${portfolio.pnl24h.toFixed(2)}% today)`;
      }
    }
    
    greetingMessage += ' How can I help you today?';
    setCurrentGreeting(greetingMessage);
  };

  const updateGreeting = () => {
    if (voiceStore.isListening) {
      setCurrentGreeting("I'm listening... 👂");
    } else if (voiceStore.isProcessing) {
      setCurrentGreeting("Let me think about that... 🤔");
    } else if (voiceStore.isSpeaking) {
      setCurrentGreeting("Speaking... 🗣️");
    } else if (!currentGreeting || currentGreeting.includes('listening') || currentGreeting.includes('think')) {
      generateGreeting();
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startGlowAnimation = () => {
    Animated.sequence([
      Animated.timing(glowAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnimation, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleMicrophonePress = async () => {
    if (voiceStore.isListening) {
      await voiceService.stopListening();
    } else {
      await voiceService.startListening();
    }
  };

  const handlePortfolioPress = () => {
    navigation.navigate('Portfolio');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleTutorialPress = () => {
    navigation.navigate('Tutorial');
  };

  const cleanup = () => {
    if (avatarSystemRef.current) {
      avatarSystemRef.current.dispose();
    }
    voiceService.dispose();
  };

  const getVoiceButtonColor = () => {
    if (voiceStore.isListening) return '#FF6B6B';
    if (voiceStore.isProcessing) return '#4ECDC4';
    if (voiceStore.isSpeaking) return '#45B7D1';
    return '#6C5CE7';
  };

  const getVoiceButtonIcon = () => {
    if (voiceStore.isListening) return '🎤';
    if (voiceStore.isProcessing) return '⚡';
    if (voiceStore.isSpeaking) return '🔊';
    return '🎙️';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Bife</Text>
        <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Container */}
      <View style={styles.avatarContainer}>
        {/* This would be replaced with actual Babylon.js canvas in production */}
        <Animated.View 
          style={[
            styles.avatarPlaceholder,
            {
              transform: [{ scale: pulseAnimation }],
              shadowColor: glowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(108, 92, 231, 0.3)', 'rgba(108, 92, 231, 0.8)'],
              }),
            },
          ]}
        >
          <Text style={styles.avatarEmoji}>🤖</Text>
          <Text style={styles.avatarStatusText}>
            {avatarStore.state.emotion === 'happy' ? '😊' : 
             avatarStore.state.emotion === 'excited' ? '🤩' :
             avatarStore.state.emotion === 'focused' ? '🧐' :
             avatarStore.state.emotion === 'thinking' ? '🤔' :
             avatarStore.state.emotion === 'confused' ? '😕' : '😐'}
          </Text>
        </Animated.View>
        
        {!avatarStore.isLoaded && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading avatar...</Text>
          </View>
        )}
      </View>

      {/* Greeting Message */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>{currentGreeting}</Text>
      </View>

      {/* Voice Control Button */}
      <Animated.View 
        style={[
          styles.voiceButtonContainer,
          {
            backgroundColor: glowAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [getVoiceButtonColor(), getVoiceButtonColor() + '40'],
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.voiceButton, { backgroundColor: getVoiceButtonColor() }]}
          onPress={handleMicrophonePress}
          disabled={voiceStore.isProcessing}
        >
          <Text style={styles.voiceButtonIcon}>{getVoiceButtonIcon()}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePortfolioPress}>
          <Text style={styles.actionButtonIcon}>📊</Text>
          <Text style={styles.actionButtonText}>Portfolio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleTutorialPress}>
          <Text style={styles.actionButtonIcon}>🎓</Text>
          <Text style={styles.actionButtonText}>Learn</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Swap')}>
          <Text style={styles.actionButtonIcon}>🔄</Text>
          <Text style={styles.actionButtonText}>Swap</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      {portfolioStore.portfolio && (
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Portfolio Value</Text>
            <Text style={styles.statValue}>
              ${portfolioStore.portfolio.totalValue.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>24h Change</Text>
            <Text style={[
              styles.statValue,
              { color: portfolioStore.portfolio.pnl24h >= 0 ? '#00D4AA' : '#FF6B6B' }
            ]}>
              {portfolioStore.portfolio.pnl24h >= 0 ? '+' : ''}
              {portfolioStore.portfolio.pnl24h.toFixed(2)}%
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Assets</Text>
            <Text style={styles.statValue}>
              {portfolioStore.portfolio.tokens.length}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6C5CE7',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  avatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarEmoji: {
    fontSize: 80,
  },
  avatarStatusText: {
    fontSize: 32,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  greetingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    marginBottom: 30,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  voiceButtonContainer: {
    alignSelf: 'center',
    borderRadius: 40,
    marginBottom: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  voiceButtonIcon: {
    fontSize: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    minWidth: 80,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
