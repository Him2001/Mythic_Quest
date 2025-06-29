import React, { useState } from 'react';
import { User, Quest } from '../../types';
import Avatar from '../ui/Avatar';
import CoinDisplay from '../ui/CoinDisplay';
import { 
  Home, 
  Scroll, 
  Map, 
  Users, 
  ShoppingBag, 
  BookOpen, 
  LogOut, 
  Menu,
  X,
  Sparkles
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const activeQuests = quests.filter(quest => !quest.completed);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quests', label: 'Quests', icon: Scroll, badge: activeQuests.length },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'heroes', label: 'Heroes', icon: Users },
    { id: 'marketplace', label: 'Shop', icon: ShoppingBag },
    { id: 'chronicles', label: 'Chronicles', icon: BookOpen }
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center magical-glow">
                <Sparkles className="text-amber-100" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-cinzel font-bold text-amber-100 magical-glow">
                  Mythic Quest
                </h1>
                <p className="text-xs text-amber-200/80 font-merriweather">
                  Wellness Adventure
                </p>
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
                    onClick={() => handleTabClick(item.id)}
                    className={`relative flex items-center px-4 py-2 rounded-lg font-cinzel font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-100 magical-glow'
                        : 'text-amber-200/80 hover:text-amber-100 hover:bg-white/10'
                    }`}
                  >
                    <Icon size={18} className="mr-2" />
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

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <CoinDisplay coins={user.mythicCoins} size="sm" />
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-cinzel font-bold text-amber-100">
                    {user.name}
                  </p>
                  <p className="text-xs text-amber-200/80 font-merriweather">
                    Level {user.level}
                  </p>
                </div>
                
                <Avatar
                  src={user.avatarUrl}
                  alt={user.name}
                  size="md"
                  className="border-2 border-amber-400/50"
                />
                
                <button
                  onClick={onSignOut}
                  className="p-2 text-amber-200/80 hover:text-amber-100 hover:bg-white/10 rounded-lg transition-all duration-200"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg md:hidden">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center magical-glow">
                <Sparkles className="text-amber-100" size={16} />
              </div>
              <div>
                <h1 className="text-lg font-cinzel font-bold text-amber-100 magical-glow">
                  Mythic Quest
                </h1>
              </div>
            </div>

            {/* Mobile User Info & Menu */}
            <div className="flex items-center space-x-3">
              <CoinDisplay coins={user.mythicCoins} size="sm" />
              
              <Avatar
                src={user.avatarUrl}
                alt={user.name}
                size="sm"
                className="border-2 border-amber-400/50"
              />
              
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-amber-200/80 hover:text-amber-100 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-gradient-to-b from-purple-900/98 to-indigo-900/98 backdrop-blur-md border-b border-amber-500/20 shadow-xl">
            <div className="px-4 py-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-6 p-3 bg-white/10 rounded-lg">
                <Avatar
                  src={user.avatarUrl}
                  alt={user.name}
                  size="md"
                  className="border-2 border-amber-400/50"
                />
                <div>
                  <p className="text-sm font-cinzel font-bold text-amber-100">
                    {user.name}
                  </p>
                  <p className="text-xs text-amber-200/80 font-merriweather">
                    Level {user.level} • {user.xp} XP
                  </p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-2 mb-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`relative w-full flex items-center px-4 py-3 rounded-lg font-cinzel font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-100 magical-glow'
                          : 'text-amber-200/80 hover:text-amber-100 hover:bg-white/10'
                      }`}
                    >
                      <Icon size={20} className="mr-3" />
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sign Out */}
              <button
                onClick={() => {
                  onSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-amber-200/80 hover:text-amber-100 hover:bg-white/10 rounded-lg transition-all duration-200 font-cinzel font-medium"
              >
                <LogOut size={20} className="mr-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation for Mobile (Alternative) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-purple-900/98 to-indigo-900/95 backdrop-blur-md border-t border-amber-500/20 shadow-lg md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-amber-100'
                    : 'text-amber-200/60 hover:text-amber-100'
                }`}
              >
                <Icon size={20} className={isActive ? 'magical-glow' : ''} />
                <span className="text-xs font-cinzel mt-1">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;