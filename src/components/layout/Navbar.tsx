import React, { useState } from 'react';
import { User, Quest } from '../../types';
import { Home, Scroll, Map, Users, ShoppingBag, BookOpen, Volume2, VolumeX, LogOut } from 'lucide-react';

interface NavbarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  quests: Quest[];
}

const Navbar: React.FC<NavbarProps> = ({ user, activeTab, onTabChange, onSignOut, quests }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'quests', label: 'QUESTS', icon: Scroll, badge: quests.filter(q => !q.completed).length },
    { id: 'map', label: 'ADVENTURE MAP', icon: Map },
    { id: 'heroes', label: 'HERO\'S HALL', icon: Users },
    { id: 'marketplace', label: 'MARKETPLACE', icon: ShoppingBag },
    { id: 'chronicles', label: 'CHRONICLES', icon: BookOpen }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 shadow-lg border-b-2 border-amber-800">
      <div className="flex items-center justify-between px-4 py-2 h-16">
        {/* Logo */}
        <div className="flex items-center space-x-2 bg-amber-800 rounded-full px-4 py-2 border-2 border-amber-900">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border border-amber-700">
            <Scroll className="w-5 h-5 text-amber-900" />
          </div>
          <div className="text-white font-cinzel font-bold">
            <div className="text-sm leading-tight">MYTHIC</div>
            <div className="text-sm leading-tight">QUEST</div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-cinzel font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500 text-amber-900 shadow-md border border-amber-400'
                    : 'text-white hover:bg-amber-600 hover:text-amber-100'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side - Sound, Level, User, Sign Out */}
        <div className="flex items-center space-x-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white hover:text-amber-200 transition-colors p-2"
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          {/* Level Badge */}
          <div className="bg-amber-500 text-amber-900 px-3 py-1 rounded-full border-2 border-amber-400 font-cinzel font-bold text-sm">
            Level {user.level}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-2 bg-amber-800 rounded-full px-3 py-1 border-2 border-amber-900">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full border-2 border-amber-500"
            />
            <div className="text-white font-cinzel font-bold text-sm">
              <div>{user.name.toUpperCase()}</div>
              <div className="text-xs text-amber-200">{user.mythicCoins} coins</div>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={onSignOut}
            className="text-white hover:text-red-300 transition-colors p-2"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;