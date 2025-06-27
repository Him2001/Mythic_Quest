import React, { useEffect, useState } from 'react';

interface ElevenLabsVoiceProps {
  text: string;
  voiceId: string;
  onComplete?: () => void;
  onError?: () => void;
  onRateLimitExceeded?: () => void;
}

const ElevenLabsVoice: React.FC<ElevenLabsVoiceProps> = ({ 
  text, 
  voiceId, 
  onComplete, 
  onError,
  onRateLimitExceeded 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!text || text.trim() === '') return;

    const playVoice = async () => {
      try {
        setIsPlaying(true);
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
              similarity_boost: 0.5
            }
          })
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.error('ElevenLabs rate limit exceeded');
            if (onRateLimitExceeded) {
              onRateLimitExceeded();
            }
            return;
          }
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        setCurrentAudio(audio);

        audio.onended = () => {
          console.log('Voice playback completed successfully');
          URL.revokeObjectURL(audioUrl);
          setIsPlaying(false);
          setCurrentAudio(null);
          if (onComplete) {
            onComplete();
          }
        };

        audio.onerror = (error) => {
          console.error('Audio playback error:', error);
          URL.revokeObjectURL(audioUrl);
          setIsPlaying(false);
          setCurrentAudio(null);
          if (onError) {
            onError();
          }
        };

        await audio.play();
        console.log('Voice playback started');

      } catch (error) {
        console.error('ElevenLabs voice synthesis error:', error);
        setIsPlaying(false);
        setCurrentAudio(null);
        if (onError) {
          onError();
        }
      }
    };

    playVoice();

    // Cleanup function
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
      }
      setIsPlaying(false);
    };
  }, [text, voiceId, onComplete, onError, onRateLimitExceeded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    };
  }, [currentAudio]);

  return null; // This component doesn't render anything visible
};

export default ElevenLabsVoice;