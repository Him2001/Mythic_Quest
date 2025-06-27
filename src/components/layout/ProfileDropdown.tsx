import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { ChevronDown, User as UserIcon, LogOut, Settings, Crown, VolumeX, Volume2 } from 'lucide-react';

interface ProfileDropdownProps {
  user: User;
  onSignOut: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load mute state from localStorage
  useEffect(() => {
    const savedMuteState = localStorage.getItem('mythic_audio_muted');
    if (savedMuteState === 'true') {
      setIsMuted(true);
    }
  }, []);

  const handleToggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    // Save to localStorage
    localStorage.setItem('mythic_audio_muted', newMuteState.toString());
    
    // Stop any currently playing audio
    if (newMuteState) {
      // Stop all audio elements
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      
      // Clear any pending audio requests
      window.dispatchEvent(new CustomEvent('muteAudio'));
    }
    
    console.log(`Audio ${newMuteState ? 'muted' : 'unmuted'} for development`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
      >
        <Avatar
          src={user.avatarUrl}
          alt={user.name}
          size="sm"
          className="border-2 border-amber-400"
        />
        <div className="hidden md:block text-left">
          <div className="flex items-center space-x-2">
            <span className="text-amber-100 font-cinzel font-bold text-sm">{user.name}</span>
            {user.isAdmin && (
              <Crown size={14} className="text-yellow-400" title="Admin" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge color="accent" size="sm">Level {user.level}</Badge>
            <span className="text-amber-200 text-xs font-merriweather">{user.xp} XP</span>
          </div>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-amber-200 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Avatar
                src={user.avatarUrl}
                alt={user.name}
                size="md"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-cinzel font-bold text-gray-800">{user.name}</h3>
                  {user.isAdmin && (
                    <Crown size={16} className="text-yellow-500" title="Admin" />
                  )}
                </div>
                <p className="text-sm text-gray-600 font-merriweather">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge color="accent" size="sm">Level {user.level}</Badge>
                  <span className="text-xs text-gray-500 font-merriweather">{user.xp} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-amber-600 font-cinzel">{user.questsCompleted}</div>
                <div className="text-xs text-gray-600 font-merriweather">Quests</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-600 font-cinzel">{user.mythicCoins}</div>
                <div className="text-xs text-gray-600 font-merriweather">Coins</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
              <UserIcon size={16} className="text-gray-500" />
              <span className="text-gray-700 font-merriweather">Profile Settings</span>
            </button>
            
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
              <Settings size={16} className="text-gray-500" />
              <span className="text-gray-700 font-merriweather">Preferences</span>
            </button>

            {/* Mute Button */}
            <button 
              onClick={handleToggleMute}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3"
            >
              {isMuted ? (
                <VolumeX size={16} className="text-red-500" />
              ) : (
                <Volume2 size={16} className="text-green-500" />
              )}
              <span className={`font-merriweather ${isMuted ? 'text-red-600' : 'text-green-600'}`}>
                {isMuted ? 'Audio Muted (Dev)' : 'Audio Enabled'}
              </span>
            </button>
            
            <div className="border-t border-gray-100 my-2"></div>
            
            <button 
              onClick={onSignOut}
              className="w-full px-4 py-2 text-left hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3 text-red-600"
            >
              <LogOut size={16} />
              <span className="font-merriweather">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;