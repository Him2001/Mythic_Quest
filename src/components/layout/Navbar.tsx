import React, { useState, useEffect } from 'react';
import { User, Quest } from '../../types';
import { NotificationCountService } from '../../utils/notificationCountService';
import NotificationBadge from '../ui/NotificationBadge';
import ProfileDropdown from './ProfileDropdown';
import { 
  Home, 
  Scroll, 
  Map, 
  Users, 
  ShoppingCart, 
  BookOpen,
  Coins,
  Sword
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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Get notification counts
  const unreadMessagesCount = NotificationCountService.getUnreadMessagesCount(user.id);
  const pendingFriendRequestsCount = NotificationCountService.getPendingFriendRequestsCount(user.id);
  const activeQuestsCount = NotificationCountService.getActiveQuestsCount(quests);

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'quests', label: 'QUESTS', icon: Scroll, badge: activeQuestsCount },
    { id: 'map', label: 'ADVENTURE\nMAP', icon: Map },
    { id: 'heroes', label: 'HEROES\nHALL', icon: Users, badge: pendingFriendRequestsCount },
    { id: 'marketplace', label: 'MARKETPLACE', icon: ShoppingCart },
    { id: 'chronicles', label: 'CHRONICLES', icon: BookOpen }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 shadow-lg border-b-2 border-amber-600">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-300">
              <Sword className="text-amber-900" size={20} />
            </div>
            <div className="text-white">
              <h1 className="text-lg font-cinzel font-bold leading-tight">MYTHIC</h1>
              <h2 className="text-lg font-cinzel font-bold leading-tight">QUEST</h2>
              <p className="text-xs font-cinzel text-amber-200 leading-tight">Wellness Adventure</p>
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
                  className={`relative px-4 py-2 rounded-lg font-cinzel font-bold text-sm transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-md border border-amber-500'
                      : 'text-amber-100 hover:bg-amber-700 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span className="whitespace-pre-line text-center leading-tight">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <NotificationBadge count={item.badge} />
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            {/* Coin Display */}
            <div className="hidden sm:flex items-center bg-amber-600 px-3 py-1.5 rounded-full border border-amber-500 shadow-md">
              <Coins className="text-amber-200 mr-1.5" size={16} />
              <span className="text-white font-cinzel font-bold text-sm">{user.mythicCoins}</span>
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 bg-amber-600 px-3 py-1.5 rounded-lg border border-amber-500 shadow-md hover:bg-amber-700 transition-colors"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-amber-300"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-white font-cinzel font-bold text-sm">{user.name}</div>
                  <div className="text-amber-200 font-cinzel text-xs">LEVEL {user.level}</div>
                </div>
              </button>

              {showProfileDropdown && (
                <ProfileDropdown
                  user={user}
                  onClose={() => setShowProfileDropdown(false)}
                  onSignOut={onSignOut}
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-2">
          <div className="flex items-center justify-between space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex-shrink-0 px-2 py-1.5 rounded-md font-cinzel font-bold text-xs transition-all duration-200 flex flex-col items-center space-y-1 min-w-[60px] ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-md border border-amber-500'
                      : 'text-amber-100 hover:bg-amber-700 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span className="whitespace-pre-line text-center leading-tight text-[10px]">{item.label}</span>
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