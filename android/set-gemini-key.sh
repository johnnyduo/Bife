#!/bin/bash

# Bife - Set Gemini API Key Environment Variable
# Usage: ./set-gemini-key.sh YOUR_ACTUAL_API_KEY

if [ -z "$1" ]; then
    echo "🚀 Bife - Gemini API Key Setup"
    echo ""
    echo "Usage: ./set-gemini-key.sh YOUR_ACTUAL_API_KEY"
    echo ""
    echo "Get your Gemini API key from: https://aistudio.google.com/app/apikey"
    echo ""
    echo "Current status:"
    if [ -n "$GEMINI_API_KEY" ]; then
        echo "✅ GEMINI_API_KEY is set (length: ${#GEMINI_API_KEY} characters)"
    else
        echo "❌ GEMINI_API_KEY is not set"
    fi
    exit 1
fi

API_KEY="$1"

# Validate API key format (basic check)
if [[ ${#API_KEY} -lt 20 ]]; then
    echo "❌ API key seems too short. Please check your key."
    exit 1
fi

# Export the environment variable
export GEMINI_API_KEY="$API_KEY"

echo "🚀 Gemini API key set successfully!"
echo "✅ GEMINI_API_KEY is now set (length: ${#GEMINI_API_KEY} characters)"
echo ""
echo "Now rebuild and run the app:"
echo "  ./gradlew assembleDebug"
echo "  adb install -r app/build/outputs/apk/debug/app-debug.apk"
echo "  adb shell am start -n com.bife/.MainActivity"
echo ""
echo "The app will now use real Gemini AI instead of simulation mode!"
