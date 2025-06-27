import React, { useState } from 'react';
import { User, Quest } from '../../types';
import ProfileDropdown from './ProfileDropdown';
import NotificationPanel from './NotificationPanel';
import { Sword, Home, Scroll, Users, Map, ShoppingBag, BookOpen, Bell } from 'lucide-react';

interface NavbarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  quests: Quest[];
}

const Navbar: React.FC<NavbarProps> = ({ user, activeTab, onTabChange, onSignOut, quests }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quests', label: 'Quests', icon: Scroll },
    { id: 'map', label: 'Adventure Map', icon: Map },
    { id: 'heroes', label: 'Hero\'s Hall', icon: Users },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'chronicles', label: 'Chronicles', icon: BookOpen },
  ];

  const activeQuests = quests.filter(quest => !quest.completed);

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-purple-800 to-amber-800 shadow-2xl border-b-4 border-amber-500 relative overflow-hidden">
      {/* Magical background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-transparent to-amber-900/50 pointer-events-none" />
      <div className="absolute inset-0 magical-particles pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand - REDUCED SIZE */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Sword className="h-6 w-6 text-amber-400 magical-glow" />
              <div className="absolute inset-0 animate-pulse bg-amber-400/20 rounded-full" />
            </div>
            <div>
              <h1 className="text-lg font-cinzel font-bold text-amber-100 magical-glow tracking-wide">
                MYTHIC QUEST
              </h1>
              <p className="text-xs text-amber-300/80 font-merriweather -mt-1">
                Wellness Adventure
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const hasNotification = item.id === 'quests' && activeQuests.length > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-cinzel font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-100 shadow-lg magical-glow'
                      : 'text-amber-200/80 hover:text-amber-100 hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'magical-glow' : ''} />
                  <span className="text-sm">{item.label}</span>
                  {hasNotification && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                      {activeQuests.length}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile & Notifications */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-amber-200 hover:text-amber-100 transition-colors rounded-lg hover:bg-white/10"
              >
                <Bell size={20} />
                {/* Notification badge would go here */}
              </button>
              
              {showNotifications && (
                <NotificationPanel
                  user={user}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>

            {/* User Profile */}
            <ProfileDropdown user={user} onSignOut={onSignOut} />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const hasNotification = item.id === 'quests' && activeQuests.length > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex flex-col items-center space-y-1 px-3 py-2 rounded-lg font-cinzel font-bold transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-100 shadow-lg magical-glow'
                      : 'text-amber-200/80 hover:text-amber-100 hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'magical-glow' : ''} />
                  <span className="text-xs">{item.label}</span>
                  {hasNotification && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold animate-pulse">
                      {activeQuests.length}
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