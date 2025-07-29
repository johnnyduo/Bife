// Babylon.js VRM Avatar System for Bife
// Handles 3D avatar rendering, animations, and emotional expressions

import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  Color3,
  PBRMaterial,
  Texture,
  TransformNode,
  AnimationGroup,
  TargetCamera,
} from '@babylonjs/core';
import { VRMManager } from 'babylonjs-mesh-vrm';
import DeviceInfo from 'react-native-device-info';
import { AvatarState, EmotionType, ActivityType, DeviceCapabilities } from '@types/index';

export interface AvatarConfig {
  modelUrl: string;
  textureQuality: 'low' | 'medium' | 'high';
  animationQuality: 'low' | 'medium' | 'high';
  enablePhysics: boolean;
  targetFPS: number;
  maxPolygons: number;
}

export class BabylonAvatarSystem {
  private engine: Engine | null = null;
  private scene: Scene | null = null;
  private camera: ArcRotateCamera | null = null;
  private vrmManager: VRMManager | null = null;
  private animationGroups: Map<string, AnimationGroup> = new Map();
  private currentEmotion: EmotionType = 'neutral';
  private currentActivity: ActivityType = 'idle';
  private isInitialized: boolean = false;
  private config: AvatarConfig;
  private deviceCapabilities: DeviceCapabilities | null = null;

  constructor(canvas: HTMLCanvasElement, config: Partial<AvatarConfig> = {}) {
    this.config = {
      modelUrl: 'assets/models/bife-avatar.vrm',
      textureQuality: 'medium',
      animationQuality: 'medium',
      enablePhysics: true,
      targetFPS: 60,
      maxPolygons: 400000,
      ...config,
    };

    this.initializeDeviceCapabilities();
    this.adjustConfigForDevice();
    this.initializeBabylon(canvas);
  }

  private async initializeDeviceCapabilities(): Promise<void> {
    try {
      const deviceType = await DeviceInfo.getDeviceType();
      const totalMemory = await DeviceInfo.getTotalMemory();
      const systemVersion = await DeviceInfo.getSystemVersion();
      
      // Determine performance class based on device specs
      let performanceClass: DeviceCapabilities['performanceClass'] = 'mid';
      const memoryGB = totalMemory / (1024 * 1024 * 1024);

      if (memoryGB >= 12 && deviceType === 'Handset') {
        performanceClass = 'flagship';
      } else if (memoryGB >= 8) {
        performanceClass = 'high';
      } else if (memoryGB >= 6) {
        performanceClass = 'mid';
      } else {
        performanceClass = 'low';
      }

      this.deviceCapabilities = {
        hasVoiceRecognition: true, // Assume available on mobile
        hasTTS: true,
        hasHapticFeedback: deviceType === 'Handset',
        hasBiometrics: true, // Will be checked at runtime
        has3DAcceleration: true,
        performanceClass,
        memoryLimit: Math.floor(memoryGB * 1024),
        targetFPS: performanceClass === 'flagship' ? 60 : performanceClass === 'high' ? 45 : 30,
      };
    } catch (error) {
      console.warn('Failed to detect device capabilities:', error);
      // Fallback to conservative settings
      this.deviceCapabilities = {
        hasVoiceRecognition: true,
        hasTTS: true,  
        hasHapticFeedback: false,
        hasBiometrics: false,
        has3DAcceleration: false,
        performanceClass: 'low',
        memoryLimit: 4096,
        targetFPS: 30,
      };
    }
  }

  private adjustConfigForDevice(): void {
    if (!this.deviceCapabilities) return;

    const { performanceClass } = this.deviceCapabilities;

    switch (performanceClass) {
      case 'flagship':
        this.config.textureQuality = 'high';
        this.config.animationQuality = 'high';
        this.config.targetFPS = 60;
        this.config.maxPolygons = 400000;
        break;
      case 'high':
        this.config.textureQuality = 'medium';
        this.config.animationQuality = 'high';
        this.config.targetFPS = 45;
        this.config.maxPolygons = 300000;
        break;
      case 'mid':
        this.config.textureQuality = 'medium';
        this.config.animationQuality = 'medium';
        this.config.targetFPS = 45;
        this.config.maxPolygons = 200000;
        this.config.enablePhysics = false;
        break;
      case 'low':
        this.config.textureQuality = 'low';
        this.config.animationQuality = 'low';
        this.config.targetFPS = 30;
        this.config.maxPolygons = 100000;
        this.config.enablePhysics = false;
        break;
    }
  }

  private async initializeBabylon(canvas: HTMLCanvasElement): Promise<void> {
    try {
      // Create engine with optimized settings
      this.engine = new Engine(canvas, true, {
        adaptToDeviceRatio: true,
        antialias: this.deviceCapabilities?.performanceClass !== 'low',
        stencil: true,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
      });

      // Create scene
      this.scene = new Scene(this.engine);
      this.scene.actionManager = null; // Disable action manager for performance

      // Set up camera
      this.camera = new ArcRotateCamera(
        'camera',
        -Math.PI / 2,
        Math.PI / 2.5,
        3,
        Vector3.Zero(),
        this.scene
      );
      this.camera.lowerBetaLimit = Math.PI / 4;
      this.camera.upperBetaLimit = (3 * Math.PI) / 4;
      this.camera.lowerRadiusLimit = 2;
      this.camera.upperRadiusLimit = 5;

      // Set up lighting
      const light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
      light.intensity = 0.8;
      light.diffuse = new Color3(1, 1, 1);
      light.specular = new Color3(0.8, 0.8, 0.8);

      // Configure render loop
      this.engine.runRenderLoop(() => {
        if (this.scene) {
          this.scene.render();
        }
      });

      // Handle resize
      window.addEventListener('resize', () => {
        if (this.engine) {
          this.engine.resize();
        }
      });

      this.isInitialized = true;
      console.log('Babylon.js avatar system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Babylon.js:', error);
      throw error;
    }
  }

  async loadVRMAvatar(modelUrl?: string): Promise<void> {
    if (!this.scene) {
      throw new Error('Babylon.js scene not initialized');
    }

    const url = modelUrl || this.config.modelUrl;

    try {
      // Load VRM model
      this.vrmManager = new VRMManager(this.scene);
      
      const vrmData = await this.vrmManager.loadAsync(url);
      
      // Optimize model based on device capabilities
      await this.optimizeModel(vrmData);
      
      // Set up animations
      await this.setupAnimations();
      
      console.log('VRM avatar loaded successfully');
    } catch (error) {
      console.error('Failed to load VRM avatar:', error);
      // Fallback to simpler avatar representation
      await this.createFallbackAvatar();
    }
  }

  private async optimizeModel(vrmData: any): Promise<void> {
    if (!this.scene || !vrmData) return;

    try {
      // Reduce polygon count if needed
      const meshes = vrmData.meshes || [];
      let totalPolygons = 0;

      meshes.forEach((mesh: any) => {
        if (mesh.geometry) {
          totalPolygons += mesh.geometry.getTotalIndices() / 3;
        }
      });

      if (totalPolygons > this.config.maxPolygons) {
        console.log(`Optimizing model: ${totalPolygons} -> ${this.config.maxPolygons} polygons`);
        // Apply LOD or simplification
        await this.applyLevelOfDetail(meshes);
      }

      // Optimize textures
      await this.optimizeTextures(vrmData);

      // Set up material optimizations
      await this.optimizeMaterials(vrmData);

    } catch (error) {
      console.warn('Model optimization failed:', error);
    }
  }

  private async applyLevelOfDetail(meshes: any[]): Promise<void> {
    // Implement polygon reduction based on device capabilities
    const reductionFactor = this.getReductionFactor();
    
    meshes.forEach((mesh) => {
      if (mesh.simplify) {
        mesh.simplify([
          { quality: reductionFactor, distance: 10 }
        ]);
      }
    });
  }

  private getReductionFactor(): number {
    switch (this.deviceCapabilities?.performanceClass) {
      case 'flagship': return 0.95;
      case 'high': return 0.85;
      case 'mid': return 0.70;
      case 'low': return 0.50;
      default: return 0.70;
    }
  }

  private async optimizeTextures(vrmData: any): Promise<void> {
    if (!vrmData.textures) return;

    const textureSize = this.getOptimalTextureSize();
    
    vrmData.textures.forEach((texture: Texture) => {
      // Resize textures based on quality setting
      if (texture.getSize().width > textureSize) {
        texture.updateSize(textureSize, textureSize);
      }
      
      // Enable texture compression
      texture.generateMipMaps = this.config.textureQuality !== 'low';
    });
  }

  private getOptimalTextureSize(): number {
    switch (this.config.textureQuality) {
      case 'high': return 1024;
      case 'medium': return 512;
      case 'low': return 256;
      default: return 512;
    }
  }

  private async optimizeMaterials(vrmData: any): Promise<void> {
    if (!vrmData.materials) return;

    vrmData.materials.forEach((material: PBRMaterial) => {
      // Disable expensive features on low-end devices
      if (this.deviceCapabilities?.performanceClass === 'low') {
        material.realTimeFiltering = false;
        material.realTimeFilteringQuality = 1;
      }
      
      // Optimize reflection settings
      material.environmentIntensity = 0.5;
      material.enableSpecularAntiAliasing = false;
    });
  }

  private async setupAnimations(): Promise<void> {
    if (!this.scene || !this.vrmManager) return;

    // Define emotion-based animations
    const emotions: Record<EmotionType, string[]> = {
      neutral: ['idle', 'blink'],
      happy: ['smile', 'happy_idle', 'joy_gesture'],
      excited: ['excited_wave', 'bounce', 'clap'],
      concerned: ['worried_look', 'head_shake', 'frown'],
      focused: ['concentrated', 'thinking', 'analyze'],
      celebrating: ['celebration', 'victory_dance', 'cheer'],
      thinking: ['ponder', 'head_tilt', 'chin_touch'],
      sad: ['sad_idle', 'sigh', 'disappointed'],
      confused: ['confused_look', 'head_scratch', 'shrug'],
    };

    // Create animation groups for each emotion
    for (const [emotion, animations] of Object.entries(emotions)) {
      const animationGroup = new AnimationGroup(emotion, this.scene);
      
      // Add specific animations for this emotion
      animations.forEach(animName => {
        // Create or load animation data
        const animation = this.createEmotionAnimation(animName);
        if (animation) {
          animationGroup.addTargetedAnimation(animation.animation, animation.target);
        }
      });

      this.animationGroups.set(emotion, animationGroup);
    }
  }

  private createEmotionAnimation(animationName: string): { animation: any; target: any } | null {
    // This would typically load from VRM animation data
    // For now, return null - in production, load from VRM file
    console.log(`Creating animation: ${animationName}`);
    return null;
  }

  private async createFallbackAvatar(): Promise<void> {
    if (!this.scene) return;

    console.log('Creating fallback avatar representation');
    
    // Create a simple geometric avatar as fallback
    const { MeshBuilder } = await import('@babylonjs/core');
    
    const head = MeshBuilder.CreateSphere('head', { diameter: 1 }, this.scene);
    head.position.y = 1.5;
    
    const body = MeshBuilder.CreateCylinder('body', { height: 1.5, diameter: 0.8 }, this.scene);
    body.position.y = 0.75;
    
    // Apply simple materials
    const material = new PBRMaterial('avatarMaterial', this.scene);
    material.baseColor = new Color3(0.8, 0.7, 0.6);
    
    head.material = material;
    body.material = material;
    
    // Create simple animations
    await this.setupFallbackAnimations([head, body]);
  }

  private async setupFallbackAnimations(meshes: any[]): Promise<void> {
    // Create basic animations for fallback avatar
    const { Animation } = await import('@babylonjs/core');
    
    meshes.forEach(mesh => {
      // Simple breathing animation
      const breatheAnimation = new Animation(
        'breathe',
        'scaling.y',
        30,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );
      
      const keys = [
        { frame: 0, value: 1 },
        { frame: 30, value: 1.05 },
        { frame: 60, value: 1 },
      ];
      
      breatheAnimation.setKeys(keys);
      mesh.animations.push(breatheAnimation);
    });
  }

  updateEmotion(emotion: EmotionType): void {
    if (this.currentEmotion === emotion) return;
    
    console.log(`Updating avatar emotion: ${this.currentEmotion} -> ${emotion}`);
    
    // Stop current emotion animation
    const currentAnimation = this.animationGroups.get(this.currentEmotion);
    if (currentAnimation) {
      currentAnimation.stop();
    }
    
    // Start new emotion animation
    const newAnimation = this.animationGroups.get(emotion);
    if (newAnimation) {
      newAnimation.start(true); // Loop animation
    }
    
    this.currentEmotion = emotion;
  }

  updateActivity(activity: ActivityType): void {
    if (this.currentActivity === activity) return;
    
    console.log(`Updating avatar activity: ${this.currentActivity} -> ${activity}`);
    
    // Activity-specific behaviors
    switch (activity) {
      case 'listening':
        this.playListeningAnimation();
        break;
      case 'speaking':
        this.playSpeakingAnimation();
        break;
      case 'processing':
        this.playProcessingAnimation();
        break;
      case 'trading':
        this.playTradingAnimation();
        break;
      case 'teaching':
        this.playTeachingAnimation();
        break;
      default:
        this.playIdleAnimation();
    }
    
    this.currentActivity = activity;
  }

  private playListeningAnimation(): void {
    // Add subtle listening indicators (ear twitch, head lean)
    this.updateEmotion('focused');
  }

  private playSpeakingAnimation(): void {
    // Add mouth movements and gestures
    this.updateEmotion('neutral');
  }

  private playProcessingAnimation(): void {
    // Add thinking indicators
    this.updateEmotion('thinking');
  }

  private playTradingAnimation(): void {
    // Add trading-specific gestures
    this.updateEmotion('focused');
  }

  private playTeachingAnimation(): void {
    // Add teaching gestures
    this.updateEmotion('happy');
  }

  private playIdleAnimation(): void {
    // Return to neutral state
    this.updateEmotion('neutral');
  }

  updateAvatarState(state: Partial<AvatarState>): void {
    if (state.emotion) {
      this.updateEmotion(state.emotion);
    }
    
    if (state.activity) {
      this.updateActivity(state.activity);
    }
    
    if (state.animationSpeed !== undefined) {
      this.setAnimationSpeed(state.animationSpeed);
    }
  }

  private setAnimationSpeed(speed: number): void {
    this.animationGroups.forEach(group => {
      group.speedRatio = speed;
    });
  }

  getPerformanceMetrics(): {
    fps: number;
    drawCalls: number;
    memoryUsage: number;
    polygonCount: number;
  } {
    if (!this.engine || !this.scene) {
      return { fps: 0, drawCalls: 0, memoryUsage: 0, polygonCount: 0 };
    }

    return {
      fps: this.engine.getFps(),
      drawCalls: this.scene.getActiveMeshes().length,
      memoryUsage: this.estimateMemoryUsage(),
      polygonCount: this.getTotalPolygonCount(),
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in MB
    if (!this.scene) return 0;
    
    let totalMemory = 0;
    
    // Estimate texture memory
    this.scene.textures.forEach(texture => {
      const size = texture.getSize();
      totalMemory += (size.width * size.height * 4) / (1024 * 1024); // RGBA bytes to MB
    });
    
    // Estimate geometry memory
    totalMemory += this.getTotalPolygonCount() * 0.00005; // Rough estimate
    
    return totalMemory;
  }

  private getTotalPolygonCount(): number {
    if (!this.scene) return 0;
    
    let totalPolygons = 0;
    
    this.scene.meshes.forEach(mesh => {
      if (mesh.getTotalIndices) {
        totalPolygons += mesh.getTotalIndices() / 3;
      }
    });
    
    return totalPolygons;
  }

  dispose(): void {
    if (this.engine) {
      this.engine.dispose();
      this.engine = null;
    }
    
    this.animationGroups.clear();
    this.scene = null;
    this.camera = null;
    this.vrmManager = null;
    this.isInitialized = false;
    
    console.log('Avatar system disposed');
  }

  isReady(): boolean {
    return this.isInitialized && this.vrmManager !== null;
  }

  getDeviceCapabilities(): DeviceCapabilities | null {
    return this.deviceCapabilities;
  }
}
