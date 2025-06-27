import React, { useState, useRef, useEffect } from 'react';
import { User, Quest } from '../../types';
import { Home, Map, Users, ShoppingBag, ScrollText, LogOut, Coins } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get notification counts
  const unreadMessagesCount = NotificationCountService.getUnreadMessagesCount(user.id);
  const pendingFriendRequestsCount = NotificationCountService.getPendingFriendRequestsCount(user.id);
  const activeQuestsCount = NotificationCountService.getActiveQuestsCount(quests);
  
  // Total count for Heroes Hall (messages + friend requests)
  const heroesHallCount = unreadMessagesCount + pendingFriendRequestsCount;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTabClick = (tab: string) => {
    // Reset notification counts when tabs are clicked
    if (tab === 'heroes') {
      NotificationCountService.markHeroesVisited(user.id);
    } else if (tab === 'quests') {
      NotificationCountService.markQuestsVisited(user.id);
    }
    
    onTabChange(tab);
  };

  const formatCoins = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quests', label: 'Quests', icon: Map, count: activeQuestsCount },
    { id: 'map', label: 'Adventure Map', icon: Map },
    { id: 'heroes', label: 'Hero\'s Hall', icon: Users, count: heroesHallCount },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'chronicles', label: 'Chronicles', icon: ScrollText }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 shadow-lg border-b-2 border-amber-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-amber-900 font-bold text-lg">⚔️</span>
            </div>
            <div>
              <h1 className="text-white font-cinzel font-bold text-lg">Mythic Quest</h1>
              <p className="text-amber-200 text-xs font-merriweather">Wellness Adventure</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const showCount = item.count && item.count > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative px-4 py-2 rounded-lg font-cinzel font-bold text-sm transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-md'
                      : 'text-amber-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {showCount && (
                    <NotificationBadge count={item.count} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Coin Display and Profile Section */}
          <div className="flex items-center space-x-4">
            {/* Coin Display */}
            <div className="hidden md:flex items-center bg-gradient-to-r from-amber-600 to-yellow-600 px-3 py-1.5 rounded-full border-2 border-amber-400 shadow-lg">
              <Coins className="text-amber-100 mr-2 magical-glow" size={16} />
              <span className="text-white font-cinzel font-bold text-sm">
                {formatCoins(user.mythicCoins)}
              </span>
            </div>

            {/* Profile Section */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-all duration-200"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-amber-300 shadow-md"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-white font-cinzel font-bold text-sm">{user.name}</p>
                  <p className="text-amber-200 text-xs font-merriweather">Level {user.level}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-amber-200 transition-transform duration-200 ${
                    showProfileDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <ProfileDropdown
                  user={user}
                  onUserUpdate={(updatedUser) => {
                    // Update user in parent component
                    // This would typically be handled by a context or state management
                    console.log('User updated:', updatedUser);
                  }}
                  onSignOut={onSignOut}
                  onClose={() => setShowProfileDropdown(false)}
                />
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={onSignOut}
              className="text-amber-100 hover:text-white p-2"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-3 gap-2">
            {navItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const showCount = item.count && item.count > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative p-3 rounded-lg font-cinzel font-bold text-xs transition-all duration-200 flex flex-col items-center space-y-1 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-md'
                      : 'text-amber-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  <span className="truncate">{item.label}</span>
                  {showCount && (
                    <NotificationBadge count={item.count} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Coin Display */}
          <div className="mt-3 flex justify-center">
            <div className="flex items-center bg-gradient-to-r from-amber-600 to-yellow-600 px-4 py-2 rounded-full border-2 border-amber-400 shadow-lg">
              <Coins className="text-amber-100 mr-2 magical-glow" size={18} />
              <span className="text-white font-cinzel font-bold">
                {formatCoins(user.mythicCoins)} Coins
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;