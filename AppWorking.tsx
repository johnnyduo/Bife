import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  ToastAndroid,
} from 'react-native';

const BifeApp = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isListening, setIsListening] = useState(false);

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const startVoice = () => {
    setIsListening(true);
    showToast('🎤 Voice activated - Say something!');
    // Simulate voice processing
    setTimeout(() => {
      setIsListening(false);
      showToast('✅ Voice processed successfully');
    }, 3000);
  };

  const renderPortfolio = () => (
    <ScrollView style={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Total Portfolio Value</Text>
        <Text style={styles.portfolioValue}>$45,234.67</Text>
        <Text style={styles.change}>📈 +2.34% (+$1,034.23)</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Top Holdings</Text>
        <View style={styles.holding}>
          <Text style={styles.token}>ETH</Text>
          <Text style={styles.amount}>15.3 ETH ($24,480)</Text>
        </View>
        <View style={styles.holding}>
          <Text style={styles.token}>BTC</Text>
          <Text style={styles.amount}>0.45 BTC ($18,900)</Text>
        </View>
        <View style={styles.holding}>
          <Text style={styles.token}>USDC</Text>
          <Text style={styles.amount}>1,854 USDC ($1,854)</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderSwap = () => (
    <ScrollView style={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔄 Quick Swap</Text>
        <TouchableOpacity style={styles.swapButton} onPress={() => showToast('🔄 ETH → USDC swap initiated')}>
          <Text style={styles.buttonText}>ETH → USDC</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.swapButton} onPress={() => showToast('🔄 BTC → ETH swap initiated')}>
          <Text style={styles.buttonText}>BTC → ETH</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.swapButton} onPress={() => showToast('🔄 USDC → BTC swap initiated')}>
          <Text style={styles.buttonText}>USDC → BTC</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderLearn = () => (
    <ScrollView style={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎓 DeFi Learning</Text>
        <Text style={styles.learningText}>
          "Ask me anything about DeFi, crypto markets, or blockchain technology! I'm your AI companion for navigating the decentralized finance world."
        </Text>
        <TouchableOpacity style={styles.learnButton} onPress={() => showToast('🎓 Learning session started!')}>
          <Text style={styles.buttonText}>Start Learning Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.learnButton} onPress={() => showToast('📊 Market analysis loading...')}>
          <Text style={styles.buttonText}>Market Analysis</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return renderPortfolio();
      case 'swap':
        return renderSwap();
      case 'learn':
        return renderLearn();
      default:
        return renderPortfolio();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎤 Bife</Text>
        <Text style={styles.subtitle}>Voice-First AI DeFi Companion</Text>
        <Text style={styles.status}>✅ Running on Android Emulator</Text>
      </View>

      {/* Voice Avatar */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity 
          style={[styles.avatar, isListening && styles.avatarListening]} 
          onPress={startVoice}
        >
          <Text style={styles.avatarText}>{isListening ? '🔊' : '🎤'}</Text>
        </TouchableOpacity>
        <Text style={styles.avatarLabel}>
          {isListening ? 'Listening...' : 'Tap to speak'}
        </Text>
      </View>

      {/* Content */}
      {renderContent()}

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'portfolio' && styles.activeTab]}
          onPress={() => setActiveTab('portfolio')}
        >
          <Text style={[styles.tabText, activeTab === 'portfolio' && styles.activeTabText]}>
            💰 Portfolio
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'swap' && styles.activeTab]}
          onPress={() => setActiveTab('swap')}
        >
          <Text style={[styles.tabText, activeTab === 'swap' && styles.activeTabText]}>
            🔄 Swap
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'learn' && styles.activeTab]}
          onPress={() => setActiveTab('learn')}
        >
          <Text style={[styles.tabText, activeTab === 'learn' && styles.activeTabText]}>
            🎓 Learn
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#a8a8a8',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    padding: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#e94560',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  avatarListening: {
    backgroundColor: '#e94560',
    transform: [{ scale: 1.1 }],
    shadowRadius: 20,
  },
  avatarText: {
    fontSize: 50,
  },
  avatarLabel: {
    marginTop: 15,
    fontSize: 18,
    color: '#a8a8a8',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0f3460',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  portfolioValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 10,
  },
  change: {
    fontSize: 18,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  holding: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  token: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 16,
    color: '#a8a8a8',
  },
  swapButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  learnButton: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 18,
    marginTop: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e94560',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  learningText: {
    fontSize: 16,
    color: '#a8a8a8',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderTopWidth: 1,
    borderTopColor: '#0f3460',
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: '#e94560',
  },
  tabText: {
    fontSize: 16,
    color: '#a8a8a8',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#e94560',
  },
});

export default BifeApp;
