import React, { useEffect, useState, useRef } from 'react';

interface ElevenLabsVoiceProps {
  text: string;
  voiceId: string;
  onComplete?: () => void;
  autoPlay?: boolean;
}

const ElevenLabsVoice: React.FC<ElevenLabsVoiceProps> = ({
  text,
  voiceId,
  onComplete,
  autoPlay = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentText, setCurrentText] = useState<string>('');

  // Listen for voice message events
  useEffect(() => {
    const handleVoiceMessage = (event: CustomEvent) => {
      const { text: messageText } = event.detail;
      if (messageText && messageText !== currentText) {
        setCurrentText(messageText);
        playVoice(messageText);
      }
    };

    window.addEventListener('playVoiceMessage', handleVoiceMessage as EventListener);
    
    return () => {
      window.removeEventListener('playVoiceMessage', handleVoiceMessage as EventListener);
    };
  }, [currentText]);

  // Play voice when text changes and autoPlay is enabled
  useEffect(() => {
    if (text && text !== currentText && autoPlay) {
      setCurrentText(text);
      playVoice(text);
    }
  }, [text, autoPlay, currentText]);

  const playVoice = async (textToSpeak: string) => {
    if (!textToSpeak || textToSpeak.trim() === '') {
      if (onComplete) onComplete();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': 'sk_5731b10034638f20dc444a14b1a2ec440a5493af3b8a9f72'
        },
        body: JSON.stringify({
          text: textToSpeak,
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

      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleAudioEnd);
        audioRef.current.removeEventListener('error', handleAudioError);
      }

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event listeners
      const handleAudioEnd = () => {
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
        
        // Import VoiceMessageService dynamically to avoid circular imports
        import('../../utils/voiceMessageService').then(({ VoiceMessageService }) => {
          VoiceMessageService.onVoicePlaybackComplete();
        });
        
        if (onComplete) {
          onComplete();
        }
      };

      const handleAudioError = (e: Event) => {
        setIsLoading(false);
        setError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
        
        // Import VoiceMessageService dynamically to avoid circular imports
        import('../../utils/voiceMessageService').then(({ VoiceMessageService }) => {
          VoiceMessageService.onVoicePlaybackComplete();
        });
        
        if (onComplete) {
          onComplete();
        }
      };

      audio.addEventListener('ended', handleAudioEnd);
      audio.addEventListener('error', handleAudioError);

      // Play the audio
      await audio.play();

    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('ElevenLabs TTS Error:', err);
      
      // Import VoiceMessageService dynamically to avoid circular imports
      import('../../utils/voiceMessageService').then(({ VoiceMessageService }) => {
        VoiceMessageService.onVoicePlaybackComplete();
      });
      
      if (onComplete) {
        onComplete();
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current.removeEventListener('error', () => {});
      }
    };
  }, []);

  // Don't render anything visible
  return null;
};

export default ElevenLabsVoice;