import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import ShibaViewer from './components/ShibaViewer';
import { WalletTestComponent } from './src/components/WalletTestComponent';

function App(): React.JSX.Element {
  const [showWalletTest, setShowWalletTest] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
      />
      
      {/* Toggle Button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowWalletTest(!showWalletTest)}
      >
        <Text style={styles.toggleText}>
          {showWalletTest ? '🐕 Show Shiba' : '🔗 Test Wallet'}
        </Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {showWalletTest ? (
          <WalletTestComponent />
        ) : (
          <ShibaViewer />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  toggleButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#6200EE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  toggleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});

export default App;