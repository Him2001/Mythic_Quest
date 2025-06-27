import React, { useEffect, useState } from 'react';

interface ElevenLabsVoiceProps {
  text: string;
  voiceId?: string;
  onComplete?: () => void;
}

const ElevenLabsVoice: React.FC<ElevenLabsVoiceProps> = ({
  text,
  voiceId = 'MezYwaNLTOfydzsFJwwt', // Default voice ID
  onComplete
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if audio is muted
    const isAudioMuted = localStorage.getItem('mythic_audio_muted');
    if (isAudioMuted === 'true') {
      console.log('Audio is muted, skipping ElevenLabs API call');
      onComplete?.();
      return;
    }

    if (!text || text.trim() === '') {
      onComplete?.();
      return;
    }

    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.warn('ElevenLabs API key not configured');
      onComplete?.();
      return;
    }

    const generateSpeech = async () => {
      try {
        setIsPlaying(true);

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
              similarity_boost: 0.5
            }
          })
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audioElement = new Audio(audioUrl);
        setAudio(audioElement);

        audioElement.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          onComplete?.();
        };

        audioElement.onerror = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          onComplete?.();
        };

        // Check again if audio is muted before playing (in case it was muted during API call)
        const currentMuteState = localStorage.getItem('mythic_audio_muted');
        if (currentMuteState === 'true') {
          console.log('Audio was muted during API call, not playing');
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          onComplete?.();
          return;
        }

        await audioElement.play();
      } catch (error) {
        console.warn('ElevenLabs speech generation failed:', error);
        setIsPlaying(false);
        onComplete?.();
      }
    };

    generateSpeech();

    // Cleanup function
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [text, voiceId, onComplete]);

  // Stop audio if muted while playing
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mythic_audio_muted' && e.newValue === 'true' && audio && isPlaying) {
        console.log('Audio muted while playing, stopping current audio');
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        onComplete?.();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [audio, isPlaying, onComplete]);

  // Manual check for mute state changes (for same-tab changes)
  useEffect(() => {
    const checkMuteState = () => {
      const isAudioMuted = localStorage.getItem('mythic_audio_muted');
      if (isAudioMuted === 'true' && audio && isPlaying) {
        console.log('Audio muted, stopping current audio');
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        onComplete?.();
      }
    };

    const interval = setInterval(checkMuteState, 500);
    return () => clearInterval(interval);
  }, [audio, isPlaying, onComplete]);

  return null; // This component doesn't render anything visible
};

export default ElevenLabsVoice;