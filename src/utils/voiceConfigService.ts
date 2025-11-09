import { ElevenLabsService } from './elevenLabsService';

export interface VoiceConfig {
  enabled: boolean;
  useElevenLabs: boolean;
  voiceId: string;
  volume: number;
  speed: number;
}

export class VoiceConfigService {
  private static readonly STORAGE_KEY = 'mythic_quest_voice_config';
  
  private static defaultConfig: VoiceConfig = {
    enabled: true,
    useElevenLabs: true,
    voiceId: import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'MezYwaNLTOfydzsFJwwt',
    volume: 0.95,
    speed: 0.7
  };

  /**
   * Get current voice configuration
   */
  static getConfig(): VoiceConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        return { ...this.defaultConfig, ...config };
      }
    } catch (error) {
      console.warn('Failed to load voice config:', error);
    }
    return this.defaultConfig;
  }

  /**
   * Save voice configuration
   */
  static saveConfig(config: Partial<VoiceConfig>): void {
    try {
      const currentConfig = this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newConfig));
      
      // Apply the configuration to services
      this.applyConfig(newConfig);
    } catch (error) {
      console.error('Failed to save voice config:', error);
    }
  }

  /**
   * Apply configuration to voice services
   */
  private static applyConfig(config: VoiceConfig): void {
    // Apply to Eleven Labs service
    ElevenLabsService.setEnabled(config.enabled && config.useElevenLabs);
    
    // Apply to Web Speech API (handled in component)
    console.log('🎵 Voice config applied:', config);
  }

  /**
   * Initialize voice services with current configuration
   */
  static initialize(): void {
    const config = this.getConfig();
    this.applyConfig(config);
    
    console.log('🎵 Voice services initialized with config:', config);
  }

  /**
   * Check if voice features are available
   */
  static isVoiceAvailable(): boolean {
    const config = this.getConfig();
    
    if (!config.enabled) {
      return false;
    }

    if (config.useElevenLabs) {
      return ElevenLabsService.isServiceEnabled();
    }

    // Check Web Speech API availability
    return 'speechSynthesis' in window;
  }

  /**
   * Get voice settings for display
   */
  static getVoiceStatus(): {
    available: boolean;
    service: 'elevenlabs' | 'webspeech' | 'none';
    voiceId: string;
  } {
    const config = this.getConfig();
    
    if (!config.enabled) {
      return { available: false, service: 'none', voiceId: '' };
    }

    if (config.useElevenLabs && ElevenLabsService.isServiceEnabled()) {
      return { 
        available: true, 
        service: 'elevenlabs', 
        voiceId: config.voiceId 
      };
    }

    if ('speechSynthesis' in window) {
      return { 
        available: true, 
        service: 'webspeech', 
        voiceId: 'browser-default' 
      };
    }

    return { available: false, service: 'none', voiceId: '' };
  }

  /**
   * Toggle voice features on/off
   */
  static toggleVoice(): boolean {
    const config = this.getConfig();
    const newEnabled = !config.enabled;
    this.saveConfig({ enabled: newEnabled });
    return newEnabled;
  }

  /**
   * Switch between Eleven Labs and Web Speech API
   */
  static toggleVoiceService(): 'elevenlabs' | 'webspeech' {
    const config = this.getConfig();
    const newUseElevenLabs = !config.useElevenLabs;
    this.saveConfig({ useElevenLabs: newUseElevenLabs });
    return newUseElevenLabs ? 'elevenlabs' : 'webspeech';
  }

  /**
   * Update voice ID (for Eleven Labs)
   */
  static setVoiceId(voiceId: string): void {
    this.saveConfig({ voiceId });
  }

  /**
   * Update voice volume
   */
  static setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.saveConfig({ volume: clampedVolume });
  }

  /**
   * Update voice speed
   */
  static setSpeed(speed: number): void {
    const clampedSpeed = Math.max(0.1, Math.min(2, speed));
    this.saveConfig({ speed: clampedSpeed });
  }

  /**
   * Reset to default configuration
   */
  static resetToDefault(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.applyConfig(this.defaultConfig);
  }
}

// Initialize voice services when module loads
VoiceConfigService.initialize();