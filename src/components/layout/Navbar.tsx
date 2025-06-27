import React, { useState, useRef, useEffect } from 'react';
import { User, Quest } from '../../types';
import { Sparkles, Users, Map, ShoppingCart, ScrollText, Coins, LogOut, VolumeX, Volume2 } from 'lucide-react';
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
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get notification counts
  const unreadMessagesCount = NotificationCountService.getUnreadMessagesCount(user.id);
  const pendingFriendRequestsCount = NotificationCountService.getPendingFriendRequestsCount(user.id);
  const activeQuestsCount = NotificationCountService.getActiveQuestsCount(quests);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTabClick = (tab: string) => {
    // Update notification counts when tabs are clicked
    if (tab === 'heroes') {
      NotificationCountService.markHeroesVisited(user.id);
    } else if (tab === 'quests') {
      NotificationCountService.markQuestsVisited(user.id);
    }
    
    onTabChange(tab);
  };

  const handleUserClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSignOut = () => {
    setShowDropdown(false);
    onSignOut();
  };

  const toggleAudioMute = () => {
    setIsAudioMuted(!isAudioMuted);
    // Here you would implement actual audio muting logic
    console.log('Audio muted:', !isAudioMuted);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'quests', label: 'Quests', icon: ScrollText, badge: activeQuestsCount },
    { id: 'map', label: 'Adventure\nMap', icon: Map },
    { id: 'heroes', label: 'Heroes\nHall', icon: Users, badge: unreadMessagesCount + pendingFriendRequestsCount },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'chronicles', label: 'Chronicles', icon: ScrollText }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-800 via-amber-700 to-yellow-700 shadow-2xl border-b-4 border-amber-900/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-900">
              <Sparkles className="text-amber-900" size={20} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-cinzel font-bold text-amber-100 leading-tight">
                MYTHIC
              </h1>
              <h2 className="text-xl font-cinzel font-bold text-amber-100 leading-tight">
                QUEST
              </h2>
              <p className="text-xs text-amber-200 font-merriweather leading-tight">
                Wellness Adventure
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const badgeCount = item.badge || 0;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative px-4 py-2 rounded-lg font-cinzel font-bold text-sm transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-white/20 text-amber-100 shadow-lg border border-white/30'
                      : 'text-amber-200 hover:bg-white/10 hover:text-amber-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="whitespace-pre-line text-center leading-tight">
                    {item.label}
                  </span>
                  {badgeCount > 0 && (
                    <NotificationBadge count={badgeCount} />
                  )}
                </button>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* Coins Display */}
            <div className="bg-gradient-to-r from-yellow-400 to-amber-400 text-amber-900 px-4 py-2 rounded-full font-cinzel font-bold shadow-lg border-2 border-amber-900/30 flex items-center space-x-2">
              <Coins size={16} />
              <span>{user.mythicCoins}</span>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleUserClick}
                className="bg-gradient-to-r from-yellow-400 to-amber-400 text-amber-900 px-4 py-2 rounded-full font-cinzel font-bold shadow-lg border-2 border-amber-900/30 flex items-center space-x-3 hover:from-yellow-300 hover:to-amber-300 transition-all duration-200"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-amber-900/50"
                />
                <div className="flex flex-col items-start">
                  <span className="text-sm leading-tight">{user.name}</span>
                  <span className="text-xs text-amber-800 leading-tight">Level {user.level}</span>
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-amber-200 py-2 z-50">
                  <button
                    onClick={toggleAudioMute}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-amber-50 flex items-center space-x-3 transition-colors duration-200"
                  >
                    {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    <span className="font-merriweather">
                      {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                    </span>
                  </button>
                  
                  <hr className="my-1 border-amber-200" />
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors duration-200"
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
          <div className="grid grid-cols-3 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const badgeCount = item.badge || 0;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative p-3 rounded-lg font-cinzel font-bold text-xs transition-all duration-200 flex flex-col items-center space-y-1 ${
                    isActive
                      ? 'bg-white/20 text-amber-100 shadow-lg border border-white/30'
                      : 'text-amber-200 hover:bg-white/10 hover:text-amber-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="whitespace-pre-line text-center leading-tight">
                    {item.label}
                  </span>
                  {badgeCount > 0 && (
                    <NotificationBadge count={badgeCount} />
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