import React, { useState, useEffect } from 'react';
import { User, Quest } from '../../types';
import { NotificationService } from '../../utils/notificationService';
import ProfileDropdown from './ProfileDropdown';
import NotificationPanel from './NotificationPanel';
import { 
  Home, 
  Scroll, 
  Map, 
  Users, 
  BookOpen, 
  ShoppingCart, 
  Bell, 
  Menu, 
  X,
  Coins
} from 'lucide-react';

interface NavbarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  quests: Quest[];
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  activeTab, 
  onTabChange, 
  onSignOut, 
  quests 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Get unread notification count
    try {
      const count = NotificationService.getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.warn('Failed to get notification count:', error);
      setUnreadCount(0);
    }
  }, [user.id]);

  const activeQuests = quests.filter(quest => !quest.completed);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quests', label: 'Quests', icon: Scroll, badge: activeQuests.length },
    { id: 'map', label: 'Adventure Map', icon: Map },
    { id: 'heroes', label: 'Heroes Hall', icon: Users },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'chronicles', label: 'Chronicles', icon: BookOpen }
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setShowMobileMenu(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 shadow-lg border-b-2 border-amber-700">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center magical-glow">
                <Scroll className="text-amber-900" size={16} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-cinzel font-bold text-white magical-glow">
                  Mythic Quest
                </h1>
                <p className="text-xs text-amber-100 font-merriweather">
                  Wellness Adventure
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg font-cinzel font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-md magical-glow'
                        : 'text-amber-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Coin Display */}
              <div className="hidden sm:flex items-center bg-white/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <Coins className="text-yellow-300 mr-1 sm:mr-1.5 magical-glow" size={14} sm:size={16} />
                <span className="text-white font-cinzel font-bold text-xs sm:text-sm">
                  {user.mythicCoins || 0}
                </span>
              </div>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-amber-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Bell size={18} sm:size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <ProfileDropdown user={user} onSignOut={onSignOut} />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-amber-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-amber-500/30 py-2">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg font-cinzel font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-white/20 text-white shadow-md'
                          : 'text-amber-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-sm">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-xs">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Mobile Coin Display */}
              <div className="mt-3 flex items-center justify-center bg-white/20 px-3 py-2 rounded-lg">
                <Coins className="text-yellow-300 mr-2 magical-glow" size={16} />
                <span className="text-white font-cinzel font-bold">
                  {user.mythicCoins || 0} Mythic Coins
                </span>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel
          user={user}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </>
  );
};

export default Navbar;