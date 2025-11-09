import React, { useEffect, useRef, useState } from 'react';
import { ElevenLabsService } from '../../utils/elevenLabsService';
import { VoiceConfigService } from '../../utils/voiceConfigService';
import { AudioContextManager } from '../../utils/audioContextManager';

interface ElevenLabsVoiceProps {
  text: string;
  voiceId?: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
  onSpeakingChange?: (speaking: boolean) => void;
}

const ElevenLabsVoice: React.FC<ElevenLabsVoiceProps> = ({
  text,
  voiceId,
  onComplete,
  onError,
  onSpeakingChange
}) => {
  const hasStartedRef = useRef(false);
  const componentMountedRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Cleanup function
  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  // Generate speech using Eleven Labs
  const generateElevenLabsSpeech = async () => {
    const config = VoiceConfigService.getConfig();

    if (onSpeakingChange) onSpeakingChange(true);

    // Generate audio using Eleven Labs
    const audioUrl = await ElevenLabsService.generateAudio(text, voiceId || config.voiceId);

    if (!audioUrl) {
      console.log('🎵 Eleven Labs generation failed, falling back to Web Speech API');
      await fallbackToWebSpeech();
      return;
    }

    // Initialize audio context for background playback
    await AudioContextManager.initialize();

    // Create audio element with background playback support
    const audio = AudioContextManager.createAudio(audioUrl);
    audioRef.current = audio;

    audio.volume = config.volume;

    audio.onloadstart = () => {
      console.log('🎵 Loading Eleven Labs audio...');
    };

    audio.oncanplay = () => {
      console.log('🎵 Eleven Labs audio ready to play');
    };

    audio.onplay = () => {
      console.log('🎵 Eleven Labs audio started playing');
      setIsGenerating(false);
    };

    audio.onended = () => {
      console.log('🎵 Eleven Labs audio completed');
      if (onSpeakingChange) onSpeakingChange(false);
      if (onComplete) onComplete();
      cleanup();
    };

    audio.onerror = (event) => {
      console.error('🎵 Eleven Labs audio playback error:', event);
      setIsGenerating(false);
      if (onSpeakingChange) onSpeakingChange(false);
      if (onError) onError('Audio playback failed');
      cleanup();
    };

    // Start playing
    await audio.play();
  };

  // Fallback to Web Speech API
  const fallbackToWebSpeech = async () => {
    try {
      const config = VoiceConfigService.getConfig();
      const utterance = new SpeechSynthesisUtterance(text);

      // Configure for wizard-like voice using config
      utterance.rate = config.speed;
      utterance.pitch = 0.32;
      utterance.volume = config.volume;

      // Try to find a suitable voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(v => 
          v.lang === 'en-GB' && /male|daniel|george|brian|richard/i.test(v.name)
        ) || voices.find(v => v.lang === 'en-GB') ||
           voices.find(v => /male|david|george|mark|barry|richard/i.test(v.name)) ||
           voices.find(v => v.lang.startsWith('en-'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => {
        console.log('🎵 Web Speech API started');
        setIsGenerating(false);
        if (onSpeakingChange) onSpeakingChange(true);
      };

      utterance.onend = () => {
        console.log('🎵 Web Speech API completed');
        if (onSpeakingChange) onSpeakingChange(false);
        if (onComplete) onComplete();
      };

      utterance.onerror = (event) => {
        console.error('🎵 Web Speech API error:', event);
        setIsGenerating(false);
        if (onSpeakingChange) onSpeakingChange(false);
        if (onError) onError(`Speech failed: ${event.error}`);
      };

      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('🎵 Web Speech API fallback failed:', error);
      setIsGenerating(false);
      if (onSpeakingChange) onSpeakingChange(false);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Speech generation failed');
      }
    }
  };

  // Generate and play speech
  const generateAndPlaySpeech = async () => {
    if (!text.trim() || hasStartedRef.current || !componentMountedRef.current) {
      return;
    }

    // Check if voice is enabled
    const voiceStatus = VoiceConfigService.getVoiceStatus();
    if (!voiceStatus.available) {
      console.log('🎵 Voice services disabled or unavailable');
      return;
    }

    hasStartedRef.current = true;
    setIsGenerating(true);

    try {
      console.log('🎵 Generating speech using:', voiceStatus.service);

      // Use Eleven Labs if available and preferred
      if (voiceStatus.service === 'elevenlabs') {
        await generateElevenLabsSpeech();
      } else {
        await fallbackToWebSpeech();
      }
    } catch (error) {
      console.error('🎵 Speech generation error:', error);
      setIsGenerating(false);
      
      // Fallback to Web Speech API
      console.log('🎵 Falling back to Web Speech API due to error');
      await fallbackToWebSpeech();
    }
  };

  // Start generation when component mounts
  useEffect(() => {
    componentMountedRef.current = true;
    generateAndPlaySpeech();

    return () => {
      componentMountedRef.current = false;
      cleanup();
    };
  }, [text, voiceId]);

  // Handle page visibility change - ensure audio continues in background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && audioRef.current) {
        console.log('🎵 Tab hidden, keeping audio alive');
        // Prevent audio from pausing when tab is hidden
        audioRef.current.play().catch(console.error);
      } else if (!document.hidden && audioRef.current) {
        console.log('🎵 Tab visible, audio should continue');
        // Ensure audio resumes when tab becomes visible again
        if (audioRef.current.paused) {
          audioRef.current.play().catch(console.error);
        }
      }
    };

    const handleBeforeUnload = () => {
      // Keep audio context alive during navigation
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Ignore errors during unload
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Render loading indicator if generating
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400"></div>
        <span className="ml-2 text-xs text-amber-400">Generating voice...</span>
      </div>
    );
  }

  return null;
};

export default ElevenLabsVoice;