import React, { useEffect, useRef, useState } from 'react';

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Check mute state from localStorage
  useEffect(() => {
    const checkMuteState = () => {
      const savedMuteState = localStorage.getItem('mythic_audio_muted');
      setIsMuted(savedMuteState === 'true');
    };

    checkMuteState();

    // Listen for mute events
    const handleMuteEvent = () => {
      checkMuteState();
      // Stop current audio if muted
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (onComplete) {
        onComplete();
      }
    };

    window.addEventListener('muteAudio', handleMuteEvent);
    
    // Also listen for storage changes (in case mute state changes in another tab)
    window.addEventListener('storage', (e) => {
      if (e.key === 'mythic_audio_muted') {
        checkMuteState();
      }
    });

    return () => {
      window.removeEventListener('muteAudio', handleMuteEvent);
      window.removeEventListener('storage', checkMuteState);
    };
  }, [onComplete]);

  useEffect(() => {
    // Don't make API calls if muted
    if (isMuted) {
      console.log('Audio is muted, skipping ElevenLabs API call');
      if (onComplete) {
        onComplete();
      }
      return;
    }

    if (!text || !text.trim()) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.warn('ElevenLabs API key not configured');
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const generateSpeech = async () => {
      setIsLoading(true);
      setError(null);

      try {
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

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          
          // Check mute state again before playing
          const currentMuteState = localStorage.getItem('mythic_audio_muted');
          if (currentMuteState !== 'true') {
            await audioRef.current.play();
          } else {
            console.log('Audio muted during generation, not playing');
            if (onComplete) {
              onComplete();
            }
          }
        }
      } catch (err) {
        console.warn('ElevenLabs TTS error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate speech');
        if (onComplete) {
          onComplete();
        }
      } finally {
        setIsLoading(false);
      }
    };

    generateSpeech();
  }, [text, voiceId, onComplete, isMuted]);

  const handleAudioEnd = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const handleAudioError = () => {
    console.warn('Audio playback error');
    setError('Audio playback failed');
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={handleAudioError}
        style={{ display: 'none' }}
      />
      
      {/* Optional: Show loading/error states */}
      {isLoading && !isMuted && (
        <div className="fixed bottom-4 left-4 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-merriweather z-50">
          🎵 Generating voice...
        </div>
      )}
      
      {error && !isMuted && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-merriweather z-50">
          ⚠️ Voice error: {error}
        </div>
      )}

      {isMuted && (
        <div className="fixed bottom-4 left-4 bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-merriweather z-50">
          🔇 Audio muted (dev mode)
        </div>
      )}
    </>
  );
};

export default ElevenLabsVoice;