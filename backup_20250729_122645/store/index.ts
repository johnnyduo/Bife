import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { 
  User, 
  AvatarState, 
  Portfolio, 
  DeFiOperation, 
  DeviceCapabilities,
  VoiceCommand 
} from '@types/index';

// MMKV storage instance
const storage = new MMKV();

const zustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};

// User Store
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

// Avatar Store
interface AvatarStore {
  state: AvatarState;
  isLoaded: boolean;
  error: string | null;
  updateState: (updates: Partial<AvatarState>) => void;
  setEmotion: (emotion: AvatarState['emotion']) => void;
  setActivity: (activity: AvatarState['activity']) => void;
  setListening: (isListening: boolean) => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setProcessing: (isProcessing: boolean) => void;
  setLoaded: (isLoaded: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAvatarStore = create<AvatarStore>((set, get) => ({
  state: {
    emotion: 'neutral',
    activity: 'idle',
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    animationSpeed: 1.0,
    lastInteraction: new Date(),
  },
  isLoaded: false,
  error: null,
  updateState: (updates) => {
    const currentState = get().state;
    set({ 
      state: { 
        ...currentState, 
        ...updates, 
        lastInteraction: new Date() 
      } 
    });
  },
  setEmotion: (emotion) => {
    get().updateState({ emotion });
  },
  setActivity: (activity) => {
    get().updateState({ activity });
  },
  setListening: (isListening) => {
    get().updateState({ 
      isListening, 
      activity: isListening ? 'listening' : 'idle' 
    });
  },
  setSpeaking: (isSpeaking) => {
    get().updateState({ 
      isSpeaking, 
      activity: isSpeaking ? 'speaking' : 'idle' 
    });
  },
  setProcessing: (isProcessing) => {
    get().updateState({ 
      isProcessing, 
      activity: isProcessing ? 'processing' : 'idle' 
    });
  },
  setLoaded: (isLoaded) => set({ isLoaded }),
  setError: (error) => set({ error }),
}));

// Portfolio Store
interface PortfolioStore {
  portfolio: Portfolio | null;
  isLoading: boolean;
  error: string | null;
  setPortfolio: (portfolio: Portfolio) => void;
  updatePortfolio: (updates: Partial<Portfolio>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  refresh: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  portfolio: null,
  isLoading: false,
  error: null,
  setPortfolio: (portfolio) => set({ portfolio }),
  updatePortfolio: (updates) => {
    const currentPortfolio = get().portfolio;
    if (currentPortfolio) {
      set({ portfolio: { ...currentPortfolio, ...updates } });
    }
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  refresh: async () => {
    // TODO: Implement portfolio refresh logic
    set({ isLoading: true });
    try {
      // Refresh portfolio data
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));

// Voice Store
interface VoiceStore {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  lastCommand: VoiceCommand | null;
  commands: VoiceCommand[];
  error: string | null;
  setListening: (isListening: boolean) => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setProcessing: (isProcessing: boolean) => void;
  addCommand: (command: VoiceCommand) => void;
  setError: (error: string | null) => void;
  clearCommands: () => void;
}

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  isListening: false,
  isSpeaking: false,
  isProcessing: false,
  lastCommand: null,
  commands: [],
  error: null,
  setListening: (isListening) => {
    set({ isListening });
    // Update avatar state
    useAvatarStore.getState().setListening(isListening);
  },
  setSpeaking: (isSpeaking) => {
    set({ isSpeaking });
    // Update avatar state
    useAvatarStore.getState().setSpeaking(isSpeaking);
  },
  setProcessing: (isProcessing) => {
    set({ isProcessing });
    // Update avatar state
    useAvatarStore.getState().setProcessing(isProcessing);
  },
  addCommand: (command) => {
    const commands = [...get().commands, command];
    set({ 
      commands: commands.slice(-50), // Keep last 50 commands
      lastCommand: command 
    });
  },
  setError: (error) => set({ error }),
  clearCommands: () => set({ commands: [], lastCommand: null }),
}));

// Operations Store
interface OperationsStore {
  operations: DeFiOperation[];
  activeOperation: DeFiOperation | null;
  isLoading: boolean;
  error: string | null;
  addOperation: (operation: DeFiOperation) => void;
  updateOperation: (id: string, updates: Partial<DeFiOperation>) => void;
  setActiveOperation: (operation: DeFiOperation | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearOperations: () => void;
}

export const useOperationsStore = create<OperationsStore>()(
  persist(
    (set, get) => ({
      operations: [],
      activeOperation: null,
      isLoading: false,
      error: null,
      addOperation: (operation) => {
        const operations = [...get().operations, operation];
        set({ operations: operations.slice(-100) }); // Keep last 100 operations
      },
      updateOperation: (id, updates) => {
        const operations = get().operations.map(op => 
          op.id === id ? { ...op, ...updates } : op
        );
        set({ operations });
        
        const activeOperation = get().activeOperation;
        if (activeOperation?.id === id) {
          set({ activeOperation: { ...activeOperation, ...updates } });
        }
      },
      setActiveOperation: (operation) => set({ activeOperation: operation }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearOperations: () => set({ operations: [], activeOperation: null }),
    }),
    {
      name: 'operations-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

// App Store for global app state
interface AppStore {
  isInitialized: boolean;
  deviceCapabilities: DeviceCapabilities | null;
  networkStatus: 'online' | 'offline' | 'poor';
  theme: 'light' | 'dark' | 'auto';
  setInitialized: (isInitialized: boolean) => void;
  setDeviceCapabilities: (capabilities: DeviceCapabilities) => void;
  setNetworkStatus: (status: 'online' | 'offline' | 'poor') => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      isInitialized: false,
      deviceCapabilities: null,
      networkStatus: 'online',
      theme: 'auto',
      setInitialized: (isInitialized) => set({ isInitialized }),
      setDeviceCapabilities: (capabilities) => set({ deviceCapabilities: capabilities }),
      setNetworkStatus: (status) => set({ networkStatus: status }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
