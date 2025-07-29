package com.bife

import android.app.Activity
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebSettings
import android.webkit.WebChromeClient
import android.util.Log
import java.io.InputStream

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val webView = WebView(this)
        
        // Enable JavaScript and other settings
        val webSettings: WebSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true
        webSettings.allowFileAccessFromFileURLs = true
        webSettings.allowUniversalAccessFromFileURLs = true
        webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        webSettings.loadWithOverviewMode = true
        webSettings.useWideViewPort = true
        
        // Set WebView client with debugging
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                Log.d("MainActivity", "Page loaded successfully")
            }
        }
        
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: android.webkit.ConsoleMessage?): Boolean {
                Log.d("WebView", "Console: " + message?.message())
                return true
            }
        }
        
        // Read the AstronautDog.json file from assets
        val astronautDogJsonContent = try {
            assets.open("models/AstronautDog.json").bufferedReader().use { it.readText() }
        } catch (e: Exception) {
            Log.e("MainActivity", "Error reading AstronautDog.json: ${e.message}")
            "null"
        }
        
        val htmlContent = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bife - Bonk-Powered DeFi Space Mission</title>
    <link href="https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Orbitron:wght@400;500;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            /* Bonk-Powered DeFi Color Palette */
            --bonk-orange: #FF6B35;
            --bonk-orange-glow: rgba(255, 107, 53, 0.3);
            --solana-purple: #9945FF;
            --solana-purple-glow: rgba(153, 69, 255, 0.3);
            --cyber-cyan: #00D4FF;
            --cyber-cyan-glow: rgba(0, 212, 255, 0.3);
            --defi-green: #00FF88;
            --defi-green-glow: rgba(0, 255, 136, 0.3);
            
            /* Glassmorphism System */
            --glass-bg: rgba(255, 255, 255, 0.08);
            --glass-bg-hover: rgba(255, 255, 255, 0.12);
            --glass-border: rgba(255, 255, 255, 0.15);
            --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            --glass-shadow-hover: 0 12px 40px rgba(31, 38, 135, 0.5);
            
            /* Typography */
            --font-display: 'Gloria Hallelujah', cursive;
            --font-body: 'Inter', sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
            --font-accent: 'Orbitron', monospace;
            
            /* Text Colors */
            --text-primary: #FFFFFF;
            --text-secondary: #B0B0B0;
            --text-accent: #00D4FF;
            --text-success: #00FF88;
            --text-warning: #FFD700;
            --text-error: #FF4757;
        }

        * { 
            margin: 0; padding: 0; box-sizing: border-box;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            -webkit-tap-highlight-color: transparent;
        }
        
        body { 
            background: 
                radial-gradient(circle at 20% 50%, var(--bonk-orange-glow) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, var(--solana-purple-glow) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, var(--cyber-cyan-glow) 0%, transparent 50%),
                linear-gradient(135deg, #0F0F23 0%, #1a1a2e 50%, #16213e 100%);
            color: var(--text-primary);
            font-family: var(--font-body);
            min-height: 100vh; 
            overflow-x: hidden;
            overflow-y: auto;
            position: relative;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            padding: 0;
            margin: 0;
        }

        /* Floating particles background */
        .particles {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        .particle {
            position: absolute;
            width: 3px; height: 3px;
            background: var(--cyber-cyan);
            border-radius: 50%;
            animation: float 6s infinite ease-in-out;
            opacity: 0.6;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
            25% { transform: translateY(-20px) rotate(90deg); opacity: 1; }
            50% { transform: translateY(-10px) rotate(180deg); opacity: 0.8; }
            75% { transform: translateY(-30px) rotate(270deg); opacity: 1; }
        }

        /* Main container with glassmorphism */
        #app-container {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            padding: 20px;
            z-index: 10;
            position: relative;
            max-width: 1200px;
            margin: 0 auto;
        }

        /* Header with Bonk branding */
        .header {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 20px 30px;
            margin-bottom: 20px;
            box-shadow: var(--glass-shadow);
            display: flex;
            justify-content: space-between;
            align-items: center;
            will-change: transform;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo-text {
            font-family: var(--font-display);
            font-size: 28px;
            font-weight: 400;
            background: linear-gradient(135deg, var(--bonk-orange), var(--cyber-cyan));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: 2px;
        }

        .tagline {
            font-size: 12px;
            color: var(--text-secondary);
            font-weight: 300;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 16px;
            background: var(--glass-bg-hover);
            border-radius: 25px;
            border: 1px solid var(--glass-border);
        }

        .status-dot {
            width: 8px; height: 8px;
            border-radius: 50%;
            background: var(--defi-green);
            box-shadow: 0 0 10px var(--defi-green-glow);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.2); }
        }

        /* Main content area */
        .main-content {
            display: flex;
            flex: 1;
            gap: 20px;
            min-height: 500px;
            margin-bottom: 20px;
        }

        /* Left panel - Astronaut Dog Avatar */
        .avatar-section {
            flex: 1;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 25px;
            padding: 30px;
            box-shadow: var(--glass-shadow);
            display: flex;
            flex-direction: column;
        }

        .avatar-header {
            text-align: center;
            margin-bottom: 20px;
        }

        .avatar-title {
            font-family: var(--font-display);
            font-size: 24px;
            font-weight: 400;
            color: var(--text-primary);
            margin-bottom: 8px;
        }

        .avatar-subtitle {
            font-size: 14px;
            color: var(--text-secondary);
            font-weight: 400;
        }

        #astronaut-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 20px;
            background: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            position: relative;
            overflow: hidden;
            will-change: transform;
            transform: translateZ(0);
            backface-visibility: hidden;
            pointer-events: none;
            min-height: 300px;
        }

        #astronaut-animation {
            width: 90%;
            height: 90%;
            max-width: 400px;
            max-height: 400px;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: transform 0.3s ease;
        }

        /* Right panel - DeFi Interface */
        .defi-section {
            flex: 1.2;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 25px;
            padding: 30px;
            box-shadow: var(--glass-shadow);
            display: flex;
            flex-direction: column;
        }

        .defi-header {
            text-align: center;
            margin-bottom: 25px;
        }

        .defi-title {
            font-family: var(--font-display);
            font-size: 22px;
            font-weight: 400;
            color: var(--bonk-orange);
            margin-bottom: 8px;
        }

        .defi-subtitle {
            font-size: 13px;
            color: var(--text-secondary);
        }

        .defi-controls {
            display: flex;
            flex-direction: column;
            gap: 20px;
            flex: 1;
        }

        /* Portfolio Section */
        .portfolio-card {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .portfolio-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .portfolio-title {
            font-family: var(--font-display);
            font-size: 16px;
            color: var(--text-primary);
        }

        .portfolio-value {
            font-family: var(--font-mono);
            font-size: 18px;
            font-weight: 600;
            color: var(--defi-green);
        }

        .portfolio-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
        }

        .stat-label {
            font-size: 12px;
            color: var(--text-secondary);
        }

        .stat-value {
            font-family: var(--font-mono);
            font-size: 13px;
            font-weight: 500;
            color: var(--text-primary);
        }

        /* DeFi Actions */
        .defi-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }

        .action-button {
            background: linear-gradient(135deg, var(--bonk-orange), var(--solana-purple));
            border: none;
            border-radius: 12px;
            padding: 15px 12px;
            color: white;
            font-family: var(--font-display);
            font-size: 13px;
            font-weight: 400;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 107, 53, 0.2);
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(255, 107, 53, 0.4);
        }

        .action-button:active {
            transform: translateY(0px) scale(0.98);
            box-shadow: 0 2px 10px rgba(255, 107, 53, 0.6);
        }

        .action-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }

        .action-button:hover::before {
            left: 100%;
        }

        .action-button.secondary {
            background: linear-gradient(135deg, var(--cyber-cyan), var(--solana-purple));
            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
        }

        .action-button.secondary:hover {
            box-shadow: 0 6px 25px rgba(0, 212, 255, 0.4);
        }

        /* Swap Interface */
        .swap-interface {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .swap-title {
            font-family: var(--font-display);
            font-size: 16px;
            color: var(--cyber-cyan);
            margin-bottom: 15px;
            text-align: center;
        }

        .token-input {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .token-amount {
            background: none;
            border: none;
            color: var(--text-primary);
            font-family: var(--font-mono);
            font-size: 16px;
            outline: none;
            width: 60%;
        }

        .token-symbol {
            font-family: var(--font-display);
            font-size: 14px;
            color: var(--bonk-orange);
            font-weight: 600;
            cursor: pointer;
        }

        .swap-arrow {
            text-align: center;
            margin: 10px 0;
            font-size: 20px;
            color: var(--cyber-cyan);
        }

        .swap-button {
            width: 100%;
            background: linear-gradient(135deg, var(--cyber-cyan), var(--defi-green));
            border: none;
            border-radius: 12px;
            padding: 15px;
            color: white;
            font-family: var(--font-display);
            font-size: 16px;
            font-weight: 400;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
            position: relative;
            overflow: hidden;
        }

        .swap-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0, 212, 255, 0.5);
        }

        .swap-button:active {
            transform: translateY(0px) scale(0.98);
        }

        .swap-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        /* Enhanced token input with better interaction */
        .token-input:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .token-symbol:hover {
            background: rgba(255, 107, 53, 0.2);
            border-radius: 8px;
            padding: 4px 8px;
            margin: -4px -8px;
        }

        /* Portfolio value animations */
        .portfolio-value.updating {
            animation: valueUpdate 0.6s ease-in-out;
        }

        @keyframes valueUpdate {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); color: var(--cyber-cyan); }
            100% { transform: scale(1); }
        }

        /* Stat item hover effects */
        .stat-item:hover {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 12px 8px;
            margin: -4px -8px;
            transition: all 0.2s ease;
        }

        /* Bottom status bar */
        .status-bar {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 15px 25px;
            margin-top: 20px;
            box-shadow: var(--glass-shadow);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .status-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--text-secondary);
        }

        .status-value {
            color: var(--text-primary);
            font-weight: 600;
            font-family: var(--font-mono);
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .main-content {
                flex-direction: column;
            }
            
            .logo-text {
                font-size: 24px;
            }
            
            #app-container {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <!-- Floating particles background -->
    <div class="particles" id="particles"></div>

    <div id="app-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <div>
                    <div class="logo-text">BIFE</div>
                    <div class="tagline">Bonk-Powered DeFi Space Mission</div>
                </div>
            </div>
            <div class="status-indicator">
                <div class="status-dot"></div>
                <span style="font-size: 12px; font-weight: 500;">Space Mission Ready</span>
            </div>
        </div>

        <!-- Main content -->
        <div class="main-content">
            <!-- Astronaut Dog Avatar Section -->
            <div class="avatar-section">
                <div class="avatar-header">
                    <div class="avatar-title">Astronaut Dog Companion</div>
                    <div class="avatar-subtitle">Your DeFi Space Explorer</div>
                </div>
                <div id="astronaut-container">
                    <div id="astronaut-animation">
                        <div style="color: var(--text-secondary); text-align: center; font-size: 14px;">
                            Loading your space companion...
                        </div>
                    </div>
                </div>
            </div>

            <!-- DeFi Interface Section -->
            <div class="defi-section">
                <div class="defi-header">
                    <div class="defi-title">🚀 DeFi Mission Control</div>
                    <div class="defi-subtitle">Complete DeFi operations from space</div>
                </div>
                
                <div class="defi-controls">
                    <!-- Portfolio Overview -->
                    <div class="portfolio-card">
                        <div class="portfolio-header">
                            <div class="portfolio-title">🌌 Portfolio Universe</div>
                            <div class="portfolio-value" id="totalValue">$12,450.89</div>
                        </div>
                        <div class="portfolio-stats">
                            <div class="stat-item">
                                <span class="stat-label">SOL Balance</span>
                                <span class="stat-value" id="solBalance">45.2 SOL</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">BONK Holdings</span>
                                <span class="stat-value" id="bonkBalance">2.1M BONK</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">USDC Stable</span>
                                <span class="stat-value" id="usdcBalance">$3,460.12</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">24h P&L</span>
                                <span class="stat-value" style="color: var(--defi-green);" id="dailyPnl">+$234.56</span>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="defi-actions">
                        <button class="action-button" onclick="refreshPortfolio()">
                            📊 Refresh Portfolio
                        </button>
                        <button class="action-button secondary" onclick="openYieldFarms()">
                            🌾 Yield Farms
                        </button>
                        <button class="action-button" onclick="checkPrices()">
                            💰 Live Prices
                        </button>
                        <button class="action-button secondary" onclick="openStaking()">
                            🔒 Staking Rewards
                        </button>
                    </div>

                    <!-- Swap Interface -->
                    <div class="swap-interface">
                        <div class="swap-title">🔄 Instant Swap</div>
                        
                        <div class="token-input">
                            <input type="number" class="token-amount" placeholder="0.00" id="fromAmount" value="100">
                            <div class="token-symbol" onclick="selectFromToken()">USDC</div>
                        </div>
                        
                        <div class="swap-arrow">⬇️</div>
                        
                        <div class="token-input">
                            <input type="number" class="token-amount" placeholder="0.00" id="toAmount" readonly>
                            <div class="token-symbol" onclick="selectToToken()">BONK</div>
                        </div>
                        
                        <button class="swap-button" onclick="executeSwap()">
                            🚀 Execute Swap
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status Bar -->
        <div class="status-bar">
            <div class="status-item">
                <span>🚀</span>
                <span>Mission: <span class="status-value" id="networkStatus">Space Ready</span></span>
            </div>
            <div class="status-item">
                <span>⚡</span>
                <span>Performance: <span class="status-value" id="performanceStatus">Optimized</span></span>
            </div>
            <div class="status-item">
                <span>🛸</span>
                <span>Astronaut Dog: <span class="status-value" id="lottieStatus">Loading...</span></span>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
    <script>
        // Bonk-Powered DeFi Space Mission Control
        let lottieAnimation = null;
        let isListening = false;
        let recognition = null;

        // Your authentic AstronautDog.lottie data injected here
        const astronautDogAnimationData = $astronautDogJsonContent;

        // Mock DeFi data
        let portfolioData = {
            totalValue: 12450.89,
            solBalance: 45.2,
            bonkBalance: 2100000,
            usdcBalance: 3460.12,
            dailyPnl: 234.56
        };

        let priceData = {
            SOL: 145.67,
            BONK: 0.00000852,
            USDC: 1.00
        };

        // Initialize particles background
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (6 + Math.random() * 4) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        // Initialize Astronaut Dog Lottie animation
        function initAstronautDogAnimation() {
            console.log('🚀 Initializing Astronaut Dog space companion...');
            const container = document.getElementById('astronaut-animation');
            
            if (astronautDogAnimationData && typeof astronautDogAnimationData === 'object') {
                console.log('🎉 Loading authentic Astronaut Dog animation...');
                console.log('📊 Animation data size:', JSON.stringify(astronautDogAnimationData).length, 'characters');
                
                // Device performance detection
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                const isHighPerformance = gl && gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096;
                const deviceMemory = navigator.deviceMemory || 4;
                
                console.log('📱 Device performance:', isHighPerformance ? 'High' : 'Standard');
                console.log('💾 Device memory:', deviceMemory + 'GB');
                
                // Clear loading message
                container.innerHTML = '';
                
                // Optimize settings based on device
                const optimizedSettings = {
                    container: container,
                    renderer: isHighPerformance ? 'svg' : 'canvas',
                    loop: true,
                    autoplay: true,
                    animationData: astronautDogAnimationData,
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid meet',
                        progressiveLoad: true,
                        hideOnTransparent: true,
                        scaleMode: isHighPerformance ? 'noScale' : 'showAll',
                        clearCanvas: !isHighPerformance
                    }
                };
                
                lottieAnimation = lottie.loadAnimation(optimizedSettings);
                
                // Adaptive playback speed
                const playbackSpeed = isHighPerformance && deviceMemory >= 6 ? 1.0 : 0.8;
                lottieAnimation.setSpeed(playbackSpeed);
                
                lottieAnimation.addEventListener('DOMLoaded', function() {
                    console.log('✅ Astronaut Dog space companion ready!');
                    document.getElementById('lottieStatus').textContent = 'Space Ready';
                    document.getElementById('performanceStatus').textContent = playbackSpeed + 'x Speed';
                    
                    // Add floating effect
                    setInterval(() => {
                        if (lottieAnimation) {
                            const container = document.getElementById('astronaut-animation');
                            container.style.transform = 'translateY(' + (Math.sin(Date.now() / 1000) * 5) + 'px)';
                        }
                    }, 50);
                });
                
            } else {
                console.error('❌ No valid Astronaut Dog animation data found');
                container.innerHTML = '<div style="color: var(--text-error); text-align: center;">Unable to load space companion</div>';
                document.getElementById('lottieStatus').textContent = 'Error';
            }
        }

        // Perfect DeFi Functions
        function refreshPortfolio() {
            console.log('📊 Refreshing portfolio data...');
            
            // Animate the astronaut
            if (lottieAnimation) {
                const container = document.getElementById('astronaut-animation');
                container.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    container.style.transform = 'scale(1)';
                }, 500);
            }
            
            // Simulate real data update
            portfolioData.totalValue += (Math.random() - 0.5) * 100;
            portfolioData.dailyPnl += (Math.random() - 0.5) * 50;
            
            // Update UI
            document.getElementById('totalValue').textContent = '$' + portfolioData.totalValue.toFixed(2);
            document.getElementById('dailyPnl').textContent = (portfolioData.dailyPnl >= 0 ? '+' : '') + '$' + portfolioData.dailyPnl.toFixed(2);
            document.getElementById('dailyPnl').style.color = portfolioData.dailyPnl >= 0 ? 'var(--defi-green)' : 'var(--text-error)';
            
            showNotification('Portfolio Updated', 'Latest data from the blockchain');
        }

        function openYieldFarms() {
            console.log('🌾 Opening yield farming opportunities...');
            showNotification('Yield Farms', 'Raydium SOL-USDC: 18.4% APY • Orca BONK-SOL: 24.1% APY');
        }

        function checkPrices() {
            console.log('💰 Checking live prices...');
            
            // Simulate price updates
            priceData.SOL += (Math.random() - 0.5) * 5;
            priceData.BONK += (Math.random() - 0.5) * 0.000001;
            
            const priceInfo = 'SOL: $' + priceData.SOL.toFixed(2) + ' • BONK: $' + priceData.BONK.toFixed(8) + ' • USDC: $' + priceData.USDC.toFixed(2);
            showNotification('Live Prices', priceInfo);
        }

        function openStaking() {
            console.log('🔒 Opening staking rewards...');
            showNotification('Staking Rewards', 'SOL Staking: 7.2% APY • BONK Staking: 15.6% APY');
        }

        function selectFromToken() {
            const tokens = ['USDC', 'SOL', 'BONK'];
            const current = document.querySelector('.token-input .token-symbol').textContent;
            const currentIndex = tokens.indexOf(current);
            const nextToken = tokens[(currentIndex + 1) % tokens.length];
            document.querySelector('.token-input .token-symbol').textContent = nextToken;
            calculateSwap();
        }

        function selectToToken() {
            const tokens = ['BONK', 'SOL', 'USDC'];
            const current = document.querySelectorAll('.token-input .token-symbol')[1].textContent;
            const currentIndex = tokens.indexOf(current);
            const nextToken = tokens[(currentIndex + 1) % tokens.length];
            document.querySelectorAll('.token-input .token-symbol')[1].textContent = nextToken;
            calculateSwap();
        }

        function calculateSwap() {
            const fromAmount = parseFloat(document.getElementById('fromAmount').value) || 0;
            const fromToken = document.querySelector('.token-input .token-symbol').textContent;
            const toToken = document.querySelectorAll('.token-input .token-symbol')[1].textContent;
            
            let toAmount = 0;
            
            // Simple conversion logic
            if (fromToken === 'USDC' && toToken === 'BONK') {
                toAmount = fromAmount / priceData.BONK;
            } else if (fromToken === 'USDC' && toToken === 'SOL') {
                toAmount = fromAmount / priceData.SOL;
            } else if (fromToken === 'SOL' && toToken === 'USDC') {
                toAmount = fromAmount * priceData.SOL;
            } else if (fromToken === 'SOL' && toToken === 'BONK') {
                toAmount = (fromAmount * priceData.SOL) / priceData.BONK;
            } else if (fromToken === 'BONK' && toToken === 'USDC') {
                toAmount = fromAmount * priceData.BONK;
            } else if (fromToken === 'BONK' && toToken === 'SOL') {
                toAmount = (fromAmount * priceData.BONK) / priceData.SOL;
            }
            
            document.getElementById('toAmount').value = toAmount > 0 ? toAmount.toFixed(6) : '0.00';
        }

        function executeSwap() {
            const fromAmount = document.getElementById('fromAmount').value;
            const fromToken = document.querySelector('.token-input .token-symbol').textContent;
            const toAmount = document.getElementById('toAmount').value;
            const toToken = document.querySelectorAll('.token-input .token-symbol')[1].textContent;
            
            if (!fromAmount || fromAmount <= 0) {
                showNotification('Swap Error', 'Please enter a valid amount');
                return;
            }
            
            console.log('🔄 Executing swap: ' + fromAmount + ' ' + fromToken + ' → ' + toAmount + ' ' + toToken);
            
            // Animate astronaut for swap confirmation
            if (lottieAnimation) {
                const container = document.getElementById('astronaut-animation');
                container.style.filter = 'drop-shadow(0 0 30px var(--defi-green))';
                setTimeout(() => {
                    container.style.filter = 'none';
                }, 1000);
            }
            
            showNotification('Swap Executed', 'Successfully swapped ' + fromAmount + ' ' + fromToken + ' for ' + toAmount + ' ' + toToken);
            
            // Update portfolio after swap
            setTimeout(refreshPortfolio, 1000);
        }

        function showNotification(title, message) {
            document.getElementById('networkStatus').textContent = title;
            console.log('🚀 ' + title + ': ' + message);
            
            // Visual feedback
            const statusBar = document.querySelector('.status-bar');
            statusBar.style.background = 'var(--bonk-orange-glow)';
            setTimeout(() => {
                statusBar.style.background = 'var(--glass-bg)';
            }, 2000);
        }

        // Auto-calculate swap when amount changes
        document.addEventListener('DOMContentLoaded', function() {
            const fromAmountInput = document.getElementById('fromAmount');
            if (fromAmountInput) {
                fromAmountInput.addEventListener('input', calculateSwap);
            }
        });

        // Initialize everything
        function init() {
            console.log('🚀 Initializing Bonk-Powered DeFi Space Mission...');
            
            // Create visual effects
            createParticles();
            
            // Initialize Astronaut Dog animation
            initAstronautDogAnimation();
            
            // Initialize swap calculator
            calculateSwap();
            
            console.log('✅ Bife DeFi Space Mission ready!');
        }

        // Start when page loads
        window.addEventListener('load', () => {
            console.log('🚀 Bonk-Powered DeFi Space Mission starting...');
            init();
        });

        console.log('🚀 DeFi Space Mission Control system loaded!');
    </script>
</body>
</html>
        """
        
        Log.d("MainActivity", "Loading Bonk-Powered DeFi Space Mission...")
        webView.loadDataWithBaseURL("file:///android_asset/", htmlContent, "text/html", "UTF-8", null)
        
        setContentView(webView)
        Log.d("MainActivity", "Bife DeFi Space Mission ready!")
    }
}
