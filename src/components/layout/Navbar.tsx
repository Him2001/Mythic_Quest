import React, { useState, useRef, useEffect } from 'react';
import { User, Quest } from '../../types';
import { Sparkles, MessageCircle, Users, Map, ShoppingCart, ScrollText, Home, VolumeX, Volume2, LogOut } from 'lucide-react';
import Avatar from '../ui/Avatar';
import NotificationBadge from '../ui/NotificationBadge';
import { NotificationCountService } from '../../utils/notificationCountService';

interface NavbarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  quests: Quest[];
}

const Navbar: React.FC<NavbarProps> = ({ user, activeTab, onTabChange, onSignOut, quests }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [audioMuted, setAudioMuted] = useState(() => {
    return localStorage.getItem('audioMuted') === 'true';
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleAudioToggle = () => {
    const newMutedState = !audioMuted;
    setAudioMuted(newMutedState);
    localStorage.setItem('audioMuted', newMutedState.toString());
  };

  const handleSignOut = () => {
    setShowDropdown(false);
    onSignOut();
  };

  // Get notification counts
  const activeQuestsCount = NotificationCountService.getActiveQuestsCount(quests);
  const unreadMessagesCount = NotificationCountService.getUnreadMessagesCount(user.id);
  const pendingFriendRequestsCount = NotificationCountService.getPendingFriendRequestsCount(user.id);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quests', label: 'Quests', icon: Sparkles, badge: activeQuestsCount },
    { id: 'map', label: 'Adventure Map', icon: Map },
    { id: 'heroes', label: 'Heroes', icon: Users, badge: unreadMessagesCount + pendingFriendRequestsCount },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'chronicles', label: 'Chronicles', icon: ScrollText }
  ];

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-amber-800 to-purple-900 shadow-2xl border-b-4 border-amber-500 relative z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center magical-glow border-2 border-amber-300">
              <Sparkles className="text-amber-100" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-cinzel font-bold text-amber-100 magical-glow">
                Mythic Quest
              </h1>
              <p className="text-xs text-amber-200 font-merriweather">Wellness Adventure</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center px-4 py-2 rounded-lg font-cinzel font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-500 text-amber-900 shadow-lg magical-glow'
                      : 'text-amber-100 hover:bg-amber-600/30 hover:text-amber-200'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  <span className="hidden lg:inline">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <NotificationBadge count={item.badge} />
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            {/* Coins Display */}
            <div className="hidden sm:flex items-center bg-amber-500 text-amber-900 px-3 py-1 rounded-full font-cinzel font-bold magical-glow border-2 border-amber-400">
              <span className="mr-1">💰</span>
              <span>{user.mythicCoins}</span>
            </div>

            {/* User Profile with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleUserClick}
                className="flex items-center space-x-3 bg-amber-500 text-amber-900 px-4 py-2 rounded-lg font-cinzel font-bold hover:bg-amber-400 transition-all duration-300 magical-glow border-2 border-amber-400"
              >
                <Avatar
                  src={user.avatarUrl}
                  alt={user.name}
                  size="sm"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-bold">{user.name}</div>
                  <div className="text-xs opacity-80">Level {user.level}</div>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {/* Audio Toggle */}
                  <button
                    onClick={handleAudioToggle}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    {audioMuted ? (
                      <VolumeX size={16} className="text-red-500" />
                    ) : (
                      <Volume2 size={16} className="text-green-500" />
                    )}
                    <span className="text-gray-700 font-merriweather">
                      {audioMuted ? 'Audio Muted (Dev)' : 'Audio Enabled'}
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-red-600 transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="font-merriweather">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex items-center justify-between space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex flex-col items-center px-3 py-2 rounded-lg font-cinzel font-bold transition-all duration-300 min-w-0 flex-1 ${
                    isActive
                      ? 'bg-amber-500 text-amber-900 shadow-lg magical-glow'
                      : 'text-amber-100 hover:bg-amber-600/30 hover:text-amber-200'
                  }`}
                >
                  <Icon size={16} className="mb-1" />
                  <span className="text-xs truncate">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <NotificationBadge count={item.badge} size="sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;