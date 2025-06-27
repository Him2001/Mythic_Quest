import React, { useEffect, useRef } from 'react';

interface ElevenLabsVoiceProps {
  text: string;
  voiceId?: string;
  onComplete?: () => void;
}

const ElevenLabsVoice: React.FC<ElevenLabsVoiceProps> = ({ 
  text, 
  voiceId = 'MezYwaNLTOfydzsFJwwt',
  onComplete 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (!text || text.trim() === '' || isPlayingRef.current) return;

    const generateAndPlayAudio = async () => {
      try {
        isPlayingRef.current = true;
        
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
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
              style: 0.5,
              use_speaker_boost: true
            }
          })
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          isPlayingRef.current = false;
          if (onComplete) onComplete();
        };
        
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          isPlayingRef.current = false;
          console.warn('Audio playback failed');
        };
        
        await audio.play();
        
      } catch (error) {
        console.warn('ElevenLabs TTS failed:', error);
        isPlayingRef.current = false;
        if (onComplete) onComplete();
      }
    };

    generateAndPlayAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      isPlayingRef.current = false;
    };
  }, [text, voiceId, onComplete]);

  return null; // This component doesn't render anything visible
};

export default ElevenLabsVoice;