import React, { useEffect, useRef } from 'react';

interface SimpleElevenLabsVoiceProps {
  text: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const SimpleElevenLabsVoice: React.FC<SimpleElevenLabsVoiceProps> = ({
  text,
  onComplete,
  onError
}) => {
  const hasStartedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'MezYwaNLTOfydzsFJwwt';

  const generateAndPlayVoice = async () => {
    if (!text.trim() || hasStartedRef.current) {
      return;
    }

    if (!ELEVENLABS_API_KEY) {
      console.error('❌ Eleven Labs API key not found');
      onError?.('Eleven Labs API key not configured');
      return;
    }

    hasStartedRef.current = true;

    try {
      console.log(`🎵 Generating Eleven Labs voice for: "${text.substring(0, 50)}..."`);

      // Call Eleven Labs API directly
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Eleven Labs API error: ${response.status} ${response.statusText}`);
      }

      // Convert to audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadstart = () => {
        console.log('🎵 Loading Eleven Labs audio...');
      };

      audio.onplay = () => {
        console.log('🎵 ✅ Eleven Labs voice started playing');
      };

      audio.onended = () => {
        console.log('🎵 ✅ Eleven Labs voice completed');
        URL.revokeObjectURL(audioUrl); // Clean up
        if (onComplete) onComplete();
      };

      audio.onerror = (event) => {
        console.error('🎵 ❌ Audio playback error:', event);
        URL.revokeObjectURL(audioUrl); // Clean up
        if (onError) onError('Audio playback failed');
      };

      // Start playing
      try {
        await audio.play();
        console.log('🎵 ✅ Eleven Labs voice generation successful');
      } catch (playError) {
        console.warn('🎵 ⚠️ Autoplay blocked by browser - user interaction required');
        
        // Try to play on next user interaction
        const playOnInteraction = () => {
          audio.play().then(() => {
            console.log('🎵 ✅ Voice playing after user interaction');
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          });
        };
        
        document.addEventListener('click', playOnInteraction, { once: true });
        document.addEventListener('touchstart', playOnInteraction, { once: true });
      }

    } catch (error) {
      console.error('🎵 ❌ Eleven Labs generation failed:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Voice generation failed');
      }
    }
  };

  // Start voice generation when component mounts
  useEffect(() => {
    // Add a small delay to ensure proper rendering
    const timer = setTimeout(() => {
      generateAndPlayVoice();
    }, 100);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [text]);

  // This component doesn't render anything visible
  return null;
};

export default SimpleElevenLabsVoice;