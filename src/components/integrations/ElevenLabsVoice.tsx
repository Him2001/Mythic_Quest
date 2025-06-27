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
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = 'sk_2373d20772128d71bfc6997232f631eed0f769241a18c032';

  useEffect(() => {
    if (!text || !text.trim()) {
      return;
    }

    generateAndPlayVoice();
  }, [text]);

  const generateAndPlayVoice = async () => {
    if (!API_KEY) {
      const errorMsg = 'ElevenLabs API key not configured';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      console.log('🎵 Generating voice for:', text.substring(0, 50) + '...');
      
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
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.2,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);

      // Create and play audio
      const audio = new Audio(audioUrl);
      audio.volume = 0.8; // Set volume to 80%
      
      audio.onended = () => {
        console.log('🎵 Voice playback completed');
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        onComplete?.();
      };

      audio.onerror = (e) => {
        console.error('🎵 Audio playback error:', e);
        const errorMsg = 'Audio playback failed';
        setError(errorMsg);
        onError?.(errorMsg);
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      };

      console.log('🎵 Playing voice...');
      await audio.play();

    } catch (error) {
      console.error('🎵 ElevenLabs voice generation error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Voice generation failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Debug info (only in development)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
        <div className="mb-2">
          <strong>🎵 ElevenLabs Voice Status:</strong>
        </div>
        <div>API Key: ✅ Active</div>
        <div>Voice ID: {voiceId}</div>
        <div>Status: {isGenerating ? '🔄 Generating...' : audioUrl ? '🔊 Playing' : '⏸️ Ready'}</div>
        {error && <div className="text-red-400">❌ Error: {error}</div>}
        {text && (
          <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
            <strong>Current Text:</strong><br />
            {text.substring(0, 100)}{text.length > 100 ? '...' : ''}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ElevenLabsVoice;