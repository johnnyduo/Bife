// Bife - Voice-First AI DeFi Companion
// Main App Component

import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Crypto polyfills for React Native
import 'react-native-get-random-values';

// Store imports
import { useAppStore, useUserStore } from './src/store';

// Screen imports
import { HomeScreen } from './src/screens/HomeScreen';

// Service imports
import { voiceService } from './src/services/voice';
import { solanaService } from './src/blockchain/solana';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Define app theme colors
const BifeTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6C5CE7',
    background: '#1A1A2E',
    card: '#16213E',
    text: '#FFFFFF',
    border: '#0F3460',
    notification: '#00D4AA',
  },
};

// Loading Screen Component
const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingLogo}>🚀</Text>
    <Text style={styles.loadingTitle}>Bife</Text>
    <Text style={styles.loadingSubtitle}>Voice-First AI DeFi Companion</Text>
    <Text style={styles.loadingText}>Initializing...</Text>
  </View>
);

// Placeholder screens - These would be implemented as separate files
const PortfolioScreen: React.FC = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderTitle}>📊 Portfolio</Text>
    <Text style={styles.placeholderText}>Portfolio management coming soon!</Text>
  </View>
);

const SwapScreen: React.FC = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderTitle}>🔄 Token Swap</Text>
    <Text style={styles.placeholderText}>Token swapping interface coming soon!</Text>
  </View>
);

const TutorialScreen: React.FC = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderTitle}>🎓 Learn DeFi</Text>
    <Text style={styles.placeholderText}>Interactive DeFi tutorials coming soon!</Text>
  </View>
);

const SettingsScreen: React.FC = () => (
  <View style={styles.placeholderScreen}>
    <Text style={styles.placeholderTitle}>⚙️ Settings</Text>
    <Text style={styles.placeholderText}>App settings and preferences coming soon!</Text>
  </View>
);

// Tab Navigator
const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: BifeTheme.colors.card },
      headerTintColor: BifeTheme.colors.text,
      tabBarStyle: { backgroundColor: BifeTheme.colors.card },
      tabBarActiveTintColor: BifeTheme.colors.primary,
      tabBarInactiveTintColor: '#A0A0A0',
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Portfolio"
      component={PortfolioScreen}
      options={{
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
      }}
    />
    <Tab.Screen
      name="Swap"
      component={SwapScreen}
      options={{
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔄</Text>,
      }}
    />
    <Tab.Screen
      name="Learn"
      component={TutorialScreen}
      options={{
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎓</Text>,
      }}
    />
  </Tab.Navigator>
);

// Main Stack Navigator
const AppNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: BifeTheme.colors.card },
      headerTintColor: BifeTheme.colors.text,
      cardStyle: { backgroundColor: BifeTheme.colors.background },
    }}
  >
    <Stack.Screen
      name="MainTabs"
      component={TabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </Stack.Navigator>
);

// Main App Component
const App: React.FC = () => {
  const colorScheme = useColorScheme();
  const appStore = useAppStore();
  const userStore = useUserStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Bife application...');

      // Request necessary permissions
      await requestPermissions();

      // Initialize device capabilities detection
      await initializeDeviceCapabilities();

      // Initialize services
      await initializeServices();

      // Set app as initialized
      appStore.setInitialized(true);
      
      console.log('✅ Bife application initialized successfully');
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Failed to initialize Bife application:', error);
      setInitError((error as Error).message);
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    console.log('📋 Requesting permissions...');

    if (Platform.OS === 'android') {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.USE_BIOMETRIC,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);
        
        Object.entries(results).forEach(([permission, result]) => {
          if (result !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn(`Permission ${permission} not granted`);
          }
        });
      } catch (error) {
        console.warn('Permission request failed:', error);
      }
    }
  };

  const initializeDeviceCapabilities = async () => {
    console.log('🔍 Detecting device capabilities...');
    
    // This would use the device detection logic
    // For now, set default capabilities
    const capabilities = {
      hasVoiceRecognition: true,
      hasTTS: true,
      hasHapticFeedback: Platform.OS === 'ios',
      hasBiometrics: true,
      has3DAcceleration: true,
      performanceClass: 'mid' as const,
      memoryLimit: 4096,
      targetFPS: 45,
    };

    appStore.setDeviceCapabilities(capabilities);
  };

  const initializeServices = async () => {
    console.log('🛠️ Initializing services...');

    try {
      // Test voice services
      const voiceTestResults = await voiceService.testVoiceServices();
      console.log('Voice services test:', voiceTestResults);

      // Test blockchain connectivity
      const networkStatus = await solanaService.getNetworkStatus();
      console.log('Solana network status:', networkStatus);

      if (!networkStatus.isHealthy) {
        console.warn('Solana network appears to be unhealthy');
      }

      // Start wake word detection if available
      voiceService.startWakeWordDetection();

    } catch (error) {
      console.error('Service initialization failed:', error);
      throw new Error('Critical services failed to initialize');
    }
  };

  const handleError = () => {
    Alert.alert(
      'Initialization Error',
      `Failed to initialize Bife: ${initError}`,
      [
        { text: 'Retry', onPress: () => {
          setInitError(null);
          setIsLoading(true);
          initializeApp();
        }},
        { text: 'Continue Anyway', onPress: () => {
          setIsLoading(false);
          setInitError(null);
        }},
      ]
    );
  };

  // Show loading screen
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={BifeTheme.colors.background}
          />
          <LoadingScreen />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  }

  // Show error screen
  if (initError) {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={BifeTheme.colors.background}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>Initialization Failed</Text>
            <Text style={styles.errorMessage}>{initError}</Text>
            <Text style={styles.errorHint}>
              Check your network connection and try again.
            </Text>
          </View>
          {handleError()}
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  }

  // Main app
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={BifeTheme.colors.background}
        />
        <NavigationContainer theme={BifeTheme}>
          <AppNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: 20,
  },
  loadingLogo: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6C5CE7',
    marginBottom: 10,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: 20,
  },
  errorEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  errorHint: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  placeholderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 32,
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default App;
