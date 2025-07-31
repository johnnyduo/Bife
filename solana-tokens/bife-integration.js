
        // 🪙 Deployed Mock Tokens on Solana Devnet
        // =========================================
        // Generated: 2025-07-31T07:59:44.682Z
        // Network: devnet
        // Deployer: 5qX8VcUJGhHwXuVUknPa2TuQoKffWZnk5HPNUeUbpJnA
        
        const DEVNET_TOKENS = {
            MOCK_BONK: {
                name: 'Mock BONK',
                symbol: 'mBONK',
                mint: '8wg7hAtfF1eJZLLb7TCHZhVuS3NkBdm8R7dtRPvn9BiP',
                decimals: 5,
                supply: '9300000000000000000',
                supplyFormatted: '93,000,000,000,000',
                tokenAccount: '6RVvbXomByWMAdsEKUkCdXv9mEhPvWkp5ZX5aNcsge41',
                explorer: 'https://explorer.solana.com/address/8wg7hAtfF1eJZLLb7TCHZhVuS3NkBdm8R7dtRPvn9BiP?cluster=devnet'
            },
            MOCK_USDC: {
                name: 'Mock USD Coin',
                symbol: 'mUSDC',
                mint: '9nccat6babNG1u32Xu6d8XojGy7BGH6shwCLzoCrZWTT',
                decimals: 6,
                supply: '10000000000000',
                supplyFormatted: '10,000,000',
                tokenAccount: '9Da78s6up8QkiAvMKhmA73KdeKsVxuP6J69nFGrg2Bf',
                explorer: 'https://explorer.solana.com/address/9nccat6babNG1u32Xu6d8XojGy7BGH6shwCLzoCrZWTT?cluster=devnet'
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
    