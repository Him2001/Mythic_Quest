import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { ChevronDown, User as UserIcon, LogOut, Volume2, VolumeX } from 'lucide-react';
import CoinDisplay from '../ui/CoinDisplay';
import Badge from '../ui/Badge';

interface ProfileDropdownProps {
  user: User;
  onSignOut: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(() => {
    // Get initial mute state from localStorage
    const saved = localStorage.getItem('mythic_audio_muted');
    return saved ? JSON.parse(saved) : true; // Default to muted
  });

  // Save audio preference to localStorage
  useEffect(() => {
    localStorage.setItem('mythic_audio_muted', JSON.stringify(isAudioMuted));
    
    // Dispatch custom event to notify other components about audio state change
    window.dispatchEvent(new CustomEvent('audioStateChanged', { 
      detail: { muted: isAudioMuted } 
    }));
  }, [isAudioMuted]);

  const toggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    onSignOut();
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-4 py-2 rounded-lg font-cinzel font-bold shadow-lg hover:shadow-xl transition-all duration-300 magical-glow"
      >
        <CoinDisplay coins={user.mythicCoins} size="sm" />
        
        <div className="flex items-center space-x-2">
          <img 
            src={user.avatarUrl} 
            alt={user.name}
            className="w-8 h-8 rounded-full border-2 border-amber-200"
          />
          <div className="text-left hidden sm:block">
            <div className="text-sm font-bold">{user.name}</div>
            <div className="text-xs text-amber-200">Level {user.level}</div>
          </div>
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-amber-200 z-50 overflow-hidden">
            {/* User Info Header */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 border-b border-amber-200">
              <div className="flex items-center space-x-3">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-amber-300"
                />
                <div className="flex-1">
                  <h3 className="font-cinzel font-bold text-amber-800">{user.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge color="accent" size="sm">Level {user.level}</Badge>
                    <span className="text-xs text-amber-600 font-merriweather">
                      {user.xp} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Audio Toggle */}
              <button
                onClick={toggleAudio}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3"
              >
                {isAudioMuted ? (
                  <VolumeX size={18} className="text-red-500" />
                ) : (
                  <Volume2 size={18} className="text-green-500" />
                )}
                <span className="font-merriweather text-gray-700">
                  {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                </span>
              </button>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3 text-red-600"
              >
                <LogOut size={18} />
                <span className="font-merriweather">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileDropdown;