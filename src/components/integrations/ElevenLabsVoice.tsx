import React, { useEffect, useRef, useState } from 'react';

interface ElevenLabsVoiceProps {
  text: string;
  voiceId?: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const ElevenLabsVoice: React.FC<ElevenLabsVoiceProps> = ({
  text,
  voiceId = "MezYwaNLTOfydzsFJwwt",
  onComplete,
  onError
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // API Key
  const API_KEY = "sk_2373d20772128d71bfc6997232f631eed0f769241a18c032";

  useEffect(() => {
    // Only play if we have text and haven't played this text yet
    if (text && text.trim() && !hasPlayed && !isLoading) {
      playVoice();
    }

    // Cleanup function
    return () => {
      cleanup();
    };
  }, [text]);

  const cleanup = () => {
    // Abort any ongoing fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop and cleanup audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeEventListener('ended', handleAudioEnd);
      audioRef.current.removeEventListener('error', handleAudioError);
      audioRef.current = null;
    }

    setIsLoading(false);
  };

  const playVoice = async () => {
    if (!text || !text.trim() || hasPlayed || isLoading) {
      return;
    }

    setIsLoading(true);
    setHasPlayed(true);

    try {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      console.log('🎵 ElevenLabs: Generating voice for:', text.substring(0, 50) + '...');

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.2,
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

      // Set audio properties
      audio.volume = 0.8;
      audio.preload = 'auto';

      // Add event listeners
      audio.addEventListener('ended', handleAudioEnd);
      audio.addEventListener('error', handleAudioError);

      // Play the audio
      console.log('🎵 ElevenLabs: Playing voice...');
      await audio.play();

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🎵 ElevenLabs: Request aborted');
        return;
      }

      console.error('🎵 ElevenLabs Error:', error);
      const errorMessage = error.message || 'Failed to generate voice';
      
      if (onError) {
        onError(errorMessage);
      }
      
      // Call onComplete even on error to prevent hanging
      if (onComplete) {
        onComplete();
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleAudioEnd = () => {
    console.log('🎵 ElevenLabs: Audio playback completed');
    cleanup();
    if (onComplete) {
      onComplete();
    }
  };

  const handleAudioError = (event: Event) => {
    console.error('🎵 ElevenLabs: Audio playback error:', event);
    cleanup();
    if (onError) {
      onError('Audio playback failed');
    }
    if (onComplete) {
      onComplete();
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default ElevenLabsVoice;