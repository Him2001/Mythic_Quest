/**
 * Audio Context Manager for background audio playback
 * Ensures audio continues playing even when switching tabs
 */
export class AudioContextManager {
  private static audioContext: AudioContext | null = null;
  private static isInitialized = false;
  private static pendingAudio: HTMLAudioElement[] = [];

  /**
   * Initialize audio context with user interaction
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log('🎵 Audio context initialized successfully');

      // Setup global listeners for tab management
      this.setupTabManagement();

    } catch (error) {
      console.error('🎵 Failed to initialize audio context:', error);
    }
  }

  /**
   * Setup tab visibility management
   */
  private static setupTabManagement(): void {
    document.addEventListener('visibilitychange', async () => {
      if (!this.audioContext) return;

      if (document.hidden) {
        console.log('🎵 Tab hidden - maintaining audio context');
        // Keep audio context alive
        if (this.audioContext.state === 'suspended') {
          try {
            await this.audioContext.resume();
          } catch (error) {
            console.log('🎵 Could not resume audio context in background');
          }
        }
      } else {
        console.log('🎵 Tab visible - ensuring audio context is active');
        // Ensure audio context is running when tab becomes visible
        if (this.audioContext.state === 'suspended') {
          try {
            await this.audioContext.resume();
            console.log('🎵 Audio context resumed on tab focus');
          } catch (error) {
            console.log('🎵 Could not resume audio context on focus');
          }
        }

        // Resume any paused audio
        this.pendingAudio.forEach(audio => {
          if (audio.paused && !audio.ended) {
            audio.play().catch(() => {
              console.log('🎵 Could not resume audio on tab focus');
            });
          }
        });
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  /**
   * Create audio element with background playback support
   */
  static createAudio(src: string): HTMLAudioElement {
    const audio = new Audio(src);
    
    // Configure for background playback
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';

    // Add to tracking
    this.pendingAudio.push(audio);

    // Remove from tracking when ended
    audio.addEventListener('ended', () => {
      this.removeAudio(audio);
    });

    // Handle pause events (browser trying to pause audio)
    audio.addEventListener('pause', () => {
      if (!audio.ended && !document.hidden) {
        // Only auto-resume if tab is visible
        setTimeout(() => {
          audio.play().catch(() => {
            // Ignore if user doesn't want audio
          });
        }, 100);
      }
    });

    return audio;
  }

  /**
   * Remove audio from tracking
   */
  private static removeAudio(audio: HTMLAudioElement): void {
    const index = this.pendingAudio.indexOf(audio);
    if (index > -1) {
      this.pendingAudio.splice(index, 1);
    }
  }

  /**
   * Get current audio context state
   */
  static getState(): {
    initialized: boolean;
    contextState: AudioContextState | 'unavailable';
    activeAudio: number;
  } {
    return {
      initialized: this.isInitialized,
      contextState: this.audioContext?.state || 'unavailable',
      activeAudio: this.pendingAudio.length
    };
  }

  /**
   * Resume audio context manually
   */
  static async resumeContext(): Promise<boolean> {
    if (!this.audioContext) {
      await this.initialize();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('🎵 Audio context manually resumed');
        return true;
      } catch (error) {
        console.error('🎵 Failed to resume audio context:', error);
        return false;
      }
    }

    return this.audioContext?.state === 'running' || false;
  }

  /**
   * Cleanup audio resources
   */
  static cleanup(): void {
    this.pendingAudio.forEach(audio => {
      audio.pause();
    });
    this.pendingAudio = [];

    if (this.audioContext) {
      this.audioContext.close().catch(() => {
        // Ignore close errors
      });
      this.audioContext = null;
    }

    this.isInitialized = false;
    console.log('🎵 Audio context cleaned up');
  }
}