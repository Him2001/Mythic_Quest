import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { ChevronDown, LogOut, VolumeX, Volume2 } from 'lucide-react';

interface ProfileDropdownProps {
  user: User;
  onSignOut: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true); // Default to muted
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAudioMuted(!isAudioMuted);
    
    // Store audio preference in localStorage
    localStorage.setItem('mythic_audio_muted', (!isAudioMuted).toString());
    
    // You can add logic here to actually mute/unmute ElevenLabs audio
    if (!isAudioMuted) {
      // Mute audio - stop any playing audio and prevent new audio
      console.log('Audio muted - stopping all ElevenLabs audio');
    } else {
      // Unmute audio
      console.log('Audio unmuted - ElevenLabs audio enabled');
    }
  };

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    onSignOut();
  };

  // Load audio preference on mount
  useEffect(() => {
    const savedAudioMuted = localStorage.getItem('mythic_audio_muted');
    if (savedAudioMuted !== null) {
      setIsAudioMuted(savedAudioMuted === 'true');
    }
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-lg font-cinzel font-bold shadow-lg hover:shadow-xl transition-all duration-300 magical-glow"
      >
        <Avatar
          src={user.avatarUrl}
          alt={user.name}
          size="sm"
          className="border-2 border-white/30"
        />
        <div className="text-left hidden sm:block">
          <div className="text-sm font-bold">{user.name}</div>
          <div className="text-xs text-amber-100 flex items-center">
            Level {user.level}
            <Badge color="warning" size="sm" className="ml-2">
              {user.xp} XP
            </Badge>
          </div>
        </div>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-amber-200 z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 border-b border-amber-200">
            <div className="flex items-center space-x-3">
              <Avatar
                src={user.avatarUrl}
                alt={user.name}
                size="lg"
                className="border-2 border-amber-300"
              />
              <div className="flex-1">
                <h3 className="font-cinzel font-bold text-amber-800 text-lg">{user.name}</h3>
                <p className="text-amber-600 font-merriweather text-sm">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge color="accent" size="sm">
                    Level {user.level}
                  </Badge>
                  <span className="text-amber-700 font-cinzel text-sm">{user.xp} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-cinzel font-bold text-amber-600">{user.questsCompleted}</div>
                <div className="text-sm text-gray-600 font-merriweather">Quests</div>
              </div>
              <div>
                <div className="text-2xl font-cinzel font-bold text-amber-600">{user.mythicCoins}</div>
                <div className="text-sm text-gray-600 font-merriweather">Coins</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              {isAudioMuted ? (
                <VolumeX size={18} className="text-red-500 mr-3" />
              ) : (
                <Volume2 size={18} className="text-green-500 mr-3" />
              )}
              <span className={`font-cinzel ${isAudioMuted ? 'text-red-600' : 'text-green-600'}`}>
                {isAudioMuted ? 'Audio Muted (Dev)' : 'Audio Enabled'}
              </span>
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-red-50 rounded-lg transition-colors duration-200 text-red-600"
            >
              <LogOut size={18} className="mr-3" />
              <span className="font-cinzel">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;