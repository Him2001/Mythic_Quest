import React, { useState } from 'react';
import { User, Quest } from '../../types';
import ProfileDropdown from './ProfileDropdown';
import NotificationPanel from './NotificationPanel';
import { Sword, Users, Map, ShoppingCart, ScrollText, Home, Bell } from 'lucide-react';

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

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quests', label: 'Quests', icon: Sword },
    { id: 'map', label: 'Adventure Map', icon: Map },
    { id: 'heroes', label: 'Hero\'s Hall', icon: Users },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'chronicles', label: 'Chronicles', icon: ScrollText },
  ];

  const activeQuests = quests.filter(quest => !quest.completed);

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 shadow-2xl border-b-4 border-amber-500 relative overflow-hidden">
      {/* Magical background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-transparent to-purple-900/50 pointer-events-none" />
      <div className="absolute inset-0 magical-particles pointer-events-none opacity-30" />
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center magical-glow border-2 border-amber-300">
              <Sword className="text-amber-100" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-cinzel font-bold text-amber-100 magical-glow">
                MYTHIC QUEST
              </h1>
              <p className="text-xs text-amber-200 font-merriweather">Wellness Adventure</p>
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
                  className={`relative px-4 py-2 rounded-lg font-cinzel font-medium transition-all duration-300 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-amber-500 text-amber-900 shadow-lg magical-glow transform scale-105'
                      : 'text-amber-100 hover:bg-white/10 hover:text-amber-200'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden lg:inline">{item.label}</span>
                  {hasNotification && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{activeQuests.length}</span>
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
                className="p-2 text-amber-100 hover:text-amber-200 transition-colors relative"
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
          <div className="flex items-center justify-between space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const hasNotification = item.id === 'quests' && activeQuests.length > 0;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex-1 py-2 px-1 rounded-lg font-cinzel font-medium transition-all duration-300 flex flex-col items-center space-y-1 ${
                    isActive
                      ? 'bg-amber-500 text-amber-900 shadow-lg magical-glow'
                      : 'text-amber-100 hover:bg-white/10 hover:text-amber-200'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-xs">{item.label.split(' ')[0]}</span>
                  {hasNotification && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{activeQuests.length}</span>
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