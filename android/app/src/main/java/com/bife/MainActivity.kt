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
        
        // Copy GLB file to accessible location and create Three.js viewer
        
        // Read the shiba.json file from assets
        val shibaJsonContent = try {
            assets.open("models/shiba.json").bufferedReader().use { it.readText() }
        } catch (e: Exception) {
            Log.e("MainActivity", "Error reading shiba.json: ${e.message}")
            "null"
        }
        
        val htmlContent = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Shiba.lottie Animation Viewer</title>
    <style>
        * { 
            margin: 0; padding: 0; box-sizing: border-box;
            /* Performance optimizations */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            -webkit-tap-highlight-color: transparent;
        }
        body { 
            background: linear-gradient(135deg, #000000, #1a1a1a);
            color: #fff; font-family: Arial, sans-serif; 
            height: 100vh; overflow: hidden;
            display: flex; flex-direction: column;
            justify-content: center; align-items: center;
            /* Hardware acceleration */
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }
        #container { 
            width: 95vw; height: 90vh;
            border: 4px solid #D2691E; border-radius: 20px;
            box-shadow: 0 0 40px rgba(210,105,30,0.8), inset 0 0 20px rgba(210,105,30,0.2);
            background: radial-gradient(circle, #111, #000);
            position: relative;
        }
        #info {
            position: absolute; top: 15px; left: 15px;
            background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,20,20,0.9));
            padding: 18px; border-radius: 12px;
            border: 2px solid #D2691E; color: #F4A460; font-size: 13px;
            box-shadow: 0 0 20px rgba(210,105,30,0.4);
            backdrop-filter: blur(10px); z-index: 1000;
        }
        #status {
            position: absolute; bottom: 15px; left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,20,20,0.9));
            padding: 18px 25px; border-radius: 12px;
            border: 2px solid #D2691E; color: #D2691E; 
            text-align: center; font-weight: bold;
            box-shadow: 0 0 20px rgba(210,105,30,0.4);
            backdrop-filter: blur(10px); z-index: 1000;
        }
        .glow { animation: glow 2s ease-in-out infinite alternate; }
        @keyframes glow {
            from { text-shadow: 0 0 5px #D2691E; }
            to { text-shadow: 0 0 15px #D2691E, 0 0 25px #D2691E; }
        }
        #lottie-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #shiba-svg-animation {
            width: 80%;
            height: 80%;
            max-width: 600px;
            max-height: 600px;
            display: flex;
            justify-content: center;
            align-items: center;
            /* Performance optimizations */
            will-change: transform;
            transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            -webkit-transform: translateZ(0);
            -webkit-perspective: 1000;
            /* Prevent user interaction for smoother performance */
            pointer-events: none;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
        }
        #shiba-svg-animation svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 0 10px rgba(210,105,30,0.3));
            /* Additional optimizations */
            shape-rendering: optimizeSpeed;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
        }
    </style>
</head>
<body>
    <div id="info">
        <div>🐕 <strong>Your Shiba.lottie Animation</strong></div>
        <div>📱 Touch to interact</div>
        <div>✨ Loading Your Actual Lottie File</div>
        <div>🎯 Vector-based Animation</div>
        <div>🔥 Real-time animation rendering</div>
    </div>
    
    <div id="container">
        <div id="lottie-container">
            <div id="shiba-svg-animation">
                <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                    <!-- Shiba Body -->
                    <ellipse cx="200" cy="250" rx="80" ry="40" fill="#D2691E" class="shiba-body">
                        <animateTransform attributeName="transform" type="scale" values="1,1;1.05,0.95;1,1" dur="2s" repeatCount="indefinite"/>
                    </ellipse>
                    
                    <!-- Shiba Head -->
                    <circle cx="200" cy="180" r="60" fill="#F4A460" class="shiba-head">
                        <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    
                    <!-- Left Ear -->
                    <ellipse cx="170" cy="140" rx="15" ry="25" fill="#CD853F" class="shiba-ear-left">
                        <animateTransform attributeName="transform" type="rotate" values="-10 170 140;-15 170 140;-10 170 140" dur="3s" repeatCount="indefinite"/>
                    </ellipse>
                    
                    <!-- Right Ear -->
                    <ellipse cx="230" cy="140" rx="15" ry="25" fill="#CD853F" class="shiba-ear-right">
                        <animateTransform attributeName="transform" type="rotate" values="10 230 140;15 230 140;10 230 140" dur="3s" repeatCount="indefinite"/>
                    </ellipse>
                    
                    <!-- Left Eye -->
                    <circle cx="185" cy="170" r="6" fill="#000"/>
                    
                    <!-- Right Eye -->
                    <circle cx="215" cy="170" r="6" fill="#000"/>
                    
                    <!-- Nose -->
                    <circle cx="200" cy="190" r="4" fill="#000"/>
                    
                    <!-- Mouth -->
                    <path d="M 185 205 Q 200 215 215 205" stroke="#000" stroke-width="2" fill="none">
                        <animate attributeName="d" values="M 185 205 Q 200 215 215 205;M 185 205 Q 200 220 215 205;M 185 205 Q 200 215 215 205" dur="4s" repeatCount="indefinite"/>
                    </path>
                    
                    <!-- Tail -->
                    <path d="M 120 250 Q 100 220 110 190 Q 120 200 130 220" stroke="#DAA520" stroke-width="12" fill="none" stroke-linecap="round">
                        <animateTransform attributeName="transform" type="rotate" values="0 120 250;10 120 250;-5 120 250;0 120 250" dur="1.5s" repeatCount="indefinite"/>
                    </path>
                    
                    <!-- Front Left Leg -->
                    <rect x="160" y="280" width="12" height="40" fill="#A0522D" rx="6"/>
                    
                    <!-- Front Right Leg -->
                    <rect x="185" y="280" width="12" height="40" fill="#A0522D" rx="6"/>
                    
                    <!-- Back Left Leg -->
                    <rect x="215" y="280" width="12" height="40" fill="#A0522D" rx="6"/>
                    
                    <!-- Back Right Leg -->
                    <rect x="240" y="280" width="12" height="40" fill="#A0522D" rx="6"/>
                    
                    <!-- Paws -->
                    <circle cx="166" cy="325" r="8" fill="#8B4513"/>
                    <circle cx="191" cy="325" r="8" fill="#8B4513"/>
                    <circle cx="221" cy="325" r="8" fill="#8B4513"/>
                    <circle cx="246" cy="325" r="8" fill="#8B4513"/>
                    
                    <!-- Floating Hearts -->
                    <text x="120" y="120" font-size="20" fill="#FF69B4" class="floating-heart">💖
                        <animateTransform attributeName="transform" type="translate" values="0,0;10,-20;0,0" dur="3s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/>
                    </text>
                    
                    <text x="280" y="140" font-size="16" fill="#FF1493" class="floating-heart">💕
                        <animateTransform attributeName="transform" type="translate" values="0,0;-15,-25;0,0" dur="4s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite"/>
                    </text>
                </svg>
            </div>
        </div>
    </div>
    
    <div id="status" class="glow">🌟 Your Shiba.lottie is Loading! 🌟</div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
    <script>
        // Lottie Web Animation Setup
        let lottieAnimation = null;
        
        // Your shiba.json data is injected here
        const shibaAnimationData = $shibaJsonContent;
        
        function init() {
            console.log('🔍 Starting to load your shiba.json data...');
            const container = document.getElementById('shiba-svg-animation');
            
            // Check if we have valid animation data
            if (shibaAnimationData && typeof shibaAnimationData === 'object') {
                console.log('🎉 Successfully loaded your shiba.json data!');
                console.log('📊 Animation data size:', JSON.stringify(shibaAnimationData).length, 'characters');
                
                // Clear the placeholder SVG and load your Lottie animation
                container.innerHTML = '';
                
                // Device performance detection for optimization
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                const isHighPerformance = gl && gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096;
                const deviceMemory = navigator.deviceMemory || 4; // Default to 4GB if unknown
                
                console.log('📱 Device performance:', isHighPerformance ? 'High' : 'Standard');
                console.log('💾 Device memory:', deviceMemory + 'GB');
                
                // Optimize settings based on device capabilities
                const optimizedSettings = {
                    container: container,
                    renderer: isHighPerformance ? 'svg' : 'canvas', // Use canvas on lower-end devices
                    loop: true,
                    autoplay: true,
                    animationData: shibaAnimationData,
                    // Performance optimizations
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid meet',
                        progressiveLoad: true,
                        hideOnTransparent: true,
                        // Reduce quality on lower-end devices
                        scaleMode: isHighPerformance ? 'noScale' : 'showAll',
                        clearCanvas: !isHighPerformance
                    }
                };
                
                lottieAnimation = lottie.loadAnimation(optimizedSettings);
                
                // Set optimal playback speed based on device performance
                const playbackSpeed = isHighPerformance && deviceMemory >= 6 ? 1.0 : 0.8;
                lottieAnimation.setSpeed(playbackSpeed);
                
                lottieAnimation.addEventListener('DOMLoaded', function() {
                    console.log('✅ Your optimized Lottie animation is ready!');
                    console.log('⚡ Playback speed:', playbackSpeed + 'x');
                    
                    document.getElementById('status').innerHTML = '🌟 Your Real Shiba Lottie is Ready! 🌟';
                    document.getElementById('info').innerHTML = 
                        '<div>🐕 <strong>Your Actual Shiba Lottie Animation</strong></div><div>⚡ Optimized for your device</div><div>✨ Real Lottie File Loaded!</div><div>🎯 Smooth Vector Animation</div><div>🔥 Auto-optimized performance</div>';
                });
                
                // Performance monitoring and auto-adjustment
                let frameCount = 0;
                let lastTime = performance.now();
                
                lottieAnimation.addEventListener('enterFrame', function() {
                    frameCount++;
                    if (frameCount % 60 === 0) { // Check every 60 frames
                        const currentTime = performance.now();
                        const fps = 60000 / (currentTime - lastTime);
                        lastTime = currentTime;
                        
                        // Auto-adjust if performance drops
                        if (fps < 25 && playbackSpeed > 0.6) {
                            const newSpeed = Math.max(0.6, playbackSpeed - 0.1);
                            lottieAnimation.setSpeed(newSpeed);
                            console.log('📉 Performance adjusted: ' + newSpeed + 'x speed');
                        }
                    }
                });
            } else {
                console.error('❌ No valid animation data found');
                document.getElementById('status').innerHTML = '❌ Using SVG Placeholder Shiba';
                document.getElementById('info').innerHTML = 
                    '<div>🐕 <strong>SVG Placeholder Shiba</strong></div><div>📁 Could not load shiba.json</div><div>✨ Using animated SVG instead</div><div>📱 Touch to interact</div>';
            }
        }
        
        // Initialize everything when page loads
        window.addEventListener('load', () => {
            console.log('🐕 Starting Shiba Lottie viewer...');
            init();
        });
        
        console.log('🐕 Shiba Lottie viewer script loaded!');
    </script>
</body>
</html>
        """
        
        Log.d("MainActivity", "Loading your premium Shiba.lottie viewer...")
        webView.loadDataWithBaseURL("file:///android_asset/", htmlContent, "text/html", "UTF-8", null)
        
        setContentView(webView)
        Log.d("MainActivity", "Your premium Shiba.lottie viewer is ready!")
    }
}
