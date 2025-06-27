import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import { ChevronDown, LogOut, Volume2, VolumeX } from 'lucide-react';

interface ProfileDropdownProps {
  user: User;
  onSignOut: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  // Load audio preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('mythic_audio_muted');
    setIsAudioMuted(saved ? JSON.parse(saved) : true);
  }, []);

  const toggleAudio = () => {
    const newMutedState = !isAudioMuted;
    setIsAudioMuted(newMutedState);
    localStorage.setItem('mythic_audio_muted', JSON.stringify(newMutedState));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('audioStateChanged', {
      detail: { muted: newMutedState }
    }));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-amber-600/20 hover:bg-amber-600/30 px-3 py-2 rounded-lg transition-colors duration-200"
      >
        <Avatar
          src={user.avatarUrl}
          alt={user.name}
          size="sm"
        />
        <div className="text-left hidden sm:block">
          <p className="text-amber-100 font-cinzel font-bold text-sm">{user.name}</p>
          <p className="text-amber-200 text-xs font-merriweather">Level {user.level}</p>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-amber-200 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-amber-200 z-20 overflow-hidden">
            {/* User Info */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-yellow-50">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={user.avatarUrl}
                  alt={user.name}
                  size="md"
                />
                <div>
                  <p className="font-cinzel font-bold text-gray-800">{user.name}</p>
                  <p className="text-sm text-amber-700 font-merriweather">Level {user.level}</p>
                  <p className="text-xs text-gray-600 font-merriweather">{user.email}</p>
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
                  <VolumeX size={18} className="text-gray-500" />
                ) : (
                  <Volume2 size={18} className="text-green-600" />
                )}
                <span className="font-merriweather text-gray-700">
                  {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                </span>
              </button>

              {/* Sign Out */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
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