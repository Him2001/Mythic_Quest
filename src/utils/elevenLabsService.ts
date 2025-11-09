export class ElevenLabsService {
  private static readonly API_BASE = 'https://api.elevenlabs.io/v1';
  private static readonly API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  private static readonly VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'MezYwaNLTOfydzsFJwwt';

  private static audioCache = new Map<string, string>();
  private static isEnabled = true;

  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  static isServiceEnabled(): boolean {
    return this.isEnabled && !!this.API_KEY;
  }

  /**
   * Generate audio from text using Eleven Labs API
   */
  static async generateAudio(text: string, voiceId?: string): Promise<string | null> {
    if (!this.isServiceEnabled()) {
      console.log('🎵 Eleven Labs service not enabled or API key missing');
      return null;
    }

    // Check cache first
    const cacheKey = `${voiceId || this.VOICE_ID}-${text}`;
    if (this.audioCache.has(cacheKey)) {
      console.log('🎵 Using cached audio for text:', text.substring(0, 50));
      return this.audioCache.get(cacheKey)!;
    }

    try {
      console.log('🎵 Generating Eleven Labs audio for:', text.substring(0, 50) + '...');

      // Enhanced settings for better quality and consistent voice
      const response = await fetch(`${this.API_BASE}/text-to-speech/${voiceId || this.VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.75,        // Higher stability for consistent voice
            similarity_boost: 0.8,  // Higher similarity for better voice matching
            style: 0.2,            // Slight style for more expressive reading
            use_speaker_boost: true
          },
          // Add pronunciation guidance for fantasy terms
          pronunciation_dictionary_locators: []
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎵 Eleven Labs API Error Response:', errorText);
        throw new Error(`Eleven Labs API error: ${response.status} ${response.statusText}`);
      }

      // Convert response to blob and create URL
      const audioBlob = await response.blob();
      
      // Verify we got actual audio data
      if (audioBlob.size === 0) {
        throw new Error('Received empty audio response');
      }

      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the URL
      this.audioCache.set(cacheKey, audioUrl);

      console.log('🎵 Eleven Labs audio generated successfully, size:', audioBlob.size, 'bytes');
      return audioUrl;

    } catch (error) {
      console.error('🎵 Eleven Labs generation failed:', error);
      
      // Log additional debug info for deployment troubleshooting
      if (error instanceof Error) {
        console.error('🎵 Error details:', {
          message: error.message,
          apiKey: this.API_KEY ? 'Present' : 'Missing',
          voiceId: voiceId || this.VOICE_ID,
          environment: import.meta.env.MODE
        });
      }
      
      return null;
    }
  }

  /**
   * Play audio from URL with background tab support
   */
  static async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      // Configure for background playback
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      // Prevent audio from being paused by browser policies
      audio.addEventListener('pause', () => {
        if (!audio.ended) {
          console.log('🎵 Audio paused, attempting to resume');
          setTimeout(() => {
            audio.play().catch(() => {
              // Ignore errors if user interaction is required
            });
          }, 100);
        }
      });

      audio.onload = () => {
        console.log('🎵 Audio loaded, starting playback');
      };

      audio.onended = () => {
        console.log('🎵 Audio playback completed');
        resolve();
      };

      audio.onerror = (error) => {
        console.error('🎵 Audio playback error:', error);
        reject(error);
      };

      // Handle page visibility changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Keep audio playing in background
          audio.play().catch(() => {
            console.log('🎵 Background play blocked by browser');
          });
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup event listener when audio ends
      audio.addEventListener('ended', () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      });

      audio.play().catch(reject);
    });
  }

  /**
   * Generate and play audio in one step
   */
  static async generateAndPlayAudio(
    text: string, 
    voiceId?: string,
    onComplete?: () => void,
    onError?: (error: string) => void,
    onSpeakingChange?: (speaking: boolean) => void
  ): Promise<void> {
    try {
      if (onSpeakingChange) onSpeakingChange(true);

      const audioUrl = await this.generateAudio(text, voiceId);
      
      if (!audioUrl) {
        throw new Error('Failed to generate audio');
      }

      await this.playAudio(audioUrl);
      
      if (onSpeakingChange) onSpeakingChange(false);
      if (onComplete) onComplete();

    } catch (error) {
      console.error('🎵 Generate and play error:', error);
      if (onSpeakingChange) onSpeakingChange(false);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    }
  }

  /**
   * Clear audio cache to free up memory
   */
  static clearCache(): void {
    // Revoke all object URLs to free up memory
    for (const audioUrl of this.audioCache.values()) {
      URL.revokeObjectURL(audioUrl);
    }
    this.audioCache.clear();
    console.log('🎵 Audio cache cleared');
  }

  /**
   * Get available voices from Eleven Labs API
   */
  static async getAvailableVoices(): Promise<any[]> {
    if (!this.API_KEY) {
      console.log('🎵 Eleven Labs API key not available');
      return [];
    }

    try {
      const response = await fetch(`${this.API_BASE}/voices`, {
        headers: {
          'xi-api-key': this.API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];

    } catch (error) {
      console.error('🎵 Failed to fetch voices:', error);
      return [];
    }
  }
}