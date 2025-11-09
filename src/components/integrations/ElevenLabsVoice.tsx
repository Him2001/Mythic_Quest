import React, { useEffect, useRef, useState } from 'react';

interface WebSpeechVoiceProps {
  text: string;
  voiceId?: string; // Optional: voice name or language code
  onComplete?: () => void;
  onError?: (error: string) => void;
  onSpeakingChange?: (speaking: boolean) => void;
}

const WebSpeechVoice: React.FC<WebSpeechVoiceProps> = ({
  text,
  voiceId,
  onComplete,
  onError,
  onSpeakingChange
}) => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasStartedRef = useRef(false);
  const componentMountedRef = useRef(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      console.log('🎵 Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Cleanup function
  const cleanup = () => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
  };

  // Generate and play speech
  const generateAndPlaySpeech = () => {
    if (!text.trim() || hasStartedRef.current || !componentMountedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    try {
      console.log('🎵 Generating speech for text:', text.substring(0, 50) + '...');

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Find and set voice
      if (voiceId && voices.length > 0) {
        const selectedVoice = voices.find(
          voice => voice.name === voiceId || voice.lang.includes(voiceId)
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('🎵 Using voice:', selectedVoice.name);
        }
      }

      // Configure speech parameters
      // More animated/energetic
      // In the generateAndPlaySpeech function, replace the configuration section:

      // Configure speech parameters - Male with deep bass
     // Configure speech parameters - Wizard voice
// Old man Gandalf voice - ancient, wise, deep
// 1) Core Gandalf baseline (deep but still natural)
utterance.rate = 0.7;      // Slow, but not robotic
utterance.pitch = 0.32;    // Very deep
utterance.volume = 0.95;   // Strong presence

// 2) Prefer British male voices (sounds closer to Gandalf)
if (voices.length > 0) {
  const preferredOrder = [
    // Common deeper UK/male labels across browsers
    (v: SpeechSynthesisVoice) => v.lang === 'en-GB' && /male|daniel|george|brian|richard/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang === 'en-GB',
    (v: SpeechSynthesisVoice) => /male|david|george|mark|barry|richard/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en-')
  ];

  let selected: SpeechSynthesisVoice | undefined;
  for (const pick of preferredOrder) {
    selected = voices.find(pick as any);
    if (selected) break;
  }

  if (selected) {
    utterance.voice = selected;
    console.log('🧙 Using deep UK/male voice:', selected.name, selected.lang);
  } else {
    console.log('🧙 Defaulting to any English voice');
  }
}

// 3) Subtle anti-robot tweaks
utterance.onstart = () => {
  // Start slightly quieter then ramp to full to avoid “AI pop-in”
  try { utterance.volume = 0.9; setTimeout(() => { utterance.volume = 0.95; }, 120); } catch {}
};

      utterance.onend = () => {
        console.log('🎵 Speech completed');
        if (onSpeakingChange) onSpeakingChange(false);
        if (onComplete) onComplete();
        cleanup();
      };

      utterance.onerror = (event) => {
        console.error('🎵 Speech error:', event);
        if (onSpeakingChange) onSpeakingChange(false);
        if (onError) onError(`Speech failed: ${event.error}`);
        cleanup();
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);
      console.log('🎵 Speech generation started');

    } catch (error) {
      console.error('🎵 Failed to generate speech:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
      if (onSpeakingChange) onSpeakingChange(false);
    }
  };

  // Start generation when component mounts and voices are loaded
  useEffect(() => {
    componentMountedRef.current = true;
    
    if (voices.length > 0) {
      generateAndPlaySpeech();
    }

    return () => {
      componentMountedRef.current = false;
      cleanup();
    };
  }, [text, voiceId, voices]);

  // Handle page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && utteranceRef.current) {
        console.log('🎵 Tab hidden, speech continues in background');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
};

export default WebSpeechVoice;