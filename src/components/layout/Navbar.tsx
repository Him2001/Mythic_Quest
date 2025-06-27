import React, { useState } from 'react';
import { User, Quest } from '../../types';
import { Sparkles, Users, Map, ShoppingCart, BookOpen, Home, LogOut, ChevronDown } from 'lucide-react';
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

  // Get notification counts
  const unreadMessagesCount = NotificationCountService.getUnreadMessagesCount(user.id);
  const pendingFriendRequestsCount = NotificationCountService.getPendingFriendRequestsCount(user.id);
  const activeQuestsCount = NotificationCountService.getActiveQuestsCount(quests);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quests', label: 'Quests', icon: Sparkles, badge: activeQuestsCount },
    { id: 'map', label: 'Adventure Map', icon: Map },
    { id: 'heroes', label: 'Hero\'s Hall', icon: Users, badge: unreadMessagesCount + pendingFriendRequestsCount },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'chronicles', label: 'Chronicles', icon: BookOpen }
  ];

  const handleTabClick = (tabId: string) => {
    // Update notification counts when tabs are visited
    if (tabId === 'quests') {
      NotificationCountService.markQuestsVisited(user.id);
    } else if (tabId === 'heroes') {
      NotificationCountService.markHeroesVisited(user.id);
    }
    
    onTabChange(tabId);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 shadow-2xl border-b-4 border-amber-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center magical-glow border-2 border-amber-300">
              <Sparkles className="text-amber-100" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-cinzel font-bold text-amber-100 magical-glow">
                MYTHIC QUEST
              </h1>
              <p className="text-xs text-amber-200 font-merriweather">Wellness Adventure</p>
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
                  className={`relative flex items-center px-4 py-2 rounded-lg font-cinzel font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-900 text-amber-100 shadow-lg magical-glow'
                      : 'text-amber-200 hover:text-amber-100 hover:bg-amber-800/50'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  <span className="text-sm">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <NotificationBadge count={item.badge} />
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-amber-900/50 hover:bg-amber-900 transition-all duration-300 border border-amber-700"
            >
              <Avatar
                src={user.avatarUrl}
                alt={user.name}
                size="sm"
                className="border-2 border-amber-300"
              />
              <div className="hidden md:block text-left">
                <p className="font-cinzel font-bold text-amber-100 text-sm">{user.name}</p>
                <p className="text-xs text-amber-300">Level {user.level}</p>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-amber-300 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-amber-200 py-2 z-50">
                <button
                  onClick={() => {
                    onSignOut();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center font-cinzel"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-4">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative flex flex-col items-center px-3 py-2 rounded-lg font-cinzel font-bold transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-900 text-amber-100 shadow-lg magical-glow'
                      : 'text-amber-200 hover:text-amber-100 hover:bg-amber-800/50'
                  }`}
                >
                  <Icon size={16} className="mb-1" />
                  <span className="text-xs">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <NotificationBadge count={item.badge} />
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