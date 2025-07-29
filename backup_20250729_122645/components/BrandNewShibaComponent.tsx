// SimpleShiba.tsx - Simple fallback Shiba for debugging
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SimpleShibaProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  onPet?: () => void;
}

const BrandNewShibaComponent: React.FC<SimpleShibaProps> = ({ 
  isListening = false, 
  isSpeaking = false, 
  onPet 
}) => {
  
  const handlePress = () => {
    if (onPet) {
      onPet();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[
        styles.shibaContainer,
        isListening && styles.listening,
        isSpeaking && styles.speaking
      ]}>
        {/* THIS IS THE UPDATED VERSION - IMPOSSIBLE TO MISS */}
        <Text style={styles.alertTitle}>🚨 BUNDLE UPDATED! 🚨</Text>
        <Text style={styles.title}>✅ BRAND NEW COMPONENT LOADED</Text>
        <Text style={styles.emoji}>🎯🔥⚡</Text>
        <Text style={styles.status}>
          THIS IS THE NEW VERSION!!! {isListening ? '👂 Listening...' : isSpeaking ? '🗣️ Speaking...' : '😊 Ready to help!'}
        </Text>
        <Text style={styles.subtitle}>Brown Theme Working! NO MORE PINK!</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shibaContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D4A574', // Golden brown - NATURAL COLOR
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#6B4423', // Dark brown border
    shadowColor: '#6B4423',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  listening: {
    backgroundColor: '#8B6F47', // Darker when listening
  },
  speaking: {
    backgroundColor: '#E6B885', // Lighter when speaking
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF0000', // Red for maximum visibility
    marginBottom: 5,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C1810',
    marginBottom: 10,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C1810',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#5D4E37',
    textAlign: 'center',
  },
});

export default BrandNewShibaComponent;
