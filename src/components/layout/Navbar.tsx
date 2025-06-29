import React, { useState, useEffect } from 'react';
import { User, Quest } from '../../types';
import { Sword, Home, Map, Users, ShoppingCart, BookOpen, Menu, X, Coins } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import NotificationPanel from './NotificationPanel';
import CoinDisplay from '../ui/CoinDisplay';

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

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quests', label: 'Quests', icon: Sword },
    { id: 'map', label: 'Adventure Map', icon: Map },
    { id: 'heroes', label: 'Hero\'s Hall', icon: Users },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'chronicles', label: 'Chronicles', icon: BookOpen },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 shadow-2xl border-b-4 border-amber-500">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center magical-glow">
                <Sword className="text-amber-100" size={16} />
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
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-cinzel font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-500 text-amber-100 shadow-lg magical-glow'
                        : 'text-amber-200 hover:text-amber-100 hover:bg-purple-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Coin Display */}
              <div className="hidden sm:block">
                <CoinDisplay coins={user.mythicCoins} size="sm" />
              </div>

              {/* Mobile Coin Display */}
              <div className="sm:hidden flex items-center bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-1 rounded-full border border-amber-300">
                <Coins size={12} className="text-amber-100 mr-1" />
                <span className="text-amber-100 text-xs font-cinzel font-bold">
                  {user.mythicCoins.toLocaleString()}
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
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg text-amber-200 hover:text-amber-100 hover:bg-purple-700 transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-purple-700 bg-purple-800/95 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg font-cinzel font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-amber-500 text-amber-100 shadow-lg magical-glow'
                          : 'text-amber-200 hover:text-amber-100 hover:bg-purple-700'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
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