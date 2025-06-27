import React, { useState, useEffect } from 'react';
import { Avatar as AvatarType } from '../../types';
import Button from '../ui/Button';
import WarriorModelViewer from '../3d/WarriorModel';
import { MessageCircle, Volume2, Sparkles } from 'lucide-react';

interface AvatarDisplayProps {
  avatar: AvatarType;
  message?: string;
  className?: string;
  onSpeak?: () => void;
  onMessage?: () => void;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  message,
  className = '',
  onSpeak,
  onMessage
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);

  // Animate the avatar on mount
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Typing effect for the message
  useEffect(() => {
    if (!message || typingIndex >= message.length) return;
    
    const timer = setTimeout(() => {
      setDisplayMessage(prev => prev + message[typingIndex]);
      setTypingIndex(typingIndex + 1);
    }, 35);
    
    return () => clearTimeout(timer);
  }, [message, typingIndex]);

  // Reset typing when message changes
  useEffect(() => {
    if (message) {
      setDisplayMessage('');
      setTypingIndex(0);
    }
  }, [message]);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* 3D Warrior Model */}
      <div className={`relative mb-4 transition-all duration-500 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-amber-500/20 to-purple-500/20 animate-pulse rounded-lg"></div>
        <div className="absolute inset-0 magical-particles"></div>
        <div className="relative z-10 border-4 border-amber-500/50 magical-glow rounded-lg overflow-hidden">
          <WarriorModelViewer className="w-56 h-56 sm:w-64 sm:h-64" />
          
          {/* Magical overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent pointer-events-none"></div>
          
          {/* Animated runes */}
          <div className="absolute inset-0 magical-runes pointer-events-none"></div>
        </div>
      </div>
      
      {/* Avatar name with magical styling */}
      <h3 className="text-xl font-cinzel font-bold text-amber-800 mb-2 magical-glow">{avatar.name}</h3>
      <p className="text-sm text-purple-700 mb-4 font-cinzel flex items-center">
        <Sparkles size={14} className="mr-1 text-amber-500" />
        {avatar.type.charAt(0).toUpperCase() + avatar.type.slice(1)} Guide
      </p>
      
      {/* Message scroll */}
      {message && (
        <div className="relative fantasy-border p-4 mb-4 w-full max-w-sm mx-auto">
          <div className="absolute top-0 left-6 transform -translate-y-2 rotate-45 w-3 h-3 bg-parchment-light"></div>
          <p className="text-gray-700 font-merriweather">
            {displayMessage}
            <span className="animate-pulse text-amber-500">|</span>
          </p>
        </div>
      )}
      
      {/* Interaction buttons */}
      <div className="flex space-x-3 mt-2">
        <Button 
          variant="outline" 
          size="sm"
          icon={<Volume2 size={16} />}
          onClick={onSpeak}
          className="magical-glow"
        >
          Speak
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          icon={<MessageCircle size={16} />}
          onClick={onMessage}
          className="magical-glow"
        >
          Message
        </Button>
      </div>
    </div>
  );
};

export default AvatarDisplay;