import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { User as UserIcon, Settings, VolumeX, Volume2, LogOut, ChevronDown } from 'lucide-react';

interface ProfileDropdownProps {
  user: User;
  onSignOut: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [audioMuted, setAudioMuted] = useState(() => {
    // Load audio preference from localStorage, default to muted
    const saved = localStorage.getItem('mythic_audio_muted');
    return saved !== null ? JSON.parse(saved) : true;
  });
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

  // Save audio preference to localStorage
  useEffect(() => {
    localStorage.setItem('mythic_audio_muted', JSON.stringify(audioMuted));
    
    // Dispatch custom event to notify audio components
    window.dispatchEvent(new CustomEvent('audioMuteToggle', { 
      detail: { muted: audioMuted } 
    }));
  }, [audioMuted]);

  const toggleAudioMute = () => {
    setAudioMuted(!audioMuted);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    onSignOut();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
          <div className="text-xs text-amber-100">Level {user.level}</div>
        </div>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-amber-200 z-50 overflow-hidden">
          {/* Header Section */}
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
                  <Badge color="accent" size="sm">Level {user.level}</Badge>
                  <span className="text-amber-700 font-cinzel text-sm">{user.xp} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-cinzel font-bold text-amber-600">{user.questsCompleted}</div>
                <div className="text-xs text-gray-600 font-merriweather">Quests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-cinzel font-bold text-amber-600">{user.mythicCoins}</div>
                <div className="text-xs text-gray-600 font-merriweather">Coins</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Profile Settings */}
            <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
              <UserIcon size={18} className="text-gray-600" />
              <span className="font-cinzel text-gray-700">Profile Settings</span>
            </button>

            {/* Preferences */}
            <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
              <Settings size={18} className="text-gray-600" />
              <span className="font-cinzel text-gray-700">Preferences</span>
            </button>

            {/* Audio Toggle */}
            <button 
              onClick={toggleAudioMute}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3"
            >
              {audioMuted ? (
                <VolumeX size={18} className="text-red-500" />
              ) : (
                <Volume2 size={18} className="text-green-500" />
              )}
              <span className={`font-cinzel ${audioMuted ? 'text-red-600' : 'text-green-600'}`}>
                Audio {audioMuted ? 'Muted (Dev)' : 'Enabled'}
              </span>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Sign Out */}
            <button 
              onClick={handleSignOut}
              className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3"
            >
              <LogOut size={18} className="text-red-500" />
              <span className="font-cinzel text-red-600">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;