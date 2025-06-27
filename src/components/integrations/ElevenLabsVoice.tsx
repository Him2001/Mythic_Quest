import React, { useEffect, useState, useRef } from 'react';

interface ElevenLabsVoiceProps {
  text: string;
  voiceId?: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const ElevenLabsVoice: React.FC<ElevenLabsVoiceProps> = ({
  text,
  voiceId = "MezYwaNLTOfydzsFJwwt", // Default voice ID
  onComplete,
  onError
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Listen for audio state changes
  useEffect(() => {
    const handleAudioStateChange = (event: CustomEvent) => {
      setIsAudioMuted(event.detail.muted);
    };

    // Get initial state
    const saved = localStorage.getItem('mythic_audio_muted');
    setIsAudioMuted(saved ? JSON.parse(saved) : true);

    // Listen for changes
    window.addEventListener('audioStateChanged', handleAudioStateChange as EventListener);

    return () => {
      window.removeEventListener('audioStateChanged', handleAudioStateChange as EventListener);
    };
  }, []);

  // Generate and play speech when text changes and audio is not muted
  useEffect(() => {
    if (!text || text.trim() === '' || isAudioMuted) {
      if (onComplete) onComplete();
      return;
    }

    generateSpeech();

    return () => {
      // Cleanup on unmount or text change
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [text, isAudioMuted]);

  const generateSpeech = async () => {
    if (isAudioMuted) {
      if (onComplete) onComplete();
      return;
    }

    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.warn('ElevenLabs API key not configured');
      if (onComplete) onComplete();
      return;
    }

    try {
      setIsPlaying(true);
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
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
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        if (onComplete) onComplete();
      };
      
      audio.onerror = (error) => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback error:', error);
        if (onError) onError('Audio playback failed');
        if (onComplete) onComplete();
      };

      // Set volume based on user preference
      audio.volume = 0.7;
      
      await audio.play();
      
    } catch (error) {
      setIsPlaying(false);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Speech generation aborted');
          return;
        }
        
        console.error('ElevenLabs TTS error:', error.message);
        if (onError) onError(error.message);
      } else {
        console.error('Unknown TTS error:', error);
        if (onError) onError('Unknown error occurred');
      }
      
      if (onComplete) onComplete();
    }
  };

  // Don't render anything visible - this is just for audio
  return null;
};

export default ElevenLabsVoice;