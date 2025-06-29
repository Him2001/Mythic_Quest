import React, { useState, useEffect } from 'react';
import { User, Quest } from '../../types';
import { Sword, Users, Map, ShoppingCart, ScrollText, Home, Menu, X, Coins } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import NotificationPanel from './NotificationPanel';
import CoinDisplay from '../ui/CoinDisplay';
import { NotificationCountService } from '../../utils/notificationCountService';

interface NavbarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  quests: Quest[];
}

const Navbar: React.FC<NavbarProps> = ({ user, activeTab, onTabChange, onSignOut, quests }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [coinCount, setCoinCount] = useState(user.mythicCoins);

  // Update coin count when user.mythicCoins changes
  useEffect(() => {
    setCoinCount(user.mythicCoins);
  }, [user.mythicCoins]);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quests', label: 'Quests', icon: Sword },
    { id: 'map', label: 'Adventure Map', icon: Map },
    { id: 'heroes', label: 'Hero\'s Hall', icon: Users },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'chronicles', label: 'Chronicles', icon: ScrollText },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
    
    // Mark tabs as visited for notification counting
    if (tabId === 'heroes') {
      NotificationCountService.markHeroesVisited(user.id);
    } else if (tabId === 'quests') {
      NotificationCountService.markQuestsVisited(user.id);
    }
  };

  const getNotificationCount = (tabId: string): number => {
    switch (tabId) {
      case 'heroes':
        return NotificationCountService.getUnreadMessagesCount(user.id) + 
               NotificationCountService.getPendingFriendRequestsCount(user.id);
      case 'quests':
        return NotificationCountService.getActiveQuestsCount(quests);
      default:
        return 0;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-900 via-purple-800 to-amber-800 shadow-2xl border-b-4 border-amber-500">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center magical-glow">
              <Sword className="text-amber-100" size={16} sm:size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-cinzel font-bold text-amber-100 magical-glow">
                Mythic Quest
              </h1>
              <p className="text-xs text-amber-200 font-merriweather">
                Wellness Adventure
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const notificationCount = getNotificationCount(item.id);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative px-3 py-2 rounded-lg font-cinzel font-medium transition-all duration-200 flex items-center space-x-2 text-sm ${
                    activeTab === item.id
                      ? 'bg-amber-500 text-amber-100 shadow-lg magical-glow'
                      : 'text-amber-200 hover:text-amber-100 hover:bg-purple-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Coin Display - Updated to use local state */}
            <div className="hidden sm:block">
              <CoinDisplay coins={coinCount} size="sm" />
            </div>

            {/* Level Badge */}
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 px-2 sm:px-3 py-1 rounded-full border-2 border-amber-300 magical-glow">
              <span className="text-amber-100 font-cinzel font-bold text-xs sm:text-sm">
                Lv. {user.level}
              </span>
            </div>

            {/* Profile Dropdown */}
            <ProfileDropdown 
              user={user} 
              onSignOut={onSignOut}
              onShowNotifications={() => setShowNotifications(true)}
            />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-amber-200 hover:text-amber-100 transition-colors p-1"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-purple-800 border-t border-purple-600 py-2">
            <div className="grid grid-cols-2 gap-2 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const notificationCount = getNotificationCount(item.id);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`relative p-3 rounded-lg font-cinzel font-medium transition-all duration-200 flex flex-col items-center space-y-1 text-xs ${
                      activeTab === item.id
                        ? 'bg-amber-500 text-amber-100 shadow-lg magical-glow'
                        : 'text-amber-200 hover:text-amber-100 hover:bg-purple-700'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Mobile Coin Display */}
            <div className="mt-3 px-2">
              <CoinDisplay coins={coinCount} size="sm" />
            </div>
          </div>
        )}
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel
          user={user}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;