import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react';

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
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
        <div className="text-left">
          <div className="text-sm font-bold">{user.name}</div>
          <div className="text-xs opacity-90">Level {user.level}</div>
        </div>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-amber-200 z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 border-b border-amber-200">
            <div className="flex items-center space-x-3">
              <Avatar
                src={user.avatarUrl}
                alt={user.name}
                size="md"
              />
              <div>
                <h3 className="font-cinzel font-bold text-gray-800">{user.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge color="accent" size="sm">
                    Level {user.level}
                  </Badge>
                  <span className="text-xs text-gray-600 font-merriweather">
                    {user.xp} XP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                // Could add profile editing functionality here
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 text-gray-700"
            >
              <UserIcon size={16} className="text-gray-500" />
              <span className="font-merriweather">View Profile</span>
            </button>

            <hr className="my-2 border-gray-200" />

            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
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