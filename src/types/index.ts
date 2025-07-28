// Core types for Bife voice-first DeFi companion

export interface User {
  id: string;
  walletAddress?: string;
  preferences: UserPreferences;
  subscription: SubscriptionTier;
  bonkBalance: number;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface UserPreferences {
  voiceLanguage: string;
  avatarSkin: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  enableVoiceMode: boolean;
  enableHapticFeedback: boolean;
  enableBiometricAuth: boolean;
  preferredCurrency: string;
  darkMode: boolean;
}

export type SubscriptionTier = 'basic' | 'premium' | 'family';

export interface VoiceCommand {
  id: string;
  userId: string;
  command: string;
  intent: VoiceIntent;
  confidence: number;
  timestamp: Date;
  response?: string;
  executionTime?: number;
}

export type VoiceIntent = 
  | 'swap_tokens'
  | 'check_balance'
  | 'stake_tokens'
  | 'unstake_tokens'
  | 'portfolio_overview'
  | 'market_info'
  | 'tutorial_request'
  | 'avatar_interaction'
  | 'settings_change'
  | 'help_request';

export interface AvatarState {
  emotion: EmotionType;
  activity: ActivityType;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  animationSpeed: number;
  lastInteraction: Date;
}

export type EmotionType = 
  | 'neutral'
  | 'happy'
  | 'excited'
  | 'concerned'
  | 'focused'
  | 'celebrating'
  | 'thinking'
  | 'sad'
  | 'confused';

export type ActivityType =
  | 'idle'
  | 'listening'
  | 'speaking'
  | 'processing'
  | 'trading'
  | 'teaching'
  | 'celebrating'
  | 'warning';

export interface DeFiOperation {
  id: string;
  type: OperationType;
  status: OperationStatus;
  inputToken: Token;
  outputToken?: Token;
  amount: number;
  estimatedValue?: number;
  slippage?: number;
  txHash?: string;
  timestamp: Date;
  userId: string;
}

export type OperationType = 
  | 'swap'
  | 'stake'
  | 'unstake'
  | 'lend'
  | 'borrow'
  | 'bridge'
  | 'dca';

export type OperationStatus = 
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string;
  price?: number;
  change24h?: number;
  volume24h?: number;
}

export interface Portfolio {
  userId: string;
  totalValue: number;
  tokens: PortfolioToken[];
  stakingPositions: StakingPosition[];
  pnl24h: number;
  pnlTotal: number;
  lastUpdated: Date;
}

export interface PortfolioToken {
  token: Token;
  balance: number;
  value: number;
  percentage: number;
}

export interface StakingPosition {
  protocol: string;
  token: Token;
  stakedAmount: number;
  rewards: number;
  apy: number;
  lockPeriod?: number;
  unlockDate?: Date;
}

export interface MarketData {
  token: Token;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  allTimeHigh: number;
  allTimeLow: number;
  timestamp: Date;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  topics: string[];
  avatarScript: AvatarScript[];
  quiz?: Quiz;
  rewards: number; // Bonk tokens
}

export interface AvatarScript {
  text: string;
  emotion: EmotionType;
  activity: ActivityType;
  duration: number;
  waitForUserResponse?: boolean;
}

export interface Quiz {
  questions: QuizQuestion[];
  passingScore: number;
  bonkReward: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AIResponse {
  text: string;
  confidence: number;
  intent: VoiceIntent;
  entities: Record<string, any>;
  avatarEmotion: EmotionType;
  avatarActivity: ActivityType;
  followUpQuestions?: string[];
}

export interface DeviceCapabilities {
  hasVoiceRecognition: boolean;
  hasTTS: boolean;
  hasHapticFeedback: boolean;
  hasBiometrics: boolean;
  has3DAcceleration: boolean;
  performanceClass: 'low' | 'mid' | 'high' | 'flagship';
  memoryLimit: number;
  targetFPS: number;
}

export interface AppConfig {
  version: string;
  buildNumber: number;
  environment: 'development' | 'staging' | 'production';
  features: {
    babylonVrm: boolean;
    crossChain: boolean;
    claudeFallback: boolean;
    whisperFallback: boolean;
  };
  performance: {
    maxAvatarPolygons: number;
    targetFPS: number;
    memoryLimitMB: number;
  };
}
