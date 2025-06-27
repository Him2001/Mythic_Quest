import React from 'react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react';

interface ProfileDropdownProps {
  user: User;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSignOut: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  isOpen,
  onToggle,
  onClose,
  onSignOut
}) => {
  const handleSignOut = () => {
    onSignOut();
    onClose();
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={onToggle}
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
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* User Info Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={user.avatarUrl}
                  alt={user.name}
                  size="md"
                />
                <div>
                  <div className="font-cinzel font-bold text-gray-800">{user.name}</div>
                  <div className="text-sm text-amber-700">Level {user.level} • {user.mythicCoins} coins</div>
                  <div className="text-xs text-gray-600">{user.email}</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  // Handle view profile
                  onClose();
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3"
              >
                <UserIcon size={16} className="text-gray-500" />
                <span className="font-merriweather text-gray-700">View Profile</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3 text-red-600"
              >
                <LogOut size={16} />
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