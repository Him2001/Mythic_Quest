import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { Settings, User as UserIcon, LogOut, Volume2, VolumeX } from 'lucide-react';

interface ProfileDropdownProps {
  user: User;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  onSignOut,
  isOpen,
  onClose
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(true); // Default to muted

  // Load audio preference from localStorage on mount
  useEffect(() => {
    const savedAudioState = localStorage.getItem('mythic_audio_muted');
    if (savedAudioState !== null) {
      setIsAudioMuted(JSON.parse(savedAudioState));
    } else {
      // Set default to muted and save it
      setIsAudioMuted(true);
      localStorage.setItem('mythic_audio_muted', 'true');
    }
  }, []);

  const toggleAudio = () => {
    const newMutedState = !isAudioMuted;
    setIsAudioMuted(newMutedState);
    localStorage.setItem('mythic_audio_muted', JSON.stringify(newMutedState));
    
    // Show notification
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 left-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
      newMutedState ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`;
    notification.textContent = newMutedState ? 'Audio Muted (Dev Mode)' : 'Audio Enabled';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2000);
    
    console.log(`Audio ${newMutedState ? 'muted' : 'enabled'} for development`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              size="lg"
              className="ring-2 ring-amber-200"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-cinzel font-bold text-gray-900 text-lg truncate">
                {user.name}
              </h3>
              <p className="text-sm text-gray-600 font-merriweather truncate">
                {user.email}
              </p>
              <div className="flex items-center space-x-3 mt-2">
                <Badge color="accent" size="sm">
                  Level {user.level}
                </Badge>
                <span className="text-sm text-amber-700 font-cinzel">
                  {user.xp} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 font-cinzel">
                {user.questsCompleted}
              </div>
              <div className="text-xs text-gray-600 font-merriweather">
                Quests
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 font-cinzel">
                {user.mythicCoins}
              </div>
              <div className="text-xs text-gray-600 font-merriweather">
                Coins
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {/* Profile Settings */}
          <button className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
            <UserIcon size={18} className="text-gray-500" />
            <span className="font-merriweather text-gray-700">Profile Settings</span>
          </button>

          {/* Preferences */}
          <button className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
            <Settings size={18} className="text-gray-500" />
            <span className="font-merriweather text-gray-700">Preferences</span>
          </button>

          {/* Audio Toggle */}
          <button 
            onClick={toggleAudio}
            className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              {isAudioMuted ? (
                <VolumeX size={18} className="text-red-500" />
              ) : (
                <Volume2 size={18} className="text-green-500" />
              )}
              <span className={`font-merriweather ${isAudioMuted ? 'text-red-600' : 'text-green-600'}`}>
                {isAudioMuted ? 'Audio Muted (Dev)' : 'Audio Enabled'}
              </span>
            </div>
          </button>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Sign Out */}
          <button 
            onClick={onSignOut}
            className="w-full px-6 py-3 text-left hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3 text-red-600"
          >
            <LogOut size={18} />
            <span className="font-merriweather">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;