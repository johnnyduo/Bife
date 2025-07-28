import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

const DogComponent = () => {
  return (
    <View style={styles.dogContainer}>
      <Text style={styles.dogTitle}>🐕 React Native Dog! 🐕</Text>
      
      {/* Dog Head */}
      <View style={styles.dogHead}>
        {/* Ears */}
        <View style={styles.ears}>
          <Text style={styles.ear}>🦻</Text>
          <Text style={styles.ear}>🦻</Text>
        </View>
        
        {/* Eyes */}
        <View style={styles.eyes}>
          <Text style={styles.eye}>👁️</Text>
          <Text style={styles.eye}>👁️</Text>
        </View>
        
        {/* Nose */}
        <Text style={styles.nose}>👃</Text>
        
        {/* Tongue */}
        <View>
          <Text style={styles.tongue}>👅</Text>
        </View>
      </View>
      
      {/* Dog Body */}
      <View style={styles.dogBody}>
        <Text style={styles.bodyEmoji}>🐕‍🦺</Text>
        
        {/* Tail */}
        <View style={styles.tail}>
          <Text style={styles.tailEmoji}>🦴</Text>
        </View>
      </View>
      
      {/* Legs */}
      <View style={styles.legs}>
        <Text style={styles.leg}>🦵</Text>
        <Text style={styles.leg}>🦵</Text>
        <Text style={styles.leg}>🦵</Text>
        <Text style={styles.leg}>🦵</Text>
      </View>
    </View>
  );
};

const App = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={styles.container.backgroundColor}
      />
      <View style={styles.content}>
        <Text style={styles.title}>🚀 React Native Dog App! �</Text>
        <Text style={styles.subtitle}>Pure React Native - No Expo</Text>
        <DogComponent />
        <Text style={styles.description}>
          A simple dog made with pure React Native! 🎾
        </Text>
        <Text style={styles.footer}>
          Running on React Native - native performance! ⚡
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 20,
  },
  dogContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  description: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginTop: 30,
    marginHorizontal: 40,
    lineHeight: 24,
  },
  footer: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  dogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
    textAlign: 'center',
  },
  dogHead: {
    alignItems: 'center',
    marginBottom: 10,
  },
  ears: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 80,
    marginBottom: 5,
  },
  ear: {
    fontSize: 20,
  },
  eyes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 50,
    marginBottom: 5,
  },
  eye: {
    fontSize: 18,
  },
  nose: {
    fontSize: 16,
    marginBottom: 5,
  },
  tongue: {
    fontSize: 20,
  },
  dogBody: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  bodyEmoji: {
    fontSize: 40,
  },
  tail: {
    position: 'absolute',
    right: -30,
    top: 5,
  },
  tailEmoji: {
    fontSize: 20,
  },
  legs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 120,
  },
  leg: {
    fontSize: 16,
  },
});

export default App;
