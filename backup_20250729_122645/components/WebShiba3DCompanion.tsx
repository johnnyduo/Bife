// WebShiba3DCompanion.tsx - Web-optimized 3D Shiba Companion for React Native Web
import React, { Suspense } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Only render 3D component on web platform
const WebShiba3DCompanion: React.FC<{
  isListening?: boolean;
  isSpeaking?: boolean;
  onPet?: () => void;
}> = ({ isListening = false, isSpeaking = false, onPet }) => {
  
  // For web platform, we can use the original Three.js implementation
  if (Platform.OS === 'web') {
    try {
      // Dynamically import the web 3D component to avoid issues on native
      const Shiba3DCompanion = require('./Shiba3DCompanion').default;
      return (
        <Suspense fallback={
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading 3D Shiba...</Text>
          </View>
        }>
          <Shiba3DCompanion 
            isListening={isListening}
            isSpeaking={isSpeaking}
            onPet={onPet}
          />
        </Suspense>
      );
    } catch (error) {
      console.warn('Failed to load web 3D component:', error);
      return (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>🐕 Shiba</Text>
          <Text style={styles.fallbackSubtext}>
            {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
          </Text>
        </View>
      );
    }
  }

  // For native platforms, return a simple fallback
  return (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackText}>🐕 Shiba</Text>
      <Text style={styles.fallbackSubtext}>
        {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F3F0',
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B4423',
    fontWeight: '600',
  },
  fallbackContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F3F0',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  fallbackText: {
    fontSize: 48,
    marginBottom: 10,
  },
  fallbackSubtext: {
    fontSize: 16,
    color: '#6B4423',
    fontWeight: '600',
  },
});

export default WebShiba3DCompanion;
