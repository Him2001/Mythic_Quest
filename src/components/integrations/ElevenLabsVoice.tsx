import React, { useEffect, useRef, useState } from 'react';

interface ElevenLabsVoiceProps {
  text: string;
  voiceId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
  onSpeakingChange?: (speaking: boolean) => void;
}

const ElevenLabsVoice: React.FC<ElevenLabsVoiceProps> = ({
  text,
  voiceId,
  onComplete,
  onError,
  onSpeakingChange
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const hasStartedRef = useRef(false);
  const componentMountedRef = useRef(true);

  // API key
  const API_KEY = 'sk_2373d20772128d71bfc6997232f631eed0f769241a18c032';

  // Cleanup function
  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('loadstart', handleLoadStart);
      audioRef.current.removeEventListener('canplay', handleCanPlay);
      audioRef.current.removeEventListener('play', handlePlay);
      audioRef.current.removeEventListener('ended', handleEnded);
      audioRef.current.removeEventListener('error', handleError);
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
    }
  };

  // Event handlers
  const handleLoadStart = () => {
    console.log('🎵 Audio loading started');
  };

  const handleCanPlay = () => {
    console.log('🎵 Audio can play, starting playback');
    if (audioRef.current && componentMountedRef.current) {
      audioRef.current.play().catch(error => {
        console.error('🎵 Playback failed:', error);
        if (onError) onError(`Playback failed: ${error.message}`);
      });
    }
  };

  const handlePlay = () => {
    console.log('🎵 Audio playback started');
    if (onSpeakingChange) onSpeakingChange(true);
  };

  const handleEnded = () => {
    console.log('🎵 Audio playback completed');
    if (onSpeakingChange) onSpeakingChange(false);
    if (onComplete) onComplete();
    cleanup();
  };

  const handleError = (event: Event) => {
    console.error('🎵 Audio playback error:', event);
    if (onSpeakingChange) onSpeakingChange(false);
    if (onError) onError('Audio playback failed');
    cleanup();
  };

  // Generate and play audio
  const generateAndPlayAudio = async () => {
    if (!text.trim() || hasStartedRef.current || !componentMountedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    setIsGenerating(true);

    try {
      console.log('🎵 Generating audio for text:', text.substring(0, 50) + '...');

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      
      if (!componentMountedRef.current) {
        return;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);

      // Create and configure audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Configure audio for background playback
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      // Add event listeners
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      // Start loading
      audio.load();

      console.log('🎵 Audio generation completed, starting playback');

    } catch (error) {
      console.error('🎵 Failed to generate audio:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
      if (onSpeakingChange) onSpeakingChange(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Start generation when component mounts
  useEffect(() => {
    componentMountedRef.current = true;
    generateAndPlayAudio();

    // Cleanup on unmount
    return () => {
      componentMountedRef.current = false;
      cleanup();
    };
  }, [text, voiceId]);

  // Prevent page unload from stopping audio
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Don't prevent unload, but keep audio playing
      if (audioRef.current && !audioRef.current.paused) {
        console.log('🎵 Page unloading, but audio will continue');
      }
    };

    const handleVisibilityChange = () => {
      // Ensure audio continues when tab becomes hidden
      if (document.hidden && audioRef.current && !audioRef.current.paused) {
        console.log('🎵 Tab hidden, ensuring audio continues');
        // Force audio to continue playing
        audioRef.current.play().catch(console.warn);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Don't render anything visible
  return null;
};

export default ElevenLabsVoice;