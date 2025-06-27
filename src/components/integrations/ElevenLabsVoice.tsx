import React, { useEffect, useState } from 'react';

interface ElevenLabsVoiceProps {
  text: string;
  voiceId?: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const ElevenLabsVoice: React.FC<ElevenLabsVoiceProps> = ({
  text,
  voiceId = 'MezYwaNLTOfydzsFJwwt', // Eldrin the Mage
  onComplete,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');

  // Use the provided API key directly
  const API_KEY = 'sk_2373d20772128d71bfc6997232f631eed0f769241a18c032';

  useEffect(() => {
    if (!text || !text.trim()) return;

    const generateSpeech = async () => {
      setIsLoading(true);
      setError('');

      try {
        console.log('🎵 Generating ElevenLabs voice for:', text.substring(0, 50) + '...');
        
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': API_KEY
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5,
              use_speaker_boost: true
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);

        // Create and play audio
        const audio = new Audio(audioUrl);
        
        audio.onloadeddata = () => {
          console.log('🎵 Audio loaded, playing voice...');
          audio.play().catch(playError => {
            console.error('Audio play error:', playError);
            if (onError) onError(`Failed to play audio: ${playError.message}`);
          });
        };

        audio.onended = () => {
          console.log('🎵 Voice playback completed');
          URL.revokeObjectURL(audioUrl);
          if (onComplete) onComplete();
        };

        audio.onerror = (audioError) => {
          console.error('Audio error:', audioError);
          URL.revokeObjectURL(audioUrl);
          if (onError) onError('Audio playback failed');
        };

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('ElevenLabs error:', errorMessage);
        setError(errorMessage);
        if (onError) onError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    generateSpeech();

    // Cleanup function
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [text, voiceId, API_KEY, onComplete, onError]);

  // Debug panel (only in development)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs z-50">
        <div className="text-green-400 font-bold mb-1">🎵 ElevenLabs Voice Debug</div>
        <div>API Key: ✅ Configured</div>
        <div>Voice ID: {voiceId}</div>
        <div>Status: {isLoading ? '🔄 Generating...' : error ? '❌ Error' : '✅ Ready'}</div>
        {error && <div className="text-red-400 mt-1">Error: {error}</div>}
        {text && (
          <div className="mt-2 p-2 bg-gray-800 rounded">
            <div className="text-yellow-400 text-xs">Current Text:</div>
            <div className="text-gray-300 text-xs">{text.substring(0, 100)}...</div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ElevenLabsVoice;