import React, { useEffect, useRef, useState } from 'react';

interface ElevenLabsVoiceProps {
  text: string;
  voiceId?: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const ElevenLabsVoice: React.FC<ElevenLabsVoiceProps> = ({
  text,
  voiceId = "MezYwaNLTOfydzsFJwwt", // Eldrin the Mage voice
  onComplete,
  onError
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // ElevenLabs API configuration
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const ELEVENLABS_API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  useEffect(() => {
    if (!text || !text.trim()) {
      return;
    }

    const generateSpeech = async () => {
      // Check if API key is available
      if (!ELEVENLABS_API_KEY) {
        console.log('🎵 ElevenLabs API Key Status: NOT CONFIGURED');
        console.log('🔑 Voice ID Available:', voiceId);
        console.log('📝 Text to Speak:', text.substring(0, 100) + '...');
        console.log('⚠️ ElevenLabs voice will not play - API key missing');
        
        // Call onComplete immediately since we can't play audio
        if (onComplete) {
          setTimeout(onComplete, 1000); // Simulate brief delay
        }
        return;
      }

      console.log('🎵 ElevenLabs API Key Status: CONFIGURED ✅');
      console.log('🔑 Voice ID:', voiceId);
      console.log('📝 Text to Speak:', text.substring(0, 100) + '...');

      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(ELEVENLABS_API_URL, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5,
              use_speaker_boost: true
            }
          })
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play().catch(playError => {
            console.error('Audio playback failed:', playError);
            if (onError) {
              onError(`Audio playback failed: ${playError.message}`);
            }
          });
        }

        console.log('🎵 ElevenLabs voice generation successful!');

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('ElevenLabs API error:', errorMessage);
        setError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    generateSpeech();
  }, [text, voiceId, ELEVENLABS_API_KEY, onComplete, onError]);

  const handleAudioEnd = () => {
    console.log('🎵 Voice playback completed');
    if (onComplete) {
      onComplete();
    }
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const errorMsg = 'Audio playback error occurred';
    console.error('Audio element error:', e);
    setError(errorMsg);
    
    if (onError) {
      onError(errorMsg);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={handleAudioError}
        style={{ display: 'none' }}
        preload="none"
      />
      
      {/* Debug info - only show in development */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs z-50">
          <div>🎵 ElevenLabs Status:</div>
          <div>API Key: {ELEVENLABS_API_KEY ? '✅ Configured' : '❌ Missing'}</div>
          <div>Voice ID: {voiceId}</div>
          {isLoading && <div>🔄 Generating speech...</div>}
          {error && <div className="text-red-400">❌ {error}</div>}
          {text && <div>📝 "{text.substring(0, 50)}..."</div>}
        </div>
      )}
    </>
  );
};

export default ElevenLabsVoice;