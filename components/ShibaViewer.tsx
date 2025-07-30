import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ShibaViewer: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐕 Shiba Companion</Text>
      <Text style={styles.subtitle}>Voice-First AI DeFi Companion</Text>
      <Text style={styles.description}>
        Welcome to Bife! This is where the 3D Shiba companion will live.{'\n\n'}
        Use the toggle button above to test wallet connectivity.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#cccccc',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ShibaViewer;
