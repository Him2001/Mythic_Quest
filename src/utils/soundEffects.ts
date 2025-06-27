export class SoundEffects {
  private static audioContext: AudioContext | null = null;
  private static soundCache: Map<string, AudioBuffer> = new Map();
  private static isEnabled: boolean = true;
  private static volume: number = 0.3; // Default volume (30%)

  // Initialize audio context
  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Generate fantasy sound effects using Web Audio API
  private static generateTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3): void {
    if (!this.isEnabled) return;

    try {
      const audioContext = this.getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      // Create envelope for more natural sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * this.volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Sound effect failed:', error);
    }
  }

  // Generate magical chime sequence
  private static playMagicalChime(baseFreq: number = 523.25, notes: number = 3): void {
    if (!this.isEnabled) return;

    for (let i = 0; i < notes; i++) {
      setTimeout(() => {
        const frequency = baseFreq * Math.pow(1.2, i); // Musical interval
        this.generateTone(frequency, 0.4, 'sine', 0.2);
      }, i * 100);
    }
  }

  // Generate coin sound effect
  private static playCoinSound(): void {
    if (!this.isEnabled) return;

    // Metallic coin sound - quick high frequency with decay
    this.generateTone(800, 0.1, 'square', 0.15);
    setTimeout(() => {
      this.generateTone(1200, 0.08, 'triangle', 0.1);
    }, 50);
  }

  // Generate magical sparkle effect
  private static playSparkleSound(): void {
    if (!this.isEnabled) return;

    // High frequency sparkle
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const freq = 1500 + Math.random() * 1000;
        this.generateTone(freq, 0.1, 'sine', 0.08);
      }, i * 30);
    }
  }

  // Generate quest completion fanfare
  private static playQuestComplete(): void {
    if (!this.isEnabled) return;

    // Triumphant ascending notes
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.generateTone(freq, 0.3, 'triangle', 0.2);
      }, index * 150);
    });
  }

  // Generate level up sound
  private static playLevelUp(): void {
    if (!this.isEnabled) return;

    // Magical ascending arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major scale
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.generateTone(freq, 0.4, 'sine', 0.15);
      }, index * 80);
    });

    // Add magical sparkle overlay
    setTimeout(() => {
      this.playSparkleSound();
    }, 200);
  }

  // Generate button click sound
  private static playButtonClick(): void {
    if (!this.isEnabled) return;

    // Soft magical click
    this.generateTone(400, 0.1, 'square', 0.1);
    setTimeout(() => {
      this.generateTone(600, 0.05, 'sine', 0.05);
    }, 30);
  }

  // Generate tab switch sound
  private static playTabSwitch(): void {
    if (!this.isEnabled) return;

    // Gentle whoosh with chime
    this.generateTone(300, 0.15, 'sawtooth', 0.08);
    setTimeout(() => {
      this.generateTone(800, 0.2, 'sine', 0.1);
    }, 50);
  }

  // Generate notification sound
  private static playNotification(): void {
    if (!this.isEnabled) return;

    // Gentle bell-like notification
    this.playMagicalChime(659.25, 2); // E note
  }

  // Generate error sound
  private static playError(): void {
    if (!this.isEnabled) return;

    // Low, ominous tone
    this.generateTone(150, 0.3, 'sawtooth', 0.15);
    setTimeout(() => {
      this.generateTone(120, 0.2, 'square', 0.1);
    }, 100);
  }

  // Generate walking/movement sound
  private static playMovement(): void {
    if (!this.isEnabled) return;

    // Soft footstep-like sound
    this.generateTone(200, 0.1, 'triangle', 0.08);
  }

  // Generate magical portal/teleport sound
  private static playPortal(): void {
    if (!this.isEnabled) return;

    // Swirling magical effect
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const freq = 400 + Math.sin(i * 0.5) * 200;
        this.generateTone(freq, 0.1, 'sine', 0.06);
      }, i * 50);
    }
  }

  // Generate achievement unlock sound
  private static playAchievement(): void {
    if (!this.isEnabled) return;

    // Majestic fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major chord ascending
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.generateTone(freq, 0.5, 'triangle', 0.18);
      }, index * 100);
    });

    // Add sparkle effect
    setTimeout(() => {
      this.playSparkleSound();
    }, 300);
  }

  // Public API methods
  static playSound(soundType: string): void {
    switch (soundType) {
      case 'click':
      case 'button':
        this.playButtonClick();
        break;
      case 'tab':
      case 'navigation':
        this.playTabSwitch();
        break;
      case 'quest-complete':
      case 'quest':
        this.playQuestComplete();
        break;
      case 'level-up':
      case 'levelup':
        this.playLevelUp();
        break;
      case 'coin':
      case 'coins':
        this.playCoinSound();
        break;
      case 'achievement':
        this.playAchievement();
        break;
      case 'notification':
        this.playNotification();
        break;
      case 'error':
        this.playError();
        break;
      case 'movement':
      case 'walk':
        this.playMovement();
        break;
      case 'portal':
      case 'teleport':
        this.playPortal();
        break;
      case 'sparkle':
      case 'magic':
        this.playSparkleSound();
        break;
      case 'chime':
        this.playMagicalChime();
        break;
      default:
        this.playButtonClick(); // Default sound
    }
  }

  // Control methods
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('mythic_sounds_enabled', enabled.toString());
  }

  static isEnabledState(): boolean {
    const stored = localStorage.getItem('mythic_sounds_enabled');
    return stored !== null ? stored === 'true' : true; // Default to enabled
  }

  static setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    localStorage.setItem('mythic_sounds_volume', this.volume.toString());
  }

  static getVolume(): number {
    const stored = localStorage.getItem('mythic_sounds_volume');
    return stored !== null ? parseFloat(stored) : 0.3; // Default to 30%
  }

  // Initialize sound system
  static initialize(): void {
    this.isEnabled = this.isEnabledState();
    this.volume = this.getVolume();

    // Resume audio context on user interaction (required by browsers)
    const resumeAudio = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', resumeAudio, { once: true });
    document.addEventListener('keydown', resumeAudio, { once: true });
    document.addEventListener('touchstart', resumeAudio, { once: true });
  }

  // Play welcome sound sequence
  static playWelcomeSequence(): void {
    if (!this.isEnabled) return;

    // Magical entrance sequence
    this.playPortal();
    setTimeout(() => {
      this.playMagicalChime(523.25, 4);
    }, 500);
    setTimeout(() => {
      this.playSparkleSound();
    }, 1000);
  }
}

// Initialize sound system when module loads
SoundEffects.initialize();