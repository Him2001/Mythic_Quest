import React, { useEffect, useRef, useState } from 'react';

interface ElevenLabsVoiceProps {
  text: string;
  voiceId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

const ElevenLabsVoice: React.FC<ElevenLabsVoiceProps> = ({
  text,
  voiceId,
  onComplete,
  onError,
  onSpeakingChange
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    // Only play if we have text and haven't played this exact text yet
    if (text && !hasPlayed) {
      playVoice();
      setHasPlayed(true);
    }

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [text, hasPlayed]);

  const cleanup = () => {
    // Abort any ongoing fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop and cleanup audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleAudioEnd);
      audioRef.current.removeEventListener('error', handleAudioError);
      audioRef.current.removeEventListener('play', handleAudioPlay);
      audioRef.current.removeEventListener('pause', handleAudioPause);
      audioRef.current.src = '';
      audioRef.current = null;
    }

    setIsPlaying(false);
    if (onSpeakingChange) {
      onSpeakingChange(false);
    }
  };

  const playVoice = async () => {
    try {
      console.log('🎵 Starting ElevenLabs voice generation for:', text.substring(0, 50) + '...');
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': 'sk_2373d20772128d71bfc6997232f631eed0f769241a18c032'
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
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and configure audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set audio properties to continue playing when tab is not active
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      // Add event listeners
      audio.addEventListener('ended', handleAudioEnd);
      audio.addEventListener('error', handleAudioError);
      audio.addEventListener('play', handleAudioPlay);
      audio.addEventListener('pause', handleAudioPause);
      audio.addEventListener('canplaythrough', () => {
        console.log('🎵 Audio ready to play');
      });

      // Play the audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🎵 Audio playback started successfully');
            setIsPlaying(true);
            if (onSpeakingChange) {
              onSpeakingChange(true);
            }
          })
          .catch((error) => {
            console.error('🎵 Audio playback failed:', error);
            handleError('Audio playback failed: ' + error.message);
          });
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🎵 Voice generation aborted');
        return;
      }
      
      console.error('🎵 ElevenLabs voice generation failed:', error);
      handleError(error.message || 'Voice generation failed');
    }
  };

  const handleAudioPlay = () => {
    console.log('🎵 Audio started playing');
    setIsPlaying(true);
    if (onSpeakingChange) {
      onSpeakingChange(true);
    }
  };

  const handleAudioPause = () => {
    console.log('🎵 Audio paused');
    setIsPlaying(false);
    if (onSpeakingChange) {
      onSpeakingChange(false);
    }
  };

  const handleAudioEnd = () => {
    console.log('🎵 Audio playback completed');
    setIsPlaying(false);
    if (onSpeakingChange) {
      onSpeakingChange(false);
    }
    
    // Clean up the audio URL
    if (audioRef.current) {
      URL.revokeObjectURL(audioRef.current.src);
    }
    
    if (onComplete) {
      onComplete();
    }
  };

  const handleAudioError = (event: Event) => {
    console.error('🎵 Audio playback error:', event);
    setIsPlaying(false);
    if (onSpeakingChange) {
      onSpeakingChange(false);
    }
    handleError('Audio playback error');
  };

  const handleError = (errorMessage: string) => {
    console.error('🎵 ElevenLabs error:', errorMessage);
    setIsPlaying(false);
    if (onSpeakingChange) {
      onSpeakingChange(false);
    }
    if (onError) {
      onError(errorMessage);
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default ElevenLabsVoice;