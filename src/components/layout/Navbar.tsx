import React, { useState, useEffect } from 'react';
import { User, Quest } from '../../types';
import { Users, Scroll, Map, ShoppingCart, BookOpen, LogOut } from 'lucide-react';
import CoinDisplay from '../ui/CoinDisplay';
import NotificationBadge from '../ui/NotificationBadge';
import { NotificationCountService } from '../../utils/notificationCountService';
import { SoundEffects } from '../../utils/soundEffects';

interface NavbarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  quests: Quest[];
}

const Navbar: React.FC<NavbarProps> = ({ user, activeTab, onTabChange, onSignOut, quests }) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingFriendRequests, setPendingFriendRequests] = useState(0);
  const [activeQuests, setActiveQuests] = useState(0);

  useEffect(() => {
    // Update notification counts
    setUnreadMessages(NotificationCountService.getUnreadMessagesCount(user.id));
    setPendingFriendRequests(NotificationCountService.getPendingFriendRequestsCount(user.id));
    setActiveQuests(NotificationCountService.getActiveQuestsCount(quests));
  }, [user.id, quests]);

  const handleTabClick = (tab: string) => {
    // Play tab switch sound
    SoundEffects.playSound('tab');
    
    // Update notification counts when switching tabs
    if (tab === 'heroes') {
      NotificationCountService.markHeroesVisited(user.id);
      setPendingFriendRequests(0);
    } else if (tab === 'quests') {
      NotificationCountService.markQuestsVisited(user.id);
    }
    
    onTabChange(tab);
  };

  const handleSignOut = () => {
    // Play portal sound for sign out
    SoundEffects.playSound('portal');
    onSignOut();
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Scroll },
    { id: 'quests', label: 'Quests', icon: Scroll, badge: activeQuests },
    { id: 'map', label: 'Adventure Map', icon: Map },
    { id: 'heroes', label: 'Heroes Hall', icon: Users, badge: pendingFriendRequests },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'chronicles', label: 'Chronicles', icon: BookOpen }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 via-purple-800 to-amber-800 shadow-2xl border-b-4 border-amber-500">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center magical-glow border-2 border-amber-300">
              <Scroll className="text-amber-100" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-cinzel font-bold text-amber-100 magical-glow">
                Mythic Quest
              </h1>
              <p className="text-xs text-amber-200 font-merriweather">
                Wellness Adventure Companion
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const hasBadge = item.badge && item.badge > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative px-4 py-2 rounded-lg font-cinzel font-bold transition-all duration-300 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-amber-500 text-amber-100 shadow-lg magical-glow'
                      : 'text-amber-200 hover:text-amber-100 hover:bg-purple-700/50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden xl:inline">{item.label}</span>
                  {hasBadge && <NotificationBadge count={item.badge} />}
                </button>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center space-x-1">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const hasBadge = item.badge && item.badge > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-500 text-amber-100 shadow-lg magical-glow'
                      : 'text-amber-200 hover:text-amber-100 hover:bg-purple-700/50'
                  }`}
                >
                  <Icon size={18} />
                  {hasBadge && <NotificationBadge count={item.badge} />}
                </button>
              );
            })}
          </div>

          {/* User Info and Sign Out */}
          <div className="flex items-center space-x-4">
            {/* Coin Display */}
            <CoinDisplay coins={user.mythicCoins} size="sm" />
            
            {/* User Info - Non-clickable */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <div className="text-amber-100 font-cinzel font-bold text-sm">
                  {user.name}
                </div>
                <div className="text-amber-200 text-xs font-merriweather">
                  Level {user.level}
                </div>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center border-2 border-amber-300 magical-glow">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-cinzel font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                title="Sign Out"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;