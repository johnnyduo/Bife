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
        
        // Add JavaScript interface for enhanced API access
        webView.addJavascriptInterface(object {
            @android.webkit.JavascriptInterface
            fun getGeminiApiKey(): String {
                // Try multiple environment variable patterns
                val apiKey = System.getenv("GEMINI_API_KEY") 
                    ?: System.getenv("GOOGLE_GEMINI_API_KEY")
                    ?: System.getenv("GOOGLE_AI_API_KEY") 
                    ?: System.getenv("GENERATIVE_AI_API_KEY")
                    ?: ""
                    
                return if (apiKey.isNotEmpty()) {
                    android.util.Log.d("MainActivity", "🚀 Gemini API key loaded from environment")
                    apiKey
                } else {
                    android.util.Log.w("MainActivity", "⚠️ No Gemini API key found in environment, using simulation mode")
                    ""
                }
            }
            
            @android.webkit.JavascriptInterface
            fun logMessage(message: String) {
                android.util.Log.d("MainActivity", "🤖 JS Log: $message")
            }
        }, "Android")
        
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

        // Read the Shiba.json file from assets
        val shibaJsonContent = try {
            assets.open("models/shiba.json").bufferedReader().use { it.readText() }
        } catch (e: Exception) {
            Log.e("MainActivity", "Error reading shiba.json: ${e.message}")
            "null"
        }
        
        // Read the Happy Unicorn Dog.json file from assets
        val happyUnicornDogJsonContent = try {
            assets.open("models/Happy Unicorn Dog.json").bufferedReader().use { it.readText() }
        } catch (e: Exception) {
            Log.e("MainActivity", "Error reading Happy Unicorn Dog.json: ${e.message}")
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
            padding: 20px 20px 100px 20px;
            z-index: 10;
            position: relative;
            max-width: 1200px;
            margin: 0 auto;
            /* Ensure content doesn't get hidden behind bottom nav */
            padding-bottom: max(100px, calc(env(safe-area-inset-bottom) + 90px));
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

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            60% {
                transform: translateY(-5px);
            }
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

        /* Bottom Navigation Styles - iPhone Style */
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(40px) saturate(150%);
            border-top: 0.5px solid rgba(255, 255, 255, 0.15);
            padding: 8px 0 max(20px, env(safe-area-inset-bottom));
            display: flex;
            justify-content: space-around;
            align-items: center;
            z-index: 10000;
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.6);
            /* Ensure always visible and prevent rolling */
            min-height: 80px;
            width: 100%;
            max-width: 100vw;
            /* Prevent any transform or movement */
            transform: none !important;
            transition: none !important;
            -webkit-backdrop-filter: blur(40px) saturate(150%);
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.2s ease-out;
            text-decoration: none;
            color: rgba(255, 255, 255, 0.6);
            font-family: -apple-system, BlinkMacSystemFont, var(--font-body);
            font-size: 10px;
            font-weight: 500;
            min-width: 64px;
            position: relative;
        }

        .nav-item.active {
            color: var(--bonk-orange);
        }

        .nav-item.active .nav-icon {
            background: var(--bonk-orange);
            color: white;
            transform: scale(1.1);
            box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
        }

        .nav-item:active {
            transform: scale(0.95);
        }

        .nav-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            margin-bottom: 2px;
            transition: all 0.2s ease-out;
            border: none;
        }

        .nav-text {
            font-size: 10px;
            font-weight: 500;
            text-align: center;
            line-height: 1;
        }

        /* Page Container with bottom padding for nav */
        .page {
            display: none;
            animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            padding-bottom: 100px; /* Space for bottom nav */
            min-height: 100vh;
        }

        .page.active {
            display: block;
        }

        @keyframes slideIn {
            from { 
                opacity: 0; 
                transform: translateX(30px);
            }
            to { 
                opacity: 1; 
                transform: translateX(0);
            }
        }

        /* Shiba Animation Container */
        .shiba-companion {
            width: 120px;
            height: 120px;
            margin: 0 auto 20px auto;
            position: relative;
        }

        .shiba-companion.floating {
            animation: shibaFloat 3s ease-in-out infinite;
        }

        @keyframes shibaFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-8px) rotate(2deg); }
            50% { transform: translateY(-12px) rotate(0deg); }
            75% { transform: translateY(-8px) rotate(-2deg); }
        }

        /* Voice Command Interface */
        .voice-interface {
            background: var(--glass-bg);
            backdrop-filter: blur(25px);
            border: 2px solid var(--glass-border);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 20px;
            text-align: center;
            box-shadow: var(--glass-shadow);
        }

        /* Clean Avatar Section */
        .avatar-section {
            text-align: center;
            margin: 20px 0;
            padding: 20px;
        }

        .avatar-header {
            margin-bottom: 25px;
        }

        .avatar-title {
            font-family: var(--font-display);
            font-size: 32px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 8px;
            text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
        }

        .avatar-subtitle {
            font-size: 16px;
            color: var(--text-secondary);
            opacity: 0.9;
        }

        /* Pure Astronaut Dog Container with Voice Integration */
        #astronaut-container {
            width: 100%;
            max-width: 400px;
            height: 300px;
            margin: 30px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            background: var(--glass-bg);
            backdrop-filter: blur(15px);
            border: 1px solid var(--glass-border);
            box-shadow: var(--glass-shadow);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }

        #astronaut-container:hover {
            transform: scale(1.02);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        #astronaut-container.listening {
            border-color: var(--defi-green);
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
            animation: pulse 1.5s ease-in-out infinite;
        }

        #astronaut-animation {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        /* Voice Status integrated into astronaut container */
        .voice-status-integrated {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: var(--text-primary);
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: 500;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            white-space: nowrap;
            transition: all 0.3s ease;
        }

        /* Companion Conversation */
        .companion-conversation {
            margin: 20px;
            text-align: center;
        }

        .companion-conversation .voice-transcript {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 15px;
            padding: 20px;
            color: var(--text-secondary);
            font-size: 14px;
            min-height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            text-align: center;
            backdrop-filter: blur(15px);
        }

        .companion-conversation .gemini-response {
            background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(138, 43, 226, 0.1));
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 15px;
            padding: 20px;
            color: var(--text-primary);
            font-size: 14px;
            line-height: 1.6;
            backdrop-filter: blur(15px);
        }

        /* Companion Controls - 3 buttons in same line */
        .companion-controls {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin: 25px 0;
            width: 100%;
            max-width: 380px;
            margin-left: auto;
            margin-right: auto;
        }

        .companion-controls .action-button {
            flex: 1;
            padding: 12px 16px;
            font-size: 13px;
            border-radius: 15px;
            background: linear-gradient(135deg, var(--bonk-orange), rgba(247, 147, 30, 0.9));
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            min-width: 110px;
            text-align: center;
        }

        .companion-controls .action-button.secondary {
            background: linear-gradient(135deg, var(--cyber-cyan), var(--solana-purple));
        }

        .companion-controls .action-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }

        /* Portfolio Happy Unicorn Dog Section */
        .portfolio-companion-section {
            text-align: center;
            margin: 20px 0;
            padding: 20px;
        }

        .portfolio-companion-header {
            margin-bottom: 25px;
        }

        .companion-title {
            font-family: var(--font-display);
            font-size: 28px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 8px;
            text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
        }

        .companion-subtitle {
            font-size: 14px;
            color: var(--text-secondary);
            opacity: 0.9;
        }

        /* Big Happy Unicorn Dog Container */
        #unicorn-container {
            width: 100%;
            max-width: 400px;
            height: 300px;
            margin: 30px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            background: linear-gradient(135deg, 
                rgba(255, 182, 193, 0.1) 0%,
                rgba(221, 160, 221, 0.1) 50%,
                rgba(173, 216, 230, 0.1) 100%);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 182, 193, 0.3);
            box-shadow: 
                0 8px 32px rgba(31, 38, 135, 0.37),
                0 0 25px rgba(255, 182, 193, 0.2);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }

        #unicorn-container:hover {
            transform: scale(1.02);
            box-shadow: 
                0 12px 40px rgba(31, 38, 135, 0.5),
                0 0 35px rgba(255, 182, 193, 0.4);
        }

        #unicorn-container.analyzing {
            border-color: var(--defi-green);
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
            animation: pulse 1.5s ease-in-out infinite;
        }

        #unicorn-animation {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        /* Unicorn Status integrated */
        .unicorn-status {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 182, 193, 0.9);
            color: #4a4a4a;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: 500;
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
            white-space: nowrap;
            transition: all 0.3s ease;
        }

        /* Unicorn Controls */
        .unicorn-controls {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin: 25px 0;
            width: 100%;
            max-width: 380px;
            margin-left: auto;
            margin-right: auto;
        }

        .unicorn-controls .action-button {
            flex: 1;
            padding: 12px 16px;
            font-size: 13px;
            border-radius: 15px;
            background: linear-gradient(135deg, #ff69b4, #ffc0cb);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #4a4a4a;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            min-width: 110px;
            text-align: center;
        }

        .unicorn-controls .action-button.secondary {
            background: linear-gradient(135deg, #dda0dd, #87ceeb);
        }

        .unicorn-controls .action-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(255, 105, 180, 0.3);
        }

        /* Big Shiba NFT Artist Container (matching Unicorn styling) */
        #shiba-nft-container {
            width: 100%;
            max-width: 400px;
            height: 300px;
            margin: 30px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            background: linear-gradient(135deg, 
                rgba(255, 165, 0, 0.1) 0%,
                rgba(255, 140, 0, 0.1) 50%,
                rgba(255, 69, 0, 0.1) 100%);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 165, 0, 0.3);
            box-shadow: 
                0 8px 32px rgba(31, 38, 135, 0.37),
                0 0 25px rgba(255, 165, 0, 0.2);
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }

        #shiba-nft-container:hover {
            transform: scale(1.02);
            box-shadow: 
                0 12px 40px rgba(31, 38, 135, 0.5),
                0 0 35px rgba(255, 165, 0, 0.4);
        }

        #shiba-nft-container.creating {
            border-color: var(--defi-green);
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
            animation: pulse 1.5s ease-in-out infinite;
        }

        #shiba-nft-animation {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        /* Shiba Artist Status integrated */
        .shiba-artist-status {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 165, 0, 0.9);
            color: #4a4a4a;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: 500;
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
            white-space: nowrap;
            transition: all 0.3s ease;
        }

        /* Shiba Artist Controls (matching Unicorn controls) */
        .shiba-artist-controls {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin: 25px 0;
            width: 100%;
            max-width: 380px;
            margin-left: auto;
            margin-right: auto;
        }

        .shiba-artist-controls .action-button {
            flex: 1;
            padding: 12px 16px;
            font-size: 13px;
            border-radius: 15px;
            background: linear-gradient(135deg, #ff8c00, #ffa500);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            min-width: 110px;
            text-align: center;
        }

        .shiba-artist-controls .action-button.secondary {
            background: linear-gradient(135deg, #ff6347, #ff4500);
        }

        .shiba-artist-controls .action-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(255, 140, 0, 0.3);
        }

        .companion-conversation .gemini-response #geminiText {
            color: var(--text-primary);
            font-weight: 500;
        }

        /* Voice Interface with Astronaut Dog */
        .astronaut-voice-interface {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 30px 0;
        }

        .astronaut-avatar-container {
            position: relative;
            margin-bottom: 20px;
        }

        .astronaut-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--bonk-orange), var(--cyber-cyan));
            padding: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .astronaut-image {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            transition: all 0.3s ease;
        }

        .astronaut-avatar:hover {
            transform: scale(1.1);
            box-shadow: 0 20px 40px rgba(255, 107, 53, 0.4);
        }

        .astronaut-avatar.listening {
            animation: astronautPulse 1.5s infinite;
            box-shadow: 0 0 30px var(--bonk-orange);
        }

        .astronaut-pulse-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 120px;
            height: 120px;
            border: 2px solid var(--bonk-orange);
            border-radius: 50%;
            opacity: 0;
            z-index: -1;
        }

        .astronaut-pulse-ring.active {
            animation: pulseRing 2s infinite;
        }

        @keyframes astronautPulse {
            0%, 100% { 
                transform: scale(1);
                filter: brightness(1);
            }
            50% { 
                transform: scale(1.05);
                filter: brightness(1.2) drop-shadow(0 0 20px var(--bonk-orange));
            }
        }

        @keyframes pulseRing {
            0% {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0.8;
            }
            100% {
                transform: translate(-50%, -50%) scale(1.4);
                opacity: 0;
            }
        }

        .voice-interface-text {
            text-align: center;
            margin-bottom: 20px;
        }

        .voice-interface-text h3 {
            font-family: var(--font-display);
            font-weight: 600;
        }

        .voice-button {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, var(--bonk-orange), var(--cyber-cyan));
            color: white;
            font-size: 32px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 30px rgba(255, 107, 53, 0.3);
            margin: 10px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 15px auto;
        }

        .voice-button:hover {
            transform: scale(1.1);
            box-shadow: 0 12px 40px rgba(255, 107, 53, 0.5);
        }

        .voice-button.listening {
            animation: voicePulse 1.5s infinite;
            background: linear-gradient(135deg, var(--defi-green), var(--cyber-cyan));
        }

        @keyframes voicePulse {
            0%, 100% { transform: scale(1); box-shadow: 0 8px 30px rgba(0, 255, 136, 0.3); }
            50% { transform: scale(1.1); box-shadow: 0 15px 50px rgba(0, 255, 136, 0.6); }
        }

        .voice-status {
            font-family: var(--font-body);
            font-size: 14px;
            color: var(--text-secondary);
            margin-top: 10px;
        }

        .voice-transcript {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 15px;
            margin-top: 15px;
            font-family: var(--font-mono);
            font-size: 13px;
            color: var(--text-primary);
            min-height: 50px;
            text-align: left;
            border: 1px solid var(--glass-border);
        }

        .gemini-response {
            background: linear-gradient(135deg, var(--solana-purple-glow), var(--cyber-cyan-glow));
            border-radius: 12px;
            padding: 15px;
            margin-top: 15px;
            font-family: var(--font-body);
            font-size: 14px;
            color: var(--text-primary);
            border: 1px solid var(--solana-purple);
        }

        /* Page Container */
        .page {
            display: none;
            animation: fadeIn 0.5s ease-in-out;
        }

        .page.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* NFT Creation Page */
        .nft-creator {
            background: var(--glass-bg);
            backdrop-filter: blur(25px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: var(--glass-shadow);
        }

        .nft-form {
            display: grid;
            gap: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .form-label {
            font-family: var(--font-body);
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .form-input {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            padding: 12px 15px;
            color: var(--text-primary);
            font-family: var(--font-body);
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .form-input:focus {
            outline: none;
            border-color: var(--bonk-orange);
            box-shadow: 0 0 0 3px var(--bonk-orange-glow);
        }

        .form-textarea {
            min-height: 100px;
            resize: vertical;
        }

        .nft-preview {
            background: rgba(0, 0, 0, 0.2);
            border: 2px dashed var(--glass-border);
            border-radius: 15px;
            padding: 40px 20px;
            text-align: center;
            color: var(--text-secondary);
            font-family: var(--font-body);
            transition: all 0.3s ease;
        }

        .nft-preview:hover {
            border-color: var(--bonk-orange);
            color: var(--text-primary);
        }

        .create-nft-button {
            background: linear-gradient(135deg, var(--bonk-orange), var(--defi-green));
            border: none;
            border-radius: 15px;
            padding: 15px 30px;
            color: white;
            font-family: var(--font-display);
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 30px rgba(255, 107, 53, 0.3);
        }

        .create-nft-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 40px rgba(255, 107, 53, 0.5);
        }

        /* Trading Page Enhancements */
        .trading-dashboard {
            display: grid;
            gap: 20px;
        }

        .trading-card {
            background: var(--glass-bg);
            backdrop-filter: blur(25px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 25px;
            box-shadow: var(--glass-shadow);
            transition: all 0.3s ease;
        }

        .trading-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--glass-shadow-hover);
            border-color: var(--bonk-orange);
        }

        /* Responsive design for iPhone-style bottom nav */
        @media (max-width: 768px) {
            .main-content {
                flex-direction: column;
            }
            
            .logo-text {
                font-size: 24px;
            }
            
            #app-container {
                padding: 15px;
                padding-bottom: 90px;
            }
            
            .bottom-nav {
                padding: 6px 0 16px 0;
            }
            
            .nav-item {
                padding: 6px 10px;
                min-width: 60px;
            }
            
            .nav-icon {
                width: 30px;
                height: 30px;
                font-size: 15px;
            }
            
            .nav-text {
                font-size: 9px;
            }
            
            .voice-button {
                width: 70px;
                height: 70px;
                font-size: 28px;
            }
            
            .trading-dashboard {
                gap: 15px;
            }
            
            .nft-form {
                gap: 15px;
            }
            
            .shiba-companion {
                width: 100px;
                height: 100px;
            }
        }

        @media (max-width: 480px) {
            .bottom-nav {
                padding: 4px 0 12px 0;
            }
            
            .nav-item {
                padding: 4px 8px;
                min-width: 56px;
            }
            
            .nav-icon {
                width: 28px;
                height: 28px;
                font-size: 14px;
                border-radius: 6px;
            }
            
            .nav-text {
                font-size: 8px;
            }
            
            .voice-interface {
                padding: 20px;
            }
            
            .trading-card {
                padding: 20px;
            }
            
            .nft-creator {
                padding: 20px;
            }
            
            .shiba-companion {
                width: 80px;
                height: 80px;
            }
            
            #app-container {
                padding: 10px;
                padding-bottom: 80px;
            }
        }

        @media (max-width: 360px) {
            .nav-text {
                font-size: 7px;
            }
            
            .nav-icon {
                width: 26px;
                height: 26px;
                font-size: 13px;
            }
            
            .shiba-companion {
                width: 70px;
                height: 70px;
            }
            
            #app-container {
                padding-bottom: 75px;
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
                    <div class="tagline">Bonk-Powered Voice DeFi Space Mission</div>
                </div>
            </div>
            <div class="status-indicator">
                <div class="status-dot"></div>
                <span style="font-size: 12px; font-weight: 500;">Voice AI Ready</span>
            </div>
        </div>

        <!-- Companion AI Page (formerly Voice AI) -->
        <div id="companion-page" class="page active">
            <!-- Clean Astronaut Dog Section -->
            <div class="avatar-section">
                <div class="avatar-header">
                    <div class="avatar-title">🚀 My Bife</div>
                    <div class="avatar-subtitle">Your Voice-Activated DeFi Space Explorer</div>
                </div>
                
                <!-- Pure AstronautDog.lottie Animation with Voice Integration -->
                <div id="astronaut-container" onclick="toggleVoiceRecording()">
                    <div id="astronaut-animation">
                        <div style="color: var(--text-secondary); text-align: center; font-size: 14px;">
                            Loading your space companion...
                        </div>
                    </div>
                    
                    <!-- Voice Status integrated into the container -->
                    <div class="voice-status-integrated" id="voiceStatus">Ready to help</div>
                </div>
                
                <!-- Companion Controls - 3 buttons in same line -->
                <div class="companion-controls">
                    <button class="action-button" onclick="talkToAstronaut()">
                        🗣️ Talk to Dog
                    </button>
                    <button class="action-button secondary" onclick="astronautDance()">
                        💃 Make Dance
                    </button>
                    <button class="action-button" onclick="astronautAnalyze()">
                        🧠 Get Advice
                    </button>
                </div>
                
                <!-- Voice transcript and response integrated -->
                <div class="companion-conversation">
                    <div class="voice-transcript" id="voiceTranscript">
                        Tap your space companion or use "Talk to Dog" to start voice command...
                    </div>
                    
                    <div class="gemini-response" id="geminiResponse" style="display: none;">
                        <div id="geminiText"></div>
                    </div>
                </div>
            </div>

            <!-- Quick Voice Commands -->
            <div class="trading-card">
                <h3 style="color: var(--text-primary); font-family: var(--font-display); margin-bottom: 15px;">
                    ⚡ Quick Voice Commands
                </h3>
                <div style="display: grid; gap: 10px;">
                    <button class="action-button" onclick="executeVoiceCommand('Show my portfolio balance')">
                        "Show my portfolio balance"
                    </button>
                    <button class="action-button secondary" onclick="executeVoiceCommand('Swap 100 USDC to BONK')">
                        "Swap 100 USDC to BONK"
                    </button>
                    <button class="action-button" onclick="executeVoiceCommand('Create an NFT of a space dog')">
                        "Create an NFT of a space dog"
                    </button>
                    <button class="action-button secondary" onclick="executeVoiceCommand('What are the best yield farms?')">
                        "What are the best yield farms?"
                    </button>
                </div>
            </div>
        </div>

        <!-- Trading Page -->
        <div id="trading-page" class="page">
            <!-- Shiba Trading Companion -->
            <div class="trading-card" style="text-align: center; margin-bottom: 20px;">
                <div class="shiba-companion floating" id="shiba-trading">
                    <div style="color: var(--text-secondary); text-align: center; font-size: 12px;">
                        Loading Shiba trader...
                    </div>
                </div>
                <h3 style="color: var(--text-primary); font-family: var(--font-display); margin: 10px 0;">
                    🐕 Shiba Trading Assistant
                </h3>
                <p style="color: var(--text-secondary); font-size: 12px;">
                    Your loyal trading companion watches the markets!
                </p>
            </div>

            <div class="trading-dashboard">
                <!-- Advanced Trading Interface -->
                <div class="trading-card">
                    <h3 style="color: var(--text-primary); font-family: var(--font-display); margin-bottom: 15px;">
                        🚀 Advanced Trading Console
                    </h3>
                    
                    <!-- Swap Interface -->
                    <div class="swap-interface">
                        <div class="swap-title">🔄 Voice-Enhanced Swap</div>
                        
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
                            🎤 Voice Execute Swap
                        </button>
                    </div>
                </div>

                <!-- Yield Farming -->
                <div class="trading-card">
                    <h3 style="color: var(--text-primary); font-family: var(--font-display); margin-bottom: 15px;">
                        🌾 Voice-Controlled Yield Farms
                    </h3>
                    <div style="display: grid; gap: 15px;">
                        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: var(--text-primary); font-weight: 600;">SOL-USDC Pool</div>
                                    <div style="color: var(--text-secondary); font-size: 12px;">Raydium • High Liquidity</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="color: var(--defi-green); font-weight: 700;">18.4% APY</div>
                                    <button class="farm-button" onclick="farmWithVoice('SOL-USDC')">Voice Farm</button>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: var(--text-primary); font-weight: 600;">BONK-SOL Pool</div>
                                    <div style="color: var(--text-secondary); font-size: 12px;">Orca • Community Favorite</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="color: var(--defi-green); font-weight: 700;">24.1% APY</div>
                                    <button class="farm-button" onclick="farmWithVoice('BONK-SOL')">Voice Farm</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- NFT Studio Page -->
        <div id="nft-page" class="page">
            <!-- Shiba NFT Artist Companion Section (matching Portfolio layout) -->
            <div class="portfolio-companion-section">
                <div class="portfolio-companion-header">
                    <div class="companion-title">🎨 Shiba NFT Artist</div>
                    <div class="companion-subtitle">Your creative AI-powered NFT companion</div>
                </div>
                
                <!-- Big Shiba NFT Artist Animation (matching Unicorn container) -->
                <div id="shiba-nft-container" onclick="animateShiba('nft')">
                    <div id="shiba-nft-animation">
                        <div style="color: var(--text-secondary); text-align: center; font-size: 14px;">
                            Loading your creative companion...
                        </div>
                    </div>
                    
                    <!-- Status integrated into the container -->
                    <div class="shiba-artist-status" id="shibaArtistStatus">Ready to create ✨</div>
                </div>
                
                <!-- Shiba Artist Controls (matching Unicorn controls) -->
                <div class="shiba-artist-controls">
                    <button class="action-button" onclick="voiceDescribeNFT()">
                        🎤 Voice Describe
                    </button>
                    <button class="action-button secondary" onclick="generateNFTArt()">
                        🎨 Generate Art
                    </button>
                    <button class="action-button" onclick="createNFT()">
                        ✨ Create NFT
                    </button>
                </div>
            </div>

            <div class="nft-creator">
                <h2 style="color: var(--text-primary); font-family: var(--font-display); margin-bottom: 15px;">
                    🎨 Voice-Powered NFT Studio
                </h2>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    Create NFTs using voice descriptions with AI generation
                </p>
                
                <div class="nft-form">
                    <div class="form-group">
                        <label class="form-label">NFT Name</label>
                        <input type="text" class="form-input" id="nftName" placeholder="e.g., Space Dog Adventures">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Voice Description</label>
                        <div style="display: flex; gap: 10px;">
                            <textarea class="form-input form-textarea" id="nftDescription" 
                                placeholder="Describe your NFT or use voice input..."></textarea>
                            <button class="voice-button" style="width: 50px; height: 50px; font-size: 16px;" 
                                onclick="voiceDescribeNFT()">🎤</button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">AI Art Generation</label>
                        <div class="nft-preview" id="nftPreview">
                            <div style="font-size: 48px; margin-bottom: 15px;">🎨</div>
                            <div>Your AI-generated NFT artwork will appear here</div>
                            <button class="action-button" style="margin-top: 15px;" onclick="generateNFTArt()">
                                Generate with AI
                            </button>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px;">
                        <button class="create-nft-button" onclick="createNFT()" style="flex: 1;">
                            🚀 Create & Mint NFT
                        </button>
                        <button class="create-nft-button" onclick="voiceCreateNFT()" 
                            style="flex: 1; background: linear-gradient(135deg, var(--cyber-cyan), var(--solana-purple));">
                            🎤 Voice Create
                        </button>
                    </div>
                </div>
            </div>

            <!-- NFT Gallery -->
            <div class="trading-card">
                <h3 style="color: var(--text-primary); font-family: var(--font-display); margin-bottom: 15px;">
                    🖼️ Your NFT Collection
                </h3>
                <div id="nftGallery" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <!-- NFTs will be populated here -->
                    <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 10px;">🚀</div>
                        <div style="color: var(--text-primary); font-size: 14px;">Space Dog #001</div>
                        <div style="color: var(--defi-green); font-size: 12px;">0.5 SOL</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Portfolio Page -->
        <div id="portfolio-page" class="page">
            <!-- Happy Unicorn Dog Portfolio Manager -->
            <div class="portfolio-companion-section">
                <div class="portfolio-companion-header">
                    <div class="companion-title">🦄 Happy Unicorn Portfolio Analyst</div>
                    <div class="companion-subtitle">Your magical DeFi investment companion</div>
                </div>
                
                <!-- Big Happy Unicorn Dog Animation -->
                <div id="unicorn-container" onclick="unicornAnalyze()">
                    <div id="unicorn-animation">
                        <div style="color: var(--text-secondary); text-align: center; font-size: 14px;">
                            Loading your magical analyst...
                        </div>
                    </div>
                    
                    <!-- Status integrated into the container -->
                    <div class="unicorn-status" id="unicornStatus">Ready to analyze</div>
                </div>
                
                <!-- Unicorn Controls -->
                <div class="unicorn-controls">
                    <button class="action-button" onclick="unicornRefresh()">
                        🔄 Refresh Data
                    </button>
                    <button class="action-button secondary" onclick="unicornDance()">
                        ✨ Celebrate
                    </button>
                    <button class="action-button" onclick="unicornAnalyze()">
                        📊 AI Analysis
                    </button>
                </div>
            </div>

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

            <!-- Voice Portfolio Actions -->
            <div class="defi-actions">
                <button class="action-button" onclick="voiceRefreshPortfolio()">
                    🎤 Voice Refresh
                </button>
                <button class="action-button secondary" onclick="voiceCheckPrices()">
                    💰 Voice Prices
                </button>
                <button class="action-button" onclick="voiceAnalyzePortfolio()">
                    📊 AI Analysis
                </button>
                <button class="action-button secondary" onclick="voiceRebalance()">
                    ⚖️ Voice Rebalance
                </button>
            </div>
        </div>

        <!-- Settings Page (formerly Astronaut Companion) -->
        <div id="settings-page" class="page">
            <div class="trading-card">
                <h2 style="color: var(--text-primary); font-family: var(--font-display); margin-bottom: 20px;">
                    ⚙️ Wallet & DeFi Settings
                </h2>
                
                <!-- Wallet Settings -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: var(--text-primary); font-family: var(--font-display); margin-bottom: 15px;">
                        💳 Wallet Configuration
                    </h3>
                    <div style="display: grid; gap: 15px;">
                        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: var(--text-primary); font-weight: 600;">Connected Wallet</div>
                                    <div style="color: var(--text-secondary); font-size: 12px;">Phantom • Solana</div>
                                </div>
                                <button class="action-button secondary" onclick="connectWallet()">Connect</button>
                            </div>
                        </div>
                        
                        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: var(--text-primary); font-weight: 600;">Auto-Approve Transactions</div>
                                    <div style="color: var(--text-secondary); font-size: 12px;">For trusted DeFi operations</div>
                                </div>
                                <button class="action-button" onclick="toggleAutoApprove()">Enable</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DeFi Settings -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: var(--text-primary); font-family: var(--font-display); margin-bottom: 15px;">
                        🌾 DeFi Preferences
                    </h3>
                    <div style="display: grid; gap: 15px;">
                        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: var(--text-primary); font-weight: 600;">Slippage Tolerance</div>
                                    <div style="color: var(--text-secondary); font-size: 12px;">Maximum price impact</div>
                                </div>
                                <select style="background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); border-radius: 8px; padding: 8px; color: var(--text-primary);">
                                    <option>0.5%</option>
                                    <option selected>1.0%</option>
                                    <option>2.0%</option>
                                    <option>5.0%</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: var(--text-primary); font-weight: 600;">Gas Priority</div>
                                    <div style="color: var(--text-secondary); font-size: 12px;">Transaction speed preference</div>
                                </div>
                                <select style="background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); border-radius: 8px; padding: 8px; color: var(--text-primary);">
                                    <option>Slow</option>
                                    <option selected>Normal</option>
                                    <option>Fast</option>
                                    <option>Turbo</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Voice Settings -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: var(--text-primary); font-family: var(--font-display); margin-bottom: 15px;">
                        🎤 Voice Assistant Settings
                    </h3>
                    <div style="display: grid; gap: 15px;">
                        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: var(--text-primary); font-weight: 600;">Voice Recognition</div>
                                    <div style="color: var(--text-secondary); font-size: 12px;">Enable voice commands</div>
                                </div>
                                <button class="action-button" onclick="toggleVoice()">Enabled</button>
                            </div>
                        </div>
                        
                        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: var(--text-primary); font-weight: 600;">Gemini AI Integration</div>
                                    <div style="color: var(--text-secondary); font-size: 12px;">Smart command processing</div>
                                </div>
                                <button class="action-button secondary" onclick="configureGemini()">Configure</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Security Settings -->
                <div>
                    <h3 style="color: var(--text-primary); font-family: var(--font-display); margin-bottom: 15px;">
                        🔒 Security & Privacy
                    </h3>
                    <div style="display: grid; gap: 15px;">
                        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: var(--text-primary); font-weight: 600;">Transaction Confirmation</div>
                                    <div style="color: var(--text-secondary); font-size: 12px;">Require manual approval</div>
                                </div>
                                <button class="action-button" onclick="toggleConfirmation()">Required</button>
                            </div>
                        </div>
                        
                        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="color: var(--text-primary); font-weight: 600;">Biometric Lock</div>
                                    <div style="color: var(--text-secondary); font-size: 12px;">Fingerprint/Face ID</div>
                                </div>
                                <button class="action-button secondary" onclick="setupBiometric()">Setup</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Navigation Bar -->
    <nav class="bottom-nav">
        <div class="nav-item active" onclick="showPage('companion')" id="nav-companion">
            <div class="nav-icon">🤖</div>
            <span class="nav-text">Companion</span>
        </div>
        <div class="nav-item" onclick="showPage('trading')" id="nav-trading">
            <div class="nav-icon">💰</div>
            <span class="nav-text">Trading</span>
        </div>
        <div class="nav-item" onclick="showPage('nft')" id="nav-nft">
            <div class="nav-icon">🎨</div>
            <span class="nav-text">NFT Studio</span>
        </div>
        <div class="nav-item" onclick="showPage('portfolio')" id="nav-portfolio">
            <div class="nav-icon">📊</div>
            <span class="nav-text">Portfolio</span>
        </div>
        <div class="nav-item" onclick="showPage('settings')" id="nav-settings">
            <div class="nav-icon">⚙️</div>
            <span class="nav-text">Settings</span>
        </div>
    </nav>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
    <script>
        // Bonk-Powered Voice DeFi Space Mission Control
        let lottieAnimation = null;
        let unicornLottieAnimation = null;
        let isListening = false;
        let recognition = null;
        let lottieLibLoaded = false;
        let animationsPreloaded = false;
        
        // Gemini API Key Management
        let geminiApiKey = null;
        
        // Enhanced Lottie loading with fallback and preloading
        function ensureLottieLoaded() {
            return new Promise((resolve, reject) => {
                if (typeof lottie !== 'undefined' && lottie.loadAnimation) {
                    lottieLibLoaded = true;
                    resolve();
                    return;
                }
                
                // Check for CDN loaded Lottie
                if (window.lottie) {
                    window.lottie = lottie;
                    lottieLibLoaded = true;
                    resolve();
                    return;
                }
                
                // Fallback: Try loading from different CDN
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/lottie-web@5.12.2/build/player/lottie.min.js';
                script.onload = () => {
                    lottieLibLoaded = true;
                    console.log('✅ Lottie library loaded successfully');
                    resolve();
                };
                script.onerror = () => {
                    console.error('❌ Failed to load Lottie library');
                    reject(new Error('Lottie library could not be loaded'));
                };
                document.head.appendChild(script);
            });
        }
        
        // Preload all animations when app starts
        function preloadAnimations() {
            if (animationsPreloaded) return Promise.resolve();
            
            return ensureLottieLoaded().then(() => {
                console.log('🎬 Preloading all Lottie animations...');
                
                // Validate animation data
                const animations = [
                    { name: 'Astronaut Dog', data: astronautDogAnimationData },
                    { name: 'Happy Unicorn Dog', data: happyUnicornDogAnimationData },
                    { name: 'Shiba', data: shibaAnimationData }
                ];
                
                let validAnimations = 0;
                animations.forEach(anim => {
                    if (anim.data && typeof anim.data === 'object' && anim.data.layers) {
                        validAnimations++;
                        console.log('✅ ' + anim.name + ' animation data valid');
                    } else {
                        console.warn('⚠️ ' + anim.name + ' animation data invalid or missing');
                    }
                });
                
                console.log('📊 ' + validAnimations + '/' + animations.length + ' animations ready');
                animationsPreloaded = true;
                return Promise.resolve();
            }).catch(error => {
                console.error('❌ Animation preload failed:', error);
                return Promise.reject(error);
            });
        }
        
        // Initialize API key from Android environment
        function initializeGeminiAPI() {
            try {
                // Try to get API key from Android interface first
                if (typeof Android !== 'undefined' && Android.getGeminiApiKey) {
                    geminiApiKey = Android.getGeminiApiKey();
                }
                
                // Fallback to environment variable pattern
                if (!geminiApiKey || geminiApiKey === 'null') {
                    // Common environment variable names for Gemini API
                    const envPatterns = [
                        'GEMINI_API_KEY',
                        'GOOGLE_GEMINI_API_KEY', 
                        'GOOGLE_AI_API_KEY',
                        'GENERATIVE_AI_API_KEY'
                    ];
                    
                    // Try to detect from common patterns
                    for (const pattern of envPatterns) {
                        if (window[pattern]) {
                            geminiApiKey = window[pattern];
                            break;
                        }
                    }
                }
                
                // Log API key status (safely)
                if (geminiApiKey && geminiApiKey.length > 10) {
                    console.log('🚀 Gemini API initialized successfully');
                    updateVoiceStatus('AI Ready - Gemini Connected');
                } else {
                    console.log('⚠️ Using Gemini simulation mode');
                    updateVoiceStatus('AI Ready - Simulation Mode');
                }
                
            } catch (error) {
                console.error('Error initializing Gemini API:', error);
                geminiApiKey = null;
                updateVoiceStatus('AI Ready - Simulation Mode');
            }
        }

        // Utility function to update voice status
        function updateVoiceStatus(message) {
            const statusElement = document.getElementById('voiceStatus');
            if (statusElement) {
                statusElement.textContent = message;
            }
        }

        // Your authentic AstronautDog.lottie data injected here
        const astronautDogAnimationData = $astronautDogJsonContent;
        
        // Your authentic Shiba.lottie data injected here
        const shibaAnimationData = $shibaJsonContent;
        
        // Your authentic Happy Unicorn Dog.lottie data injected here
        const happyUnicornDogAnimationData = $happyUnicornDogJsonContent;
        
        // Shiba animations for different pages
        let shibaAnimations = {
            trading: null,
            nft: null,
            portfolio: null
        };

        // Navigation System
        function showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            
            // Show selected page
            document.getElementById(pageId + '-page').classList.add('active');
            document.getElementById('nav-' + pageId).classList.add('active');
            
            console.log('🔄 Switched to page:', pageId);
            
            // Initialize page-specific features
            if (pageId === 'companion') {
                initAstronautDogAnimation();
                initVoiceRecognition();
            } else if (pageId === 'trading') {
                initShibaAnimation('trading');
            } else if (pageId === 'nft') {
                initShibaNFTAnimation();
            } else if (pageId === 'portfolio') {
                initUnicornAnimation();
            } else if (pageId === 'settings') {
                // Settings page initialization if needed
                console.log('⚙️ Settings page loaded');
            }
        }

        // Initialize Shiba Animation for different pages
        function initShibaAnimation(pageType) {
            console.log('🐕 Initializing Shiba animation for:', pageType);
            const containerId = 'shiba-' + pageType;
            const container = document.getElementById(containerId);
            
            if (!container) {
                console.error('❌ Shiba container not found for:', pageType);
                return;
            }
            
            if (shibaAnimationData && typeof shibaAnimationData === 'object') {
                console.log('🎉 Loading authentic Shiba animation for:', pageType);
                
                // Clear loading message
                container.innerHTML = '';
                
                // Device performance detection
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                const isHighPerformance = gl && gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096;
                
                // Optimize settings based on device
                const optimizedSettings = {
                    container: container,
                    renderer: isHighPerformance ? 'svg' : 'canvas',
                    loop: true,
                    autoplay: true,
                    animationData: shibaAnimationData,
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid meet',
                        progressiveLoad: true,
                        hideOnTransparent: true,
                        scaleMode: isHighPerformance ? 'noScale' : 'showAll',
                        clearCanvas: !isHighPerformance
                    }
                };
                
                shibaAnimations[pageType] = lottie.loadAnimation(optimizedSettings);
                
                // Adaptive playback speed
                const playbackSpeed = isHighPerformance ? 1.0 : 0.8;
                shibaAnimations[pageType].setSpeed(playbackSpeed);
                
                shibaAnimations[pageType].addEventListener('DOMLoaded', function() {
                    console.log('✅ Shiba animation ready for:', pageType);
                    
                    // Add floating effect
                    container.classList.add('floating');
                    
                    // Page-specific reactions
                    if (pageType === 'trading') {
                        shibaTraderReactions();
                    } else if (pageType === 'nft') {
                        shibaArtistReactions();
                    } else if (pageType === 'portfolio') {
                        shibaAnalystReactions();
                    }
                });
                
            } else {
                console.error('❌ No valid Shiba animation data found');
                container.innerHTML = '<div style="color: var(--text-error); text-align: center; font-size: 12px;">Unable to load Shiba companion</div>';
            }
        }

        // Shiba Trader Reactions
        function shibaTraderReactions() {
            if (!shibaAnimations.trading) return;
            
            setInterval(() => {
                const container = document.getElementById('shiba-trading');
                if (container && Math.random() > 0.7) {
                    // Random trading excitement
                    container.style.filter = 'drop-shadow(0 0 20px var(--defi-green))';
                    setTimeout(() => {
                        container.style.filter = 'none';
                    }, 1000);
                }
            }, 5000);
        }

        // Enhanced Shiba Artist Reactions with status updates
        function shibaArtistReactions() {
            if (!shibaAnimations.nft) return;
            
            setInterval(() => {
                const container = document.getElementById('shiba-nft-container');
                const statusElement = document.getElementById('shibaArtistStatus');
                
                if (container && Math.random() > 0.8) {
                    // Creative inspiration flash
                    container.style.filter = 'drop-shadow(0 0 25px var(--cyber-cyan))';
                    container.style.transform = 'scale(1.1) rotate(5deg)';
                    
                    // Update status during inspiration
                    if (statusElement) {
                        const inspirationMessages = [
                            'Creative spark! ✨',
                            'Artistic vision flowing! 🎨',
                            'NFT inspiration detected! 💡',
                            'Creative energy surging! ⚡'
                        ];
                        const randomMessage = inspirationMessages[Math.floor(Math.random() * inspirationMessages.length)];
                        statusElement.textContent = randomMessage;
                    }
                    
                    setTimeout(() => {
                        container.style.filter = 'none';
                        container.style.transform = 'scale(1) rotate(0deg)';
                        
                        // Reset status
                        if (statusElement) {
                            statusElement.textContent = 'Ready to create ✨';
                        }
                    }, 1200);
                }
            }, 7000);
        }

        // Shiba Portfolio Analyst Reactions
        function shibaAnalystReactions() {
            if (!shibaAnimations.portfolio) return;
            
            setInterval(() => {
                const container = document.getElementById('shiba-portfolio');
                if (container && Math.random() > 0.6) {
                    // Analysis thinking effect
                    container.style.filter = 'drop-shadow(0 0 15px var(--bonk-orange))';
                    setTimeout(() => {
                        container.style.filter = 'none';
                    }, 800);
                }
            }, 4000);
        }

        // Animate specific Shiba based on page
        function animateShiba(pageType) {
            if (pageType === 'nft') {
                // Use the new NFT container
                const container = document.getElementById('shiba-nft-container');
                if (container && shibaAnimations[pageType]) {
                    container.style.transform = 'scale(1.2) rotate(10deg)';
                    container.style.filter = 'drop-shadow(0 0 30px var(--bonk-orange))';
                    setTimeout(() => {
                        container.style.transform = 'scale(1) rotate(0deg)';
                        container.style.filter = 'none';
                    }, 1500);
                }
            } else {
                // Use the original containers for other pages
                const container = document.getElementById('shiba-' + pageType);
                if (container && shibaAnimations[pageType]) {
                    container.style.transform = 'scale(1.2) rotate(10deg)';
                    container.style.filter = 'drop-shadow(0 0 30px var(--bonk-orange))';
                    setTimeout(() => {
                        container.style.transform = 'scale(1) rotate(0deg)';
                        container.style.filter = 'none';
                    }, 1500);
                }
            }
        }

        // Voice Recognition Setup
        function initVoiceRecognition() {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = 'en-US';
                
                recognition.onstart = function() {
                    console.log('🎤 Voice recognition started');
                    isListening = true;
                    updateVoiceUI();
                };
                
                recognition.onresult = function(event) {
                    let transcript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript;
                    }
                    document.getElementById('voiceTranscript').textContent = transcript;
                    
                    if (event.results[event.results.length - 1].isFinal) {
                        processVoiceCommand(transcript);
                    }
                };
                
                recognition.onerror = function(event) {
                    console.error('🚨 Voice recognition error:', event.error);
                    document.getElementById('voiceStatus').textContent = 'Voice error: ' + event.error;
                    isListening = false;
                    updateVoiceUI();
                };
                
                recognition.onend = function() {
                    console.log('🎤 Voice recognition ended');
                    isListening = false;
                    updateVoiceUI();
                };
            } else {
                console.warn('⚠️ Speech recognition not supported');
                document.getElementById('voiceStatus').textContent = 'Voice recognition not supported on this device';
            }
        }

        // Voice UI Updates for Seamless Interface
        function updateVoiceUI() {
            const avatar = document.getElementById('astronautAvatar');
            const pulseRing = document.getElementById('pulseRing');
            const statusOverlay = document.getElementById('voiceStatus');
            
            if (isListening) {
                avatar.classList.add('listening');
                pulseRing.classList.add('active');
                statusOverlay.textContent = 'Listening...';
                statusOverlay.style.color = 'var(--defi-green)';
            } else {
                avatar.classList.remove('listening');
                pulseRing.classList.remove('active');
                statusOverlay.textContent = 'Ready to help';
                statusOverlay.style.color = 'var(--text-secondary)';
            }
        }

        // Toggle Voice Recording
        function toggleVoiceRecording() {
            if (!recognition) {
                document.getElementById('voiceStatus').textContent = 'Voice recognition not available';
                return;
            }
            
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        }

        // Process Voice Commands
        async function processVoiceCommand(transcript) {
            console.log('🗣️ Processing voice command:', transcript);
            document.getElementById('voiceTranscript').textContent = transcript;
            
            // Show Gemini processing
            document.getElementById('geminiResponse').style.display = 'block';
            document.getElementById('geminiText').innerHTML = '🤔 Processing your request...';
            
            // Send to Gemini API
            try {
                const response = await sendToGemini(transcript);
                document.getElementById('geminiText').innerHTML = response;
                
                // Execute the command
                await executeAICommand(transcript, response);
                
            } catch (error) {
                console.error('❌ Gemini API error:', error);
                document.getElementById('geminiText').innerHTML = '❌ Sorry, I encountered an error processing your request.';
            }
        }

        // Send to Gemini API
        async function sendToGemini(prompt) {
            const enhancedPrompt = `
            You are a DeFi trading assistant for a Bonk-powered app. User said: "' + prompt + '"
            
            Context: This is a Solana-based DeFi app with BONK, SOL, and USDC tokens.
            Available actions: portfolio check, token swaps, yield farming, NFT creation, price checking.
            
            Respond helpfully and suggest specific actions the user can take. Keep responses concise and actionable.
            `;
            
            // Use real Gemini API if key is available
            if (geminiApiKey && geminiApiKey.length > 10) {
                try {
                    console.log('🚀 Using real Gemini API');
                    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiApiKey, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: enhancedPrompt
                                }]
                            }]
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const aiResponse = data.candidates[0].content.parts[0].text;
                        return aiResponse;
                    } else {
                        console.error('Gemini API error:', response.status);
                        throw new Error('API request failed');
                    }
                } catch (error) {
                    console.error('❌ Gemini API error:', error);
                    // Fall back to simulated response
                }
            }
            
            // Simulate Gemini API response (fallback or when no API key)
            return new Promise((resolve) => {
                setTimeout(() => {
                    let response = '';
                    const lowerPrompt = prompt.toLowerCase();
                    
                    if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('balance')) {
                        response = '📊 I see you want to check your portfolio! Your current balance is $$12,450.89 with strong BONK holdings. Would you like me to refresh the data or analyze your positions?';
                    } else if (lowerPrompt.includes('swap') || lowerPrompt.includes('trade')) {
                        response = '🔄 Ready to execute a swap! I can help you trade between SOL, BONK, and USDC. Just tell me the amount and tokens you want to exchange.';
                    } else if (lowerPrompt.includes('nft') || lowerPrompt.includes('create')) {
                        response = '🎨 Excellent! I can help you create an NFT. Describe what you want to create and I\'ll generate the artwork and mint it for you.';
                    } else if (lowerPrompt.includes('yield') || lowerPrompt.includes('farm')) {
                        response = '🌾 Great choice! Current best yields: SOL-USDC at 18.4% APY and BONK-SOL at 24.1% APY. Which pool interests you?';
                    } else if (lowerPrompt.includes('price') || lowerPrompt.includes('market')) {
                        response = '💰 Current prices: SOL $$145.67, BONK $$0.00000852, USDC $$1.00. Market is looking bullish for BONK!';
                    } else {
                        response = '🤖 I understand you want to: "' + prompt + '". I can help with trading, portfolio management, NFT creation, and yield farming. What would you like to do first?';
                    }
                    
                    resolve(response);
                }, 1500);
            });
        }

        // Execute AI Commands
        async function executeAICommand(originalCommand, geminiResponse) {
            const command = originalCommand.toLowerCase();
            
            if (command.includes('portfolio') || command.includes('balance')) {
                await new Promise(resolve => setTimeout(resolve, 500));
                showPage('portfolio');
                refreshPortfolio();
                animateShiba('portfolio');
            } else if (command.includes('swap') || command.includes('trade')) {
                showPage('trading');
                animateShiba('trading');
            } else if (command.includes('nft') || command.includes('create')) {
                showPage('nft');
                animateShiba('nft');
                if (command.includes('space dog') || command.includes('dog')) {
                    document.getElementById('nftName').value = 'Space Dog Adventures';
                    document.getElementById('nftDescription').value = originalCommand;
                }
            } else if (command.includes('yield') || command.includes('farm')) {
                showPage('trading');
                animateShiba('trading');
                openYieldFarms();
            }
        }

        // Voice Commands for Quick Actions
        function executeVoiceCommand(command) {
            document.getElementById('voiceTranscript').textContent = command;
            processVoiceCommand(command);
        }

        // NFT Voice Functions
        function voiceDescribeNFT() {
            const statusElement = document.getElementById('shibaArtistStatus');
            if (statusElement) {
                statusElement.textContent = 'Listening for description... 🎤';
            }
            
            if (!recognition) {
                alert('Voice recognition not available');
                if (statusElement) {
                    statusElement.textContent = 'Ready to create ✨';
                }
                return;
            }
            
            recognition.onresult = function(event) {
                const transcript = event.results[event.results.length - 1][0].transcript;
                document.getElementById('nftDescription').value = transcript;
                console.log('🎨 NFT voice description:', transcript);
                
                if (statusElement) {
                    statusElement.textContent = 'Description captured! ✨';
                    setTimeout(() => {
                        statusElement.textContent = 'Ready to create ✨';
                    }, 2000);
                }
            };
            
            recognition.onerror = function() {
                if (statusElement) {
                    statusElement.textContent = 'Voice error - try again';
                    setTimeout(() => {
                        statusElement.textContent = 'Ready to create ✨';
                    }, 2000);
                }
            };
            
            recognition.start();
        }

        function generateNFTArt() {
            const statusElement = document.getElementById('shibaArtistStatus');
            if (statusElement) {
                statusElement.textContent = 'Generating artwork... 🎨';
            }
            
            const description = document.getElementById('nftDescription').value;
            const preview = document.getElementById('nftPreview');
            
            preview.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 15px;">🎨</div>
                <div>Generating AI artwork...</div>
                <div style="margin-top: 10px; color: var(--cyber-cyan);">"' + description + '"</div>
            `;
            
            setTimeout(() => {
                preview.innerHTML = `
                    <div style="font-size: 64px; margin-bottom: 15px;">🚀🐕</div>
                    <div style="color: var(--defi-green);">AI Artwork Generated!</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 10px;">
                        Based on: "' + description + '"
                    </div>
                `;
                
                if (statusElement) {
                    statusElement.textContent = 'Artwork ready! ✨';
                    setTimeout(() => {
                        statusElement.textContent = 'Ready to create ✨';
                    }, 3000);
                }
            }, 2000);
        }

        function createNFT() {
            const statusElement = document.getElementById('shibaArtistStatus');
            if (statusElement) {
                statusElement.textContent = 'Minting NFT... 🔨';
            }
            
            const name = document.getElementById('nftName').value;
            const description = document.getElementById('nftDescription').value;
            
            if (!name || !description) {
                alert('Please fill in NFT name and description');
                if (statusElement) {
                    statusElement.textContent = 'Ready to create ✨';
                }
                return;
            }
            
            console.log('🎨 Creating NFT:', name, description);
            
            // Animate the Shiba NFT artist
            animateShiba('nft');
            
            setTimeout(() => {
                showNotification('NFT Created', 'Successfully minted: ' + name);
                
                if (statusElement) {
                    statusElement.textContent = 'NFT created! 🎉';
                    setTimeout(() => {
                        statusElement.textContent = 'Ready to create ✨';
                    }, 4000);
                }
            }, 1500);
        }

        function voiceCreateNFT() {
            executeVoiceCommand('Create an NFT with the current description');
        }

        // Trading Voice Functions
        function farmWithVoice(pool) {
            executeVoiceCommand('Start farming in ' + pool + ' pool');
            animateShiba('trading');
        }

        // Portfolio Voice Functions
        function voiceRefreshPortfolio() {
            executeVoiceCommand('Refresh my portfolio and show current balances');
            animateShiba('portfolio');
        }

        function voiceCheckPrices() {
            executeVoiceCommand('Check current market prices for all tokens');
            animateShiba('portfolio');
        }

        function voiceAnalyzePortfolio() {
            executeVoiceCommand('Analyze my portfolio performance and give recommendations');
            animateShiba('portfolio');
        }

        function voiceRebalance() {
            executeVoiceCommand('Help me rebalance my portfolio for optimal returns');
            animateShiba('portfolio');
        }

        // Settings Page Functions
        function connectWallet() {
            showStatusMessage("Connecting to Phantom wallet...", "info");
            setTimeout(() => {
                showStatusMessage("Wallet connected successfully! 🎉", "success");
            }, 2000);
        }

        // Astronaut Companion Control Functions
        function talkToAstronaut() {
            toggleVoiceRecording();
        }

        function astronautDance() {
            // Animate the astronaut dog with lights and effects
            const container = document.getElementById('astronaut-animation');
            const avatar = document.getElementById('astronautAvatar');
            
            if (container) {
                // Add spectacular dance effects
                container.style.transform = 'scale(1.2) rotate(15deg)';
                container.style.filter = 'drop-shadow(0 0 30px var(--bonk-orange)) brightness(1.3)';
                avatar.style.filter = 'drop-shadow(0 0 25px var(--cyber-cyan)) saturate(1.5)';
                
                // Reset after animation
                setTimeout(() => {
                    container.style.transform = 'scale(1) rotate(0deg)';
                    container.style.filter = 'none';
                    avatar.style.filter = 'none';
                }, 2000);
                
                showStatusMessage("🕺 Astronaut Dog is dancing in zero gravity!", "success");
            }
        }

        function astronautAnalyze() {
            const tips = [
                "🚀 Consider diversifying your portfolio across different DeFi protocols",
                "💎 BONK is showing strong community support - great for long-term holding",
                "🌾 Yield farming opportunities look promising in the current market",
                "📈 Technical analysis suggests a bullish trend for SOL",
                "🔄 Don't forget to compound your rewards regularly"
            ];
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            showStatusMessage(randomTip, "info");
            
            // Add analysis glow effect
            const avatar = document.getElementById('astronautAvatar');
            if (avatar) {
                avatar.style.filter = 'drop-shadow(0 0 20px var(--defi-green))';
                setTimeout(() => {
                    avatar.style.filter = 'none';
                }, 3000);
            }
        }

        function toggleAutoApprove() {
            const button = event.target;
            if (button.textContent === "Enable") {
                button.textContent = "Disable";
                button.classList.remove("secondary");
                showStatusMessage("Auto-approve enabled ✅", "success");
            } else {
                button.textContent = "Enable";
                button.classList.add("secondary");
                showStatusMessage("Auto-approve disabled 🔒", "info");
            }
        }

        // Happy Unicorn Dog Portfolio Functions
        function unicornDance() {
            // Animate the unicorn with magical effects
            const container = document.getElementById('unicorn-animation');
            
            if (container) {
                // Add magical dance effects
                container.style.transform = 'scale(1.15) rotate(-10deg)';
                container.style.filter = 'drop-shadow(0 0 25px #ff69b4) brightness(1.4)';
                
                // Reset after animation
                setTimeout(() => {
                    container.style.transform = 'scale(1) rotate(0deg)';
                    container.style.filter = 'none';
                }, 2500);
                
                showStatusMessage("🦄✨ Happy Unicorn is dancing with magical rainbow energy!", "success");
            }
        }

        function unicornAnalyze() {
            const portfolioInsights = [
                "🦄 Your portfolio has magical diversification potential!",
                "💖 BONK holdings show strong community love energy",
                "🌈 Consider adding more colorful tokens to your rainbow portfolio",
                "✨ Magic happens when you HODL during market storms",
                "🎪 Your DeFi circus is performing wonderfully!",
                "🦄 Unicorn-level gains detected in your future!",
                "💎 Your diamond hands are sparkling beautifully"
            ];
            const randomInsight = portfolioInsights[Math.floor(Math.random() * portfolioInsights.length)];
            showStatusMessage(randomInsight, "info");
            
            // Add magical analysis glow effect
            const container = document.getElementById('unicorn-container');
            if (container) {
                container.classList.add('analyzing');
                container.style.filter = 'drop-shadow(0 0 20px #ff1493)';
                setTimeout(() => {
                    container.classList.remove('analyzing');
                    container.style.filter = 'none';
                }, 3000);
            }
        }

        function unicornRefresh() {
            showStatusMessage("🦄 Refreshing portfolio with unicorn magic...", "info");
            
            // Add refresh sparkle effect
            const container = document.getElementById('unicorn-animation');
            if (container) {
                container.style.filter = 'drop-shadow(0 0 15px #00ffff) saturate(1.3)';
                setTimeout(() => {
                    container.style.filter = 'none';
                }, 2000);
            }
            
            // Simulate portfolio refresh
            setTimeout(() => {
                showStatusMessage("✨ Portfolio refreshed with magical insights!", "success");
            }, 1500);
        }

        function toggleVoice() {
            const button = event.target;
            if (button.textContent === "Enabled") {
                button.textContent = "Disabled";
                button.classList.add("secondary");
                showStatusMessage("Voice recognition disabled 🔇", "info");
            } else {
                button.textContent = "Enabled";
                button.classList.remove("secondary");
                showStatusMessage("Voice recognition enabled 🎤", "success");
            }
        }

        function configureGemini() {
            showStatusMessage("Opening Gemini AI configuration...", "info");
        }

        function toggleConfirmation() {
            const button = event.target;
            if (button.textContent === "Required") {
                button.textContent = "Optional";
                button.classList.add("secondary");
                showStatusMessage("Manual confirmation optional ⚡", "info");
            } else {
                button.textContent = "Required";
                button.classList.remove("secondary");
                showStatusMessage("Manual confirmation required 🔒", "success");
            }
        }

        function setupBiometric() {
            showStatusMessage("Setting up biometric authentication...", "info");
        }

        // Status message helper for settings
        function showStatusMessage(message, type) {
            const statusDiv = document.createElement('div');
            statusDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ' + (type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 
                           type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                           'rgba(59, 130, 246, 0.9)') + ';
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-size: 14px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
            `;
            statusDiv.textContent = message;
            document.body.appendChild(statusDiv);
            
            setTimeout(() => {
                statusDiv.remove();
            }, 3000);
        }

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
            }
        }

        // Initialize Happy Unicorn Dog Lottie animation with enhanced error handling
        function initUnicornAnimation() {
            console.log('🦄 Initializing Happy Unicorn Dog portfolio companion...');
            const container = document.getElementById('unicorn-animation');
            
            if (!container) {
                console.error('❌ Unicorn animation container not found');
                return;
            }
            
            // Show loading state
            container.innerHTML = '<div style="color: var(--text-secondary); text-align: center; font-size: 14px; padding: 50px;">🦄 Loading your magical analyst...</div>';
            
            ensureLottieLoaded().then(() => {
                if (!happyUnicornDogAnimationData || happyUnicornDogAnimationData === 'null') {
                    throw new Error('Happy Unicorn Dog animation data not found');
                }
                
                console.log('✨ Loading authentic Happy Unicorn Dog animation from assets...');
                
                let animationData;
                try {
                    animationData = typeof happyUnicornDogAnimationData === 'string' ? 
                        JSON.parse(happyUnicornDogAnimationData) : happyUnicornDogAnimationData;
                } catch (parseError) {
                    throw new Error('Invalid Happy Unicorn Dog JSON data');
                }
                
                // Device performance detection
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                const isHighPerformance = gl && gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096;
                const deviceMemory = navigator.deviceMemory || 4;
                
                console.log('📱 Device performance:', isHighPerformance ? 'High' : 'Standard');
                console.log('💾 Device memory:', deviceMemory + 'GB');
                
                // Clear loading message
                container.innerHTML = '';
                
                // Optimize settings based on device with magical enhancements
                const optimizedSettings = {
                    container: container,
                    renderer: isHighPerformance ? 'svg' : 'canvas',
                    loop: true,
                    autoplay: true,
                    animationData: animationData,
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid meet',
                        progressiveLoad: true,
                        hideOnTransparent: true,
                        scaleMode: isHighPerformance ? 'noScale' : 'showAll',
                        clearCanvas: !isHighPerformance
                    }
                };
                
                // Destroy existing animation if present
                if (unicornLottieAnimation) {
                    unicornLottieAnimation.destroy();
                    unicornLottieAnimation = null;
                }
                
                unicornLottieAnimation = lottie.loadAnimation(optimizedSettings);
                
                // Adaptive playback speed with magical touch
                const playbackSpeed = isHighPerformance && deviceMemory >= 6 ? 1.2 : 0.9;
                unicornLottieAnimation.setSpeed(playbackSpeed);
                
                unicornLottieAnimation.addEventListener('DOMLoaded', function() {
                    console.log('✅ Happy Unicorn Dog portfolio companion ready!');
                    
                    // Update status
                    const statusElement = document.getElementById('unicornStatus');
                    if (statusElement) {
                        statusElement.textContent = 'Ready to analyze ✨';
                    }
                    
                    // Add magical floating effect
                    setInterval(() => {
                        if (unicornLottieAnimation && container) {
                            const magicalFloat = Math.sin(Date.now() / 1200) * 8;
                            const sparkleRotation = Math.sin(Date.now() / 2000) * 3;
                            container.style.transform = 'translateY(' + magicalFloat + 'px) rotate(' + sparkleRotation + 'deg)';
                        }
                    }, 60);
                });
                
                unicornLottieAnimation.addEventListener('loopComplete', function() {
                    // Add sparkle effect on loop complete
                    if (Math.random() > 0.7) {
                        container.style.filter = 'drop-shadow(0 0 15px #ff69b4)';
                        setTimeout(() => {
                            container.style.filter = 'none';
                        }, 800);
                    }
                });
                
                unicornLottieAnimation.addEventListener('data_failed', function() {
                    console.error('❌ Unicorn animation data failed to load');
                    showFallbackUnicorn(container);
                });
                
            }).catch(error => {
                console.error('❌ Failed to initialize unicorn animation:', error);
                showFallbackUnicorn(container);
            });
        }
        
        // Fallback unicorn display when animation fails
        function showFallbackUnicorn(container) {
            container.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--text-primary);
                    text-align: center;
                    padding: 20px;
                ">
                    <div style="font-size: 60px; margin-bottom: 15px; animation: bounce 2s infinite;">🦄</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Happy Unicorn</div>
                    <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Portfolio Analyst</div>
                    <div style="font-size: 12px; color: var(--text-secondary); opacity: 0.7;">
                        Using fallback display
                    </div>
                </div>
            `;
            
            // Update status
            const statusElement = document.getElementById('unicornStatus');
            if (statusElement) {
                statusElement.textContent = 'Ready to analyze ⚡';
            }
        }

        // Initialize Shiba NFT Artist Animation (matching Portfolio structure)
        function initShibaNFTAnimation() {
            console.log('🎨 Initializing Shiba NFT Artist...');
            const container = document.getElementById('shiba-nft-animation');
            
            if (!container) {
                console.error('❌ Shiba NFT animation container not found');
                return;
            }
            
            // Show loading state
            container.innerHTML = '<div style="color: var(--text-secondary); text-align: center; font-size: 14px; padding: 50px;">🎨 Loading your creative companion...</div>';
            
            ensureLottieLoaded().then(() => {
                if (!shibaAnimationData || shibaAnimationData === 'null') {
                    throw new Error('Shiba animation data not found');
                }
                
                console.log('✨ Loading authentic Shiba NFT Artist animation...');
                
                let animationData;
                try {
                    animationData = typeof shibaAnimationData === 'string' ? 
                        JSON.parse(shibaAnimationData) : shibaAnimationData;
                } catch (parseError) {
                    throw new Error('Invalid Shiba JSON data');
                }
                
                // Device performance detection
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                const isHighPerformance = gl && gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096;
                
                // Clear loading message
                container.innerHTML = '';
                
                // Optimize settings based on device
                const optimizedSettings = {
                    container: container,
                    renderer: isHighPerformance ? 'svg' : 'canvas',
                    loop: true,
                    autoplay: true,
                    animationData: animationData,
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid meet',
                        progressiveLoad: true,
                        hideOnTransparent: true,
                        scaleMode: isHighPerformance ? 'noScale' : 'showAll',
                        clearCanvas: !isHighPerformance
                    }
                };
                
                // Destroy existing animation if present
                if (shibaAnimations.nft) {
                    shibaAnimations.nft.destroy();
                    shibaAnimations.nft = null;
                }
                
                shibaAnimations.nft = lottie.loadAnimation(optimizedSettings);
                
                // Standard playback speed
                shibaAnimations.nft.setSpeed(1.0);
                
                shibaAnimations.nft.addEventListener('DOMLoaded', function() {
                    console.log('✅ Shiba NFT Artist ready!');
                    
                    // Update status
                    const statusElement = document.getElementById('shibaArtistStatus');
                    if (statusElement) {
                        statusElement.textContent = 'Ready to create ✨';
                    }
                    
                    // Add creative floating effect
                    setInterval(() => {
                        if (shibaAnimations.nft && container) {
                            const creativeFloat = Math.sin(Date.now() / 1500) * 6;
                            const artisticRotation = Math.sin(Date.now() / 2500) * 2;
                            container.style.transform = 'translateY(' + creativeFloat + 'px) rotate(' + artisticRotation + 'deg)';
                        }
                    }, 50);
                    
                    // Start creative inspiration moments
                    shibaArtistReactions();
                });
                
                shibaAnimations.nft.addEventListener('data_failed', function() {
                    console.error('❌ Shiba NFT animation failed to load');
                    showFallbackShiba(container);
                });
                
            }).catch(error => {
                console.error('❌ Failed to initialize Shiba NFT animation:', error);
                showFallbackShiba(container);
            });
        }
        
        // Simple fallback Shiba display when animation fails
        function showFallbackShiba(container) {
            container.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--text-primary);
                    text-align: center;
                    padding: 20px;
                ">
                    <div style="font-size: 60px; margin-bottom: 15px;">🐕</div>
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Shiba NFT Artist</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">Creative Companion</div>
                </div>
            `;
            
            const statusElement = document.getElementById('shibaArtistStatus');
            if (statusElement) {
                statusElement.textContent = 'Ready to create ✨';
            }
        }

        // Perfect DeFi Functions
        function refreshPortfolio() {
            console.log('📊 Refreshing portfolio data...');
            
            // Animate the appropriate companion based on current page
            const currentPage = document.querySelector('.page.active').id;
            if (currentPage === 'companion-page') {
                // Animate astronaut dog on companion page
                const container = document.getElementById('astronaut-animation');
                if (container) {
                    container.style.transform = 'scale(1.1) rotate(5deg)';
                    container.style.filter = 'drop-shadow(0 0 30px var(--bonk-orange))';
                    setTimeout(() => {
                        container.style.transform = 'scale(1) rotate(0deg)';
                        container.style.filter = 'none';
                    }, 1000);
                }
            } else if (currentPage === 'portfolio-page') {
                animateShiba('portfolio');
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
            
            // Animate the current page's Shiba companion instead
            const currentPage = document.querySelector('.page.active').id;
            if (currentPage === 'trading-page') {
                animateShiba('trading');
            }
            
            showNotification('Swap Executed', 'Successfully swapped ' + fromAmount + ' ' + fromToken + ' for ' + toAmount + ' ' + toToken);
            
            // Update portfolio after swap
            setTimeout(refreshPortfolio, 1000);
        }

        function showNotification(title, message) {
            console.log('🚀 ' + title + ': ' + message);
            
            // Update the header status instead
            const statusElement = document.querySelector('.status-indicator span');
            if (statusElement) {
                statusElement.textContent = title;
                setTimeout(() => {
                    statusElement.textContent = 'Voice AI Ready';
                }, 3000);
            }
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
            console.log('🚀 Initializing Bonk-Powered Voice DeFi Space Mission...');
            
            // Preload all animations first
            preloadAnimations().then(() => {
                console.log('🎬 Animations preloaded successfully');
                
                // Create visual effects
                createParticles();
                
                // Initialize voice recognition
                initVoiceRecognition();
                
                // Initialize Astronaut Dog animation (only when on astronaut page)
                if (document.getElementById('astronaut-page').classList.contains('active')) {
                    initAstronautDogAnimation();
                }
                
                // Initialize Happy Unicorn Dog animation (only when on portfolio page)
                if (document.getElementById('portfolio-page').classList.contains('active')) {
                    initUnicornAnimation();
                }
                
                // Initialize swap calculator
                calculateSwap();
                
                console.log('✅ Bife Voice DeFi Space Mission ready!');
            }).catch(error => {
                console.warn('⚠️ Animation preload failed, continuing with basic initialization:', error);
                
                // Continue with basic initialization even if animations fail
                createParticles();
                initVoiceRecognition();
                calculateSwap();
                
                console.log('✅ Bife Voice DeFi Space Mission ready (fallback mode)!');
            });
        }

        // Start when page loads
        window.addEventListener('load', () => {
            console.log('🚀 Bonk-Powered Voice DeFi Space Mission starting...');
            
            // Initialize Gemini API first
            initializeGeminiAPI();
            
            // Then initialize the app
            init();
        });

        console.log('🚀 Voice DeFi Space Mission Control system loaded!');
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
