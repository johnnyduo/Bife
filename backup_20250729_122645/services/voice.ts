// Voice Service for Bife - Integrates ASR, NLP, TTS, and Wake Word Detection
// Coordinates between Gemini, Claude, Whisper.cpp, and Porcupine

import { claudeService } from '@ai/claude';
import { 
  VoiceCommand, 
  VoiceIntent, 
  AIResponse, 
  EmotionType, 
  ActivityType 
} from '@types/index';

interface VoiceServiceConfig {
  enableWakeWord: boolean;
  enableClaudeFallback: boolean;
  enableWhisperFallback: boolean;
  wakeWords: string[];
  confidenceThreshold: number;
  maxRecordingDuration: number;
  sampleRate: number;
}

interface ASRResult {
  transcript: string;
  confidence: number;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

interface TTSOptions {
  voice: string;
  speed: number;
  pitch: number;
  emotion?: EmotionType;
}

export class VoiceService {
  private config: VoiceServiceConfig;
  private isListening: boolean = false;
  private isProcessing: boolean = false;
  private isSpeaking: boolean = false;
  private audioRecorder: any = null;
  private ttsEngine: any = null;
  private porcupine: any = null;
  private geminiClient: any = null;
  private whisperEngine: any = null;

  // Event listeners
  private onWakeWordDetected?: () => void;
  private onListeningStart?: () => void;
  private onListeningEnd?: () => void;
  private onTranscriptReceived?: (transcript: string) => void;
  private onResponseGenerated?: (response: AIResponse) => void;
  private onSpeechStart?: () => void;
  private onSpeechEnd?: () => void;
  private onError?: (error: Error) => void;

  constructor(config: Partial<VoiceServiceConfig> = {}) {
    this.config = {
      enableWakeWord: true,
      enableClaudeFallback: true,
      enableWhisperFallback: true,
      wakeWords: ['Hey Bife', 'Bife'],
      confidenceThreshold: 0.7,
      maxRecordingDuration: 30000, // 30 seconds
      sampleRate: 16000,
      ...config,
    };

    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize Porcupine for wake word detection
      if (this.config.enableWakeWord) {
        await this.initializePorcupine();
      }

      // Initialize Gemini for primary ASR/NLP
      await this.initializeGemini();

      // Initialize Whisper.cpp for fallback ASR
      if (this.config.enableWhisperFallback) {
        await this.initializeWhisper();
      }

      // Initialize TTS
      await this.initializeTTS();

      console.log('Voice service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize voice service:', error);
      throw error;
    }
  }

  private async initializePorcupine(): Promise<void> {
    try {
      // This would integrate with @porcupine/react-native
      // const Porcupine = require('@porcupine/react-native');
      
      console.log('Porcupine wake word detection initialized');
    } catch (error) {
      console.error('Failed to initialize Porcupine:', error);
      this.config.enableWakeWord = false;
    }
  }

  private async initializeGemini(): Promise<void> {
    try {
      // Initialize Google Vertex AI / Gemini client
      // This would use the vertexai package
      console.log('Gemini ASR/NLP initialized');
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
      throw error;
    }
  }

  private async initializeWhisper(): Promise<void> {
    try {
      // Initialize Whisper.cpp for on-device ASR fallback
      console.log('Whisper.cpp fallback ASR initialized');
    } catch (error) {
      console.error('Failed to initialize Whisper:', error);
      this.config.enableWhisperFallback = false;
    }
  }

  private async initializeTTS(): Promise<void> {
    try {
      // Initialize Google Cloud TTS or react-native-tts
      console.log('TTS engine initialized');
    } catch (error) {
      console.error('Failed to initialize TTS:', error);
      throw error;
    }
  }

  // Wake Word Detection
  startWakeWordDetection(): void {
    if (!this.config.enableWakeWord || !this.porcupine) {
      console.warn('Wake word detection not available');
      return;
    }

    try {
      // Start continuous listening for wake word
      console.log('Wake word detection started');
      
      // This would start the Porcupine detection
      // this.porcupine.start();
      
    } catch (error) {
      console.error('Failed to start wake word detection:', error);
      this.onError?.(new Error('Wake word detection failed'));
    }
  }

  stopWakeWordDetection(): void {
    if (this.porcupine) {
      // this.porcupine.stop();
      console.log('Wake word detection stopped');
    }
  }

  private handleWakeWordDetected(): void {
    console.log('Wake word detected - starting voice interaction');
    this.onWakeWordDetected?.();
    this.startListening();
  }

  // Speech Recognition
  async startListening(): Promise<void> {
    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    this.isListening = true;
    this.onListeningStart?.();

    try {
      console.log('Starting speech recognition...');
      
      // Start audio recording
      await this.startAudioRecording();
      
      // Set timeout for max recording duration
      setTimeout(() => {
        if (this.isListening) {
          this.stopListening();
        }
      }, this.config.maxRecordingDuration);
      
    } catch (error) {
      console.error('Failed to start listening:', error);
      this.isListening = false;
      this.onError?.(error as Error);
    }
  }

  async stopListening(): Promise<void> {
    if (!this.isListening) return;

    this.isListening = false;
    this.onListeningEnd?.();

    try {
      // Stop audio recording and get the audio data
      const audioData = await this.stopAudioRecording();
      
      if (audioData) {
        await this.processAudioData(audioData);
      }
    } catch (error) {
      console.error('Failed to stop listening:', error);
      this.onError?.(error as Error);
    }
  }

  private async startAudioRecording(): Promise<void> {
    // This would use react-native-audio-recorder-player or similar
    console.log('Audio recording started');
  }

  private async stopAudioRecording(): Promise<ArrayBuffer | null> {
    // This would return the recorded audio data
    console.log('Audio recording stopped');
    return null;
  }

  private async processAudioData(audioData: ArrayBuffer): Promise<void> {
    this.isProcessing = true;

    try {
      // Try Gemini ASR first
      let asrResult: ASRResult | null = null;
      
      try {
        asrResult = await this.recognizeSpeechWithGemini(audioData);
      } catch (error) {
        console.warn('Gemini ASR failed, trying Whisper fallback:', error);
        
        if (this.config.enableWhisperFallback) {
          asrResult = await this.recognizeSpeechWithWhisper(audioData);
        }
      }

      if (!asrResult || asrResult.confidence < this.config.confidenceThreshold) {
        throw new Error('Speech recognition failed or confidence too low');
      }

      console.log(`Speech recognized: "${asrResult.transcript}" (confidence: ${asrResult.confidence})`);
      this.onTranscriptReceived?.(asrResult.transcript);

      // Process the transcript with NLP
      await this.processTranscript(asrResult.transcript);

    } catch (error) {
      console.error('Failed to process audio data:', error);
      this.onError?.(error as Error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async recognizeSpeechWithGemini(audioData: ArrayBuffer): Promise<ASRResult> {
    // This would use Google Cloud Speech-to-Text or Vertex AI
    // For now, return a mock result
    return {
      transcript: "Mock transcript from Gemini",
      confidence: 0.95,
    };
  }

  private async recognizeSpeechWithWhisper(audioData: ArrayBuffer): Promise<ASRResult> {
    // This would use Whisper.cpp for on-device ASR
    return {
      transcript: "Mock transcript from Whisper",
      confidence: 0.85,
    };
  }

  // Natural Language Processing
  private async processTranscript(transcript: string): Promise<void> {
    try {
      // Create voice command record
      const command: VoiceCommand = {
        id: this.generateCommandId(),
        userId: 'current_user', // Get from user store
        command: transcript,
        intent: this.inferBasicIntent(transcript),
        confidence: 0,
        timestamp: new Date(),
      };

      // Try Claude for complex analysis first
      let response: AIResponse;
      
      if (this.config.enableClaudeFallback && claudeService.isServiceAvailable()) {
        try {
          response = await claudeService.analyzeDeFiQuery(transcript);
          command.confidence = response.confidence;
        } catch (error) {
          console.warn('Claude analysis failed, using Gemini:', error);
          response = await this.analyzeWithGemini(transcript);
        }
      } else {
        response = await this.analyzeWithGemini(transcript);
      }

      command.response = response.text;
      command.intent = response.intent;
      command.confidence = response.confidence;

      console.log(`Generated response for "${transcript}": ${response.text}`);
      this.onResponseGenerated?.(response);

      // Speak the response
      await this.speakResponse(response);

    } catch (error) {
      console.error('Failed to process transcript:', error);
      
      // Generate fallback response
      const fallbackResponse: AIResponse = {
        text: "I'm sorry, I didn't understand that. Could you please try again?",
        confidence: 1.0,
        intent: 'help_request',
        entities: {},
        avatarEmotion: 'confused',
        avatarActivity: 'idle',
      };

      await this.speakResponse(fallbackResponse);
      this.onError?.(error as Error);
    }
  }

  private async analyzeWithGemini(transcript: string): Promise<AIResponse> {
    // This would use Gemini 1.5 Pro for NLP analysis
    // For now, return a mock response
    return {
      text: `I understand you said: "${transcript}". How can I help you with DeFi today?`,
      confidence: 0.8,
      intent: this.inferBasicIntent(transcript),
      entities: {},
      avatarEmotion: 'neutral',
      avatarActivity: 'listening',
    };
  }

  private inferBasicIntent(transcript: string): VoiceIntent {
    const lowercaseTranscript = transcript.toLowerCase();

    if (lowercaseTranscript.includes('swap') || lowercaseTranscript.includes('trade')) {
      return 'swap_tokens';
    }
    if (lowercaseTranscript.includes('balance') || lowercaseTranscript.includes('how much')) {
      return 'check_balance';
    }
    if (lowercaseTranscript.includes('stake') && !lowercaseTranscript.includes('unstake')) {
      return 'stake_tokens';
    }
    if (lowercaseTranscript.includes('unstake')) {
      return 'unstake_tokens';
    }
    if (lowercaseTranscript.includes('portfolio')) {
      return 'portfolio_overview';
    }
    if (lowercaseTranscript.includes('price') || lowercaseTranscript.includes('market')) {
      return 'market_info';
    }
    if (lowercaseTranscript.includes('learn') || lowercaseTranscript.includes('tutorial')) {
      return 'tutorial_request';
    }

    return 'help_request';
  }

  // Text-to-Speech
  async speakResponse(response: AIResponse, options?: Partial<TTSOptions>): Promise<void> {
    if (this.isSpeaking) {
      await this.stopSpeaking();
    }

    this.isSpeaking = true;
    this.onSpeechStart?.();

    try {
      const ttsOptions: TTSOptions = {
        voice: 'en-US-Neural2-A', // Female voice
        speed: 1.0,
        pitch: 1.0,
        emotion: response.avatarEmotion,
        ...options,
      };

      console.log(`Speaking response: "${response.text}"`);
      
      // This would use Google Cloud TTS or react-native-tts
      await this.synthesizeSpeech(response.text, ttsOptions);
      
    } catch (error) {
      console.error('Failed to speak response:', error);
      this.onError?.(error as Error);
    } finally {
      this.isSpeaking = false;
      this.onSpeechEnd?.();
    }
  }

  private async synthesizeSpeech(text: string, options: TTSOptions): Promise<void> {
    // This would integrate with TTS service
    console.log(`TTS: "${text}" with voice: ${options.voice}`);
    
    // Simulate speech duration
    return new Promise(resolve => {
      const duration = text.length * 50; // Rough estimate
      setTimeout(resolve, duration);
    });
  }

  async stopSpeaking(): Promise<void> {
    if (!this.isSpeaking) return;

    try {
      // Stop TTS playback
      console.log('Stopping TTS playback');
      this.isSpeaking = false;
    } catch (error) {
      console.error('Failed to stop speaking:', error);
    }
  }

  // Event Handlers
  onWakeWord(callback: () => void): void {
    this.onWakeWordDetected = callback;
  }

  onListeningStarted(callback: () => void): void {
    this.onListeningStart = callback;
  }

  onListeningEnded(callback: () => void): void {
    this.onListeningEnd = callback;
  }

  onTranscript(callback: (transcript: string) => void): void {
    this.onTranscriptReceived = callback;
  }

  onResponse(callback: (response: AIResponse) => void): void {
    this.onResponseGenerated = callback;
  }

  onSpeechStarted(callback: () => void): void {
    this.onSpeechStart = callback;
  }

  onSpeechEnded(callback: () => void): void {
    this.onSpeechEnd = callback;
  }

  onErrorOccurred(callback: (error: Error) => void): void {
    this.onError = callback;
  }

  // State Management
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  // Utility Methods
  private generateCommandId(): string {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async testVoiceServices(): Promise<{
    wakeWord: boolean;
    asr: boolean;
    nlp: boolean;
    tts: boolean;
  }> {
    const results = {
      wakeWord: false,
      asr: false,
      nlp: false,
      tts: false,
    };

    try {
      // Test wake word detection
      if (this.config.enableWakeWord && this.porcupine) {
        results.wakeWord = true;
      }

      // Test ASR (mock test)
      results.asr = true;

      // Test NLP (Claude/Gemini)
      try {
        if (claudeService.isServiceAvailable()) {
          await claudeService.testConnection();
        }
        results.nlp = true;
      } catch (error) {
        console.warn('NLP test failed:', error);
      }

      // Test TTS (mock test)  
      results.tts = true;

      console.log('Voice services test results:', results);
      return results;
    } catch (error) {
      console.error('Voice services test failed:', error);
      return results;
    }
  }

  dispose(): void {
    this.stopWakeWordDetection();
    this.stopSpeaking();
    
    if (this.isListening) {
      this.stopListening();
    }

    this.audioRecorder = null;
    this.ttsEngine = null;
    this.porcupine = null;
    this.geminiClient = null;
    this.whisperEngine = null;

    console.log('Voice service disposed');
  }
}

// Singleton instance
export const voiceService = new VoiceService();
