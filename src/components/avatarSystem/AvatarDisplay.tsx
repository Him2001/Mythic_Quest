import React, { useState, useEffect } from 'react';
import { Avatar as AvatarType } from '../../types';
import { Sparkles } from 'lucide-react';
import Avatar3D from './Avatar3D';

interface AvatarDisplayProps {
  avatar: AvatarType;
  message?: string;
  className?: string;
  isSpeaking?: boolean;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  message,
  className = '',
  isSpeaking = false
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
      {/* 3D Avatar with speaking animation */}
      <div className={`relative mb-4 transition-all duration-500 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
        {/* Magical particle effects around the avatar */}
        <div className="absolute inset-0 magical-particles pointer-events-none"></div>
        
        {/* Enhanced magical glow when speaking */}
        <div className={`absolute inset-0 transition-all duration-300 ${
          isSpeaking 
            ? 'bg-gradient-to-r from-amber-400/30 via-yellow-400/30 to-amber-400/30 animate-pulse' 
            : 'bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-purple-500/10'
        } rounded-full blur-xl pointer-events-none`}></div>
        
        {/* 3D Avatar with speaking state */}
        <div className="relative z-10 magical-glow">
          <Avatar3D className="relative z-10" isSpeaking={isSpeaking} />
        </div>
        
        {/* Enhanced magical overlay when speaking */}
        <div className={`absolute inset-0 transition-all duration-300 ${
          isSpeaking 
            ? 'bg-gradient-to-t from-amber-500/20 to-transparent' 
            : 'bg-gradient-to-t from-purple-500/10 to-transparent'
        } pointer-events-none`}></div>
        
        {/* Animated magical runes - more active when speaking */}
        <div className={`absolute inset-0 magical-runes pointer-events-none ${
          isSpeaking ? 'animate-spin' : ''
        }`}></div>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -top-2 -right-2 z-20">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Avatar name with enhanced styling when speaking */}
      <h3 className={`text-xl font-cinzel font-bold mb-2 transition-all duration-300 ${
        isSpeaking 
          ? 'text-amber-700 magical-glow animate-pulse' 
          : 'text-amber-800 magical-glow'
      }`}>
        {avatar.name}
      </h3>
      
      <p className={`text-sm mb-4 font-cinzel flex items-center transition-all duration-300 ${
        isSpeaking ? 'text-amber-600' : 'text-purple-700'
      }`}>
        <Sparkles size={14} className={`mr-1 ${isSpeaking ? 'text-amber-500 animate-pulse' : 'text-amber-500'}`} />
        {avatar.type.charAt(0).toUpperCase() + avatar.type.slice(1)} Guide
        {isSpeaking && <span className="ml-2 text-amber-500 animate-pulse">• Speaking</span>}
      </p>
      
      {/* Message scroll with enhanced styling when speaking */}
      {message && (
        <div className={`relative fantasy-border p-4 mb-4 w-full max-w-sm mx-auto transition-all duration-300 ${
          isSpeaking ? 'border-amber-300 bg-amber-50/50' : ''
        }`}>
          <div className="absolute top-0 left-6 transform -translate-y-2 rotate-45 w-3 h-3 bg-parchment-light"></div>
          <p className={`font-merriweather transition-all duration-300 ${
            isSpeaking ? 'text-amber-800' : 'text-gray-700'
          }`}>
            {displayMessage}
            <span className={`animate-pulse ${isSpeaking ? 'text-amber-600' : 'text-amber-500'}`}>|</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;