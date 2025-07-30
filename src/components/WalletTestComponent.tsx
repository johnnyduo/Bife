import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl, Transaction, SystemProgram } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

interface WalletState {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  balance: number | null;
  error: string | null;
}

export const WalletTestComponent: React.FC = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    connecting: false,
    publicKey: null,
    balance: null,
    error: null,
  });

  const [connection] = useState(() => new Connection(clusterApiUrl('devnet'), 'confirmed'));

  // Check if Mobile Wallet Adapter is available
  const isMWAAvailable = Platform.OS === 'android';

  useEffect(() => {
    if (walletState.publicKey) {
      updateBalance();
    }
  }, [walletState.publicKey]);

  const updateBalance = async () => {
    if (!walletState.publicKey) return;
    
    try {
      const balance = await connection.getBalance(walletState.publicKey);
      setWalletState(prev => ({
        ...prev,
        balance: balance / LAMPORTS_PER_SOL,
      }));
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  const connectWallet = async () => {
    if (!isMWAAvailable) {
      Alert.alert(
        'Not Available',
        'Mobile Wallet Adapter is only available on Android devices.',
        [{ text: 'OK' }]
      );
      return;
    }

    setWalletState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      // Use Mobile Wallet Adapter protocol
      const result = await transact(async (wallet) => {
        // Authorize the app with the wallet
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'Bife - Voice DeFi Companion',
            uri: 'https://bife.app',
            icon: 'data:image/svg+xml;base64,', // Add your app icon here
          },
        });

        // Get account info
        const accounts = await wallet.getAccounts?.() || [];
        
        if (accounts.length === 0) {
          throw new Error('No accounts found in wallet');
        }
        
        return {
          publicKey: accounts[0].publicKey || accounts[0].address,
          accountLabel: accounts[0].label,
          authToken: authResult.auth_token,
        };
      });

      if (result && result.publicKey) {
        setWalletState(prev => ({
          ...prev,
          connected: true,
          connecting: false,
          publicKey: new PublicKey(result.publicKey),
          error: null,
        }));

        Alert.alert(
          'Success! 🎉',
          `Wallet connected successfully!\n\nPublic Key: ${result.publicKey.toString().slice(0, 8)}...${result.publicKey.toString().slice(-4)}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      let errorMessage = 'Failed to connect wallet. ';
      
      if (error.message?.includes('User declined')) {
        errorMessage += 'User declined the connection request.';
      } else if (error.message?.includes('No wallet found')) {
        errorMessage += 'No compatible wallet found. Please install a Solana wallet like Phantom, Solflare, or Backpack.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }

      setWalletState(prev => ({
        ...prev,
        connecting: false,
        error: errorMessage,
      }));

      Alert.alert('Connection Failed', errorMessage, [
        { text: 'OK' },
        {
          text: 'Install Wallet',
          onPress: () => openWalletInstallGuide(),
        },
      ]);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      connected: false,
      connecting: false,
      publicKey: null,
      balance: null,
      error: null,
    });
    Alert.alert('Disconnected', 'Wallet has been disconnected.', [{ text: 'OK' }]);
  };

  const requestAirdrop = async () => {
    if (!walletState.publicKey) return;

    try {
      Alert.alert(
        'Requesting Airdrop...',
        'Requesting 1 SOL from devnet faucet. This may take a few moments.',
        [{ text: 'OK' }]
      );

      const signature = await connection.requestAirdrop(
        walletState.publicKey,
        LAMPORTS_PER_SOL
      );

      await connection.confirmTransaction(signature);
      await updateBalance();

      Alert.alert(
        'Airdrop Successful! 🎉',
        'You have received 1 SOL on devnet.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Airdrop failed:', error);
      Alert.alert(
        'Airdrop Failed',
        'Failed to request airdrop. Please try again later or use the Solana faucet website.',
        [
          { text: 'OK' },
          {
            text: 'Open Faucet',
            onPress: () => Linking.openURL('https://faucet.solana.com/'),
          },
        ]
      );
    }
  };

  const openWalletInstallGuide = () => {
    Alert.alert(
      'Install a Solana Wallet',
      'To test wallet connection, you need to install a compatible Solana wallet:',
      [
        {
          text: 'Phantom',
          onPress: () => Linking.openURL('https://phantom.app/'),
        },
        {
          text: 'Solflare',
          onPress: () => Linking.openURL('https://solflare.com/'),
        },
        {
          text: 'Backpack',
          onPress: () => Linking.openURL('https://backpack.app/'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const testTransaction = async () => {
    if (!walletState.publicKey) return;

    Alert.alert(
      'Test Transaction',
      'This will create a test transaction to verify wallet functionality. No tokens will be transferred.',
      [
        {
          text: 'Proceed',
          onPress: async () => {
            try {
              // Create a simple test transaction (memo)
              await transact(async (wallet) => {
                const transaction = new Transaction().add(
                  SystemProgram.transfer({
                    fromPubkey: walletState.publicKey!,
                    toPubkey: walletState.publicKey!, // Send to self
                    lamports: 1, // 1 lamport (smallest unit)
                  })
                );

                const recentBlockhash = await connection.getLatestBlockhash();
                transaction.recentBlockhash = recentBlockhash.blockhash;
                transaction.feePayer = walletState.publicKey!;

                const signedTransactions = await wallet.signTransactions({
                  transactions: [transaction],
                });

                const signature = await connection.sendRawTransaction(
                  signedTransactions[0].serialize()
                );

                await connection.confirmTransaction(signature);
                
                Alert.alert(
                  'Transaction Successful! 🎉',
                  `Test transaction completed.\n\nSignature: ${signature.slice(0, 8)}...${signature.slice(-4)}`,
                  [
                    { text: 'OK' },
                    {
                      text: 'View on Explorer',
                      onPress: () => Linking.openURL(`https://explorer.solana.com/tx/${signature}?cluster=devnet`),
                    },
                  ]
                );
              });
            } catch (error: any) {
              console.error('Transaction failed:', error);
              Alert.alert(
                'Transaction Failed',
                error.message || 'Failed to execute test transaction.',
                [{ text: 'OK' }]
              );
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔗 Wallet Connection Test</Text>
        <Text style={styles.subtitle}>Solana Mobile Wallet Adapter Testing</Text>
      </View>

      {/* Platform Check */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform Compatibility</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Platform:</Text>
          <Text style={styles.value}>{Platform.OS}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>MWA Available:</Text>
          <Text style={[styles.value, { color: isMWAAvailable ? '#4CAF50' : '#F44336' }]}>
            {isMWAAvailable ? '✅ Yes' : '❌ No (Android Only)'}
          </Text>
        </View>
      </View>

      {/* Network Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Cluster:</Text>
          <Text style={styles.value}>Devnet</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>RPC:</Text>
          <Text style={styles.value}>api.devnet.solana.com</Text>
        </View>
      </View>

      {/* Wallet Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallet Status</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: walletState.connected ? '#4CAF50' : '#F44336' }]}>
            {walletState.connected ? '✅ Connected' : '❌ Disconnected'}
          </Text>
        </View>
        
        {walletState.publicKey && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Public Key:</Text>
              <Text style={styles.value}>
                {walletState.publicKey.toString().slice(0, 8)}...
                {walletState.publicKey.toString().slice(-4)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Balance:</Text>
              <Text style={styles.value}>
                {walletState.balance !== null ? `${walletState.balance.toFixed(4)} SOL` : 'Loading...'}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Error Display */}
      {walletState.error && (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>{walletState.error}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        {!walletState.connected ? (
          <TouchableOpacity
            style={[styles.button, styles.connectButton]}
            onPress={connectWallet}
            disabled={walletState.connecting || !isMWAAvailable}
          >
            {walletState.connecting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Connect Wallet</Text>
            )}
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.disconnectButton]}
              onPress={disconnectWallet}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.airdropButton]}
              onPress={requestAirdrop}
            >
              <Text style={styles.buttonText}>Request Airdrop (1 SOL)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={testTransaction}
            >
              <Text style={styles.buttonText}>Test Transaction</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={openWalletInstallGuide}
        >
          <Text style={styles.buttonText}>Install Wallet Guide</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testing Instructions</Text>
        <Text style={styles.instructionText}>
          1. Install a Solana wallet (Phantom, Solflare, or Backpack){'\n'}
          2. Create or import a wallet in the app{'\n'}
          3. Switch to Devnet in wallet settings{'\n'}
          4. Click "Connect Wallet" above{'\n'}
          5. Approve the connection in your wallet app{'\n'}
          6. Use "Request Airdrop" to get test SOL{'\n'}
          7. Test transactions to verify functionality
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200EE',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorSection: {
    backgroundColor: '#ffebee',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonSection: {
    padding: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  airdropButton: {
    backgroundColor: '#FF9800',
  },
  testButton: {
    backgroundColor: '#2196F3',
  },
  infoButton: {
    backgroundColor: '#607D8B',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});
