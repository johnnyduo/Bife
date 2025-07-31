import * as fs from 'fs';
import * as path from 'path';

function integrateTokens() {
    console.log('🔗 Generating BIFE app integration code...');
    
    // Load token addresses
    const tokenAddressesPath = path.join(__dirname, '../token-addresses.json');
    
    if (!fs.existsSync(tokenAddressesPath)) {
        throw new Error('❌ token-addresses.json not found. Run "yarn create-tokens" first.');
    }
    
    const tokenInfo = JSON.parse(fs.readFileSync(tokenAddressesPath, 'utf8'));
    
    // Create integration code for MainActivity.kt
    const integrationCode = `
        // 🪙 Deployed Mock Tokens on Solana Devnet
        // =========================================
        // Generated: ${new Date().toISOString()}
        // Network: ${tokenInfo.network}
        // Deployer: ${tokenInfo.deployer}
        
        const DEVNET_TOKENS = {
            MOCK_BONK: {
                name: '${tokenInfo.tokens.BONK.name}',
                symbol: '${tokenInfo.tokens.BONK.symbol}',
                mint: '${tokenInfo.tokens.BONK.mint}',
                decimals: ${tokenInfo.tokens.BONK.decimals},
                supply: '${tokenInfo.tokens.BONK.supply}',
                supplyFormatted: '${tokenInfo.tokens.BONK.targetSupplyFormatted}',
                tokenAccount: '${tokenInfo.tokens.BONK.tokenAccount}',
                explorer: 'https://explorer.solana.com/address/${tokenInfo.tokens.BONK.mint}?cluster=${tokenInfo.network}'
            },
            MOCK_USDC: {
                name: '${tokenInfo.tokens.USDC.name}',
                symbol: '${tokenInfo.tokens.USDC.symbol}',
                mint: '${tokenInfo.tokens.USDC.mint}',
                decimals: ${tokenInfo.tokens.USDC.decimals},
                supply: '${tokenInfo.tokens.USDC.supply}',
                supplyFormatted: '${tokenInfo.tokens.USDC.targetSupplyFormatted}',
                tokenAccount: '${tokenInfo.tokens.USDC.tokenAccount}',
                explorer: 'https://explorer.solana.com/address/${tokenInfo.tokens.USDC.mint}?cluster=${tokenInfo.network}'
            }
        };
        
        // Update price data to include mock tokens
        if (typeof priceData !== 'undefined') {
            priceData.MOCK_BONK = priceData.BONK; // Use same price as real BONK
            priceData.MOCK_USDC = priceData.USDC; // Use same price as real USDC
            
            console.log('🪙 Mock tokens integrated with price data');
            console.log('📊 MOCK_BONK price:', priceData.MOCK_BONK);
            console.log('📊 MOCK_USDC price:', priceData.MOCK_USDC);
        }
        
        // Enhanced swap calculation function for mock tokens
        function calculateMockSwapOutput() {
            const fromAmount = parseFloat(document.getElementById('fromAmount').value) || 0;
            const fromToken = document.querySelector('.token-input .token-symbol').textContent;
            const toToken = document.querySelectorAll('.token-input .token-symbol')[1].textContent;
            
            let toAmount = 0;
            let exchangeRate = 0;
            let rateText = '';
            
            // Use mock token prices for calculation
            if (fromToken === 'mUSDC' && toToken === 'mBONK') {
                toAmount = fromAmount / priceData.MOCK_BONK;
                exchangeRate = 1 / priceData.MOCK_BONK;
                rateText = '1 mUSDC = ' + exchangeRate.toLocaleString() + ' mBONK';
            } else if (fromToken === 'mBONK' && toToken === 'mUSDC') {
                toAmount = fromAmount * priceData.MOCK_BONK;
                exchangeRate = priceData.MOCK_BONK;
                rateText = '1 mBONK = $' + exchangeRate.toFixed(8) + ' mUSDC';
            }
            
            // Update UI elements
            document.getElementById('toAmount').value = toAmount > 0 ? toAmount.toFixed(6) : '0.00';
            
            const exchangeRateElement = document.getElementById('exchangeRate');
            if (exchangeRateElement) {
                exchangeRateElement.textContent = rateText;
            }
            
            console.log('💱 Mock token swap calculated:', fromAmount, fromToken, '→', toAmount.toFixed(6), toToken);
        }
        
        console.log('🎉 BIFE Mock Tokens Integration Complete!');
        console.log('Token addresses loaded and ready for trading');
        console.log('Mock BONK:', DEVNET_TOKENS.MOCK_BONK.mint);
        console.log('Mock USDC:', DEVNET_TOKENS.MOCK_USDC.mint);
    `;
    
    // Save integration code
    const integrationPath = path.join(__dirname, '../bife-integration.js');
    fs.writeFileSync(integrationPath, integrationCode);
    
    console.log('✅ Integration code generated at:', integrationPath);
    
    // Create React Native integration
    const reactNativeIntegration = `
// React Native / TypeScript Integration for BIFE App
export const DEVNET_TOKENS = {
    MOCK_BONK: {
        name: '${tokenInfo.tokens.BONK.name}',
        symbol: '${tokenInfo.tokens.BONK.symbol}',
        mint: '${tokenInfo.tokens.BONK.mint}',
        decimals: ${tokenInfo.tokens.BONK.decimals},
        supply: '${tokenInfo.tokens.BONK.supply}',
    },
    MOCK_USDC: {
        name: '${tokenInfo.tokens.USDC.name}',
        symbol: '${tokenInfo.tokens.USDC.symbol}',
        mint: '${tokenInfo.tokens.USDC.mint}',
        decimals: ${tokenInfo.tokens.USDC.decimals},
        supply: '${tokenInfo.tokens.USDC.supply}',
    }
};

export const SOLANA_CONFIG = {
    network: '${tokenInfo.network}',
    rpcUrl: 'https://api.${tokenInfo.network}.solana.com',
    deployerWallet: '${tokenInfo.deployer}',
};
    `;
    
    const rnIntegrationPath = path.join(__dirname, '../src/constants/tokens.ts');
    fs.writeFileSync(rnIntegrationPath, reactNativeIntegration);
    
    console.log('📱 React Native integration generated at:', rnIntegrationPath);
    
    console.log('\n📋 Integration Instructions:');
    console.log('===========================');
    console.log('1. Copy the content from bife-integration.js');
    console.log('2. Add it to your MainActivity.kt JavaScript section');
    console.log('3. Update your trading interface to use DEVNET_TOKENS');
    console.log('4. Test with the deployed token addresses');
    
    console.log('\n🔗 Deployed Token Links:');
    console.log('BONK:', `https://explorer.solana.com/address/${tokenInfo.tokens.BONK.mint}?cluster=${tokenInfo.network}`);
    console.log('USDC:', `https://explorer.solana.com/address/${tokenInfo.tokens.USDC.mint}?cluster=${tokenInfo.network}`);
    
    return tokenInfo;
}

if (require.main === module) {
    integrateTokens()
        .then(() => {
            console.log('🏁 Integration code generation completed successfully');
            process.exit(0);
        })
        .catch((error: any) => {
            console.error('💥 Integration generation failed:', error);
            process.exit(1);
        });
}

export { integrateTokens };
