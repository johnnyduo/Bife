// Simple Avatar Component for initial testing
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SimpleAvatarProps {
  emotion: string;
  isListening: boolean;
  isSpeaking: boolean;
}

export const SimpleAvatar: React.FC<SimpleAvatarProps> = ({ 
  emotion, 
  isListening, 
  isSpeaking 
}) => {
  const getAvatarEmoji = () => {
    if (isListening) return '👂';
    if (isSpeaking) return '🗣️';
    
    switch (emotion) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'thinking': return '🤔';
      case 'concerned': return '😟';
      case 'confused': return '😕';
      default: return '🤖';
    }
  };

  const getStatusText = () => {
    if (isListening) return 'Listening...';
    if (isSpeaking) return 'Speaking...';
    return 'Ready to help!';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.avatar}>{getAvatarEmoji()}</Text>
      <Text style={styles.status}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  avatar: {
    fontSize: 80,
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
