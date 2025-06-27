import React, { useEffect, useRef } from 'react';

interface ElevenLabsVoiceProps {
  text: string;
  voiceId: string;
  onComplete?: () => void;
  onError?: () => void;
}

const ElevenLabsVoice: React.FC<ElevenLabsVoiceProps> = ({
  text,
  voiceId,
  onComplete,
  onError
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (!text || isPlayingRef.current) return;

    const playVoice = async () => {
      try {
        isPlayingRef.current = true;
        console.log('Starting voice synthesis for:', text.substring(0, 50) + '...');

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': 'sk_5731b10034638f20dc444a14b1a2ec440a5493af3b8a9f72'
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
          })
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create and play audio
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          console.log('Voice playback completed');
          isPlayingRef.current = false;
          URL.revokeObjectURL(audioUrl);
          if (onComplete) onComplete();
        };
        
        audio.onerror = () => {
          console.error('Audio playback error');
          isPlayingRef.current = false;
          URL.revokeObjectURL(audioUrl);
          if (onError) onError();
        };
        
        await audio.play();
        console.log('Voice playback started');
        
      } catch (error) {
        console.error('ElevenLabs voice synthesis error:', error);
        isPlayingRef.current = false;
        if (onError) onError();
      }
    };

    playVoice();

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      isPlayingRef.current = false;
    };
  }, [text, voiceId, onComplete, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      isPlayingRef.current = false;
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default ElevenLabsVoice;