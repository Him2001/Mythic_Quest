import React, { useState, useRef, useEffect } from 'react';
import { User, Quest } from '../../types';
import { Home, Sparkles, Map, Users, ShoppingCart, ScrollText, Coins, Volume2, VolumeX, LogOut, ChevronDown } from 'lucide-react';
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
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate notification counts
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    
    // Update notification counts when tabs are visited
    if (tab === 'heroes') {
      NotificationCountService.markHeroesVisited(user.id);
    } else if (tab === 'quests') {
      NotificationCountService.markQuestsVisited(user.id);
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleSignOut = () => {
    setShowDropdown(false);
    onSignOut();
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'quests', label: 'QUESTS', icon: Sparkles, badge: activeQuestsCount },
    { id: 'map', label: 'ADVENTURE\nMAP', icon: Map },
    { id: 'heroes', label: 'HEROES\nHALL', icon: Users, badge: pendingFriendRequestsCount },
    { id: 'marketplace', label: 'MARKETPLACE', icon: ShoppingCart },
    { id: 'chronicles', label: 'CHRONICLES', icon: ScrollText }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 shadow-2xl border-b-4 border-amber-600/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center mr-3 shadow-lg border-2 border-amber-300">
                <Sparkles className="text-white" size={20} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-white font-cinzel font-bold text-lg leading-tight tracking-wide">
                  MYTHIC QUEST
                </h1>
                <p className="text-amber-100 font-cinzel text-xs leading-tight whitespace-nowrap">
                  Wellness Adventure
                </p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`relative px-4 py-2 rounded-lg font-cinzel font-bold text-sm transition-all duration-200 flex items-center space-x-2 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg border border-white/30'
                        : 'text-amber-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="whitespace-pre-line text-center leading-tight">
                      {item.label}
                    </span>
                    
                    {/* Notification Badge */}
                    {item.badge && item.badge > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-lg">
                        {item.badge > 99 ? '99+' : item.badge}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Coins Display */}
            <div className="hidden sm:flex items-center bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 px-4 py-2 rounded-full font-cinzel font-bold shadow-lg border-2 border-amber-300">
              <Coins size={16} className="mr-2" />
              <span>{user.mythicCoins || 0}</span>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 px-4 py-2 rounded-full font-cinzel font-bold shadow-lg border-2 border-amber-300 hover:from-amber-300 hover:to-yellow-300 transition-all duration-200"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-amber-600"
                />
                <span className="hidden sm:block">{user.name.toUpperCase()}</span>
                <span className="hidden sm:block text-xs opacity-75">LEVEL {user.level}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border-2 border-amber-200 overflow-hidden z-50">
                  <button
                    onClick={toggleAudio}
                    className="w-full px-4 py-3 text-left hover:bg-amber-50 flex items-center space-x-3 text-gray-700 font-cinzel transition-colors duration-200"
                  >
                    {isAudioEnabled ? (
                      <Volume2 size={16} className="text-green-600" />
                    ) : (
                      <VolumeX size={16} className="text-red-600" />
                    )}
                    <span>{isAudioEnabled ? 'Audio Enabled' : 'Audio Muted'}</span>
                  </button>
                  
                  <div className="border-t border-amber-200"></div>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 text-red-600 font-cinzel transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-4">
          <div className="flex flex-wrap justify-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative px-3 py-2 rounded-lg font-cinzel font-bold text-xs transition-all duration-200 flex items-center space-x-1 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg border border-white/30'
                      : 'text-amber-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={14} />
                  <span className="whitespace-pre-line text-center leading-tight">
                    {item.label}
                  </span>
                  
                  {/* Notification Badge */}
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-lg">
                      {item.badge > 9 ? '9+' : item.badge}
                    </div>
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