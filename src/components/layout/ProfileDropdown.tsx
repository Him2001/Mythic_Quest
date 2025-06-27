import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { ChevronDown, User as UserIcon, LogOut } from 'lucide-react';

interface ProfileDropdownProps {
  user: User;
  onSignOut: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewProfile = () => {
    setIsOpen(false);
    // In a real app, this would navigate to a profile page
    console.log('View profile clicked');
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
        className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-all duration-200 backdrop-blur-sm border border-white/20"
      >
        <Avatar
          src={user.avatarUrl}
          alt={user.name}
          size="sm"
          status="online"
        />
        <div className="hidden sm:block text-left">
          <div className="flex items-center space-x-2">
            <span className="font-cinzel font-bold text-amber-100 text-sm">{user.name}</span>
            <Badge color="accent" size="sm">
              Level {user.level}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-xs text-amber-200">
            <span className="font-merriweather">{user.mythicCoins} coins</span>
          </div>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-amber-200 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 backdrop-blur-sm">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Avatar
                src={user.avatarUrl}
                alt={user.name}
                size="md"
              />
              <div>
                <div className="font-cinzel font-bold text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-600 font-merriweather">{user.email}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge color="accent" size="sm">Level {user.level}</Badge>
                  <span className="text-xs text-amber-600 font-cinzel">{user.mythicCoins} coins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleViewProfile}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-merriweather"
            >
              <UserIcon size={16} className="mr-3 text-gray-500" />
              View Profile
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-merriweather"
            >
              <LogOut size={16} className="mr-3 text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;