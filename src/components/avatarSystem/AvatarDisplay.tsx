import React, { useState, useEffect } from 'react';
import { Avatar as AvatarType } from '../../types';
import { Sparkles } from 'lucide-react';
import Avatar3D from './Avatar3D';

interface AvatarDisplayProps {
  avatar: AvatarType;
  message?: string;
  className?: string;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  message,
  className = ''
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
      {/* 3D Avatar without circle - just magical effects */}
      <div className={`relative mb-4 transition-all duration-500 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
        {/* Magical particle effects around the avatar */}
        <div className="absolute inset-0 magical-particles pointer-events-none"></div>
        
        {/* 3D Avatar - no border, no circle */}
        <div className="relative z-10 magical-glow">
          <Avatar3D className="relative z-10" />
        </div>
        
        {/* Magical overlay effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none"></div>
        
        {/* Animated magical runes around the avatar */}
        <div className="absolute inset-0 magical-runes pointer-events-none"></div>
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
    </div>
  );
};

export default AvatarDisplay;