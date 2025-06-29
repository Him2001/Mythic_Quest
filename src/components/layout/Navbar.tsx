import React, { useState, useEffect } from 'react';
import { User, Quest } from '../../types';
import { Menu, X, Bell, MessageCircle, Map, Award, Scroll, Home, LogOut, User as UserIcon, Menu as MenuIcon } from 'lucide-react';
import Button from '../ui/Button';
import NotificationBadge from '../ui/NotificationBadge';
import { NotificationService } from '../../utils/notificationService';
import { SoundEffects } from '../../utils/soundEffects';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  quests: Quest[];
}

const Navbar: React.FC<NavbarProps> = ({ user, activeTab, onTabChange, onSignOut, quests }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeQuestsCount, setActiveQuestsCount] = useState(0);
  
  // Calculate active quests count
  useEffect(() => {
    const activeCount = quests.filter(quest => !quest.completed).length;
    setActiveQuestsCount(activeCount);
  }, [quests]);
  
  // Get notification counts
  useEffect(() => {
    if (user) {
      const count = NotificationService.getUnreadNotificationCount(user.id);
      setUnreadNotifications(count);
    }
  }, [user]);
  
  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    setIsMenuOpen(false);
    
    // Play sound effect
    SoundEffects.playSound('tab');
  };
  
  const handleSignOut = () => {
    onSignOut();
    setIsProfileOpen(false);
    
    // Play sound effect
    SoundEffects.playSound('portal');
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="font-cinzel font-bold text-xl sm:text-2xl magical-glow">Mythic Quest</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleTabClick('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'home'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-600 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Home size={18} className="mr-1" />
                <span>Home</span>
              </div>
            </button>
            
            <button
              onClick={() => handleTabClick('quests')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'quests'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-600 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Award size={18} className="mr-1" />
                <span>Quests</span>
                {activeQuestsCount > 0 && (
                  <div className="ml-1 bg-amber-800 text-amber-100 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {activeQuestsCount}
                  </div>
                )}
              </div>
            </button>
            
            <button
              onClick={() => handleTabClick('map')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'map'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-600 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Map size={18} className="mr-1" />
                <span>Map</span>
              </div>
            </button>
            
            <button
              onClick={() => handleTabClick('heroes')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'heroes'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-600 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <MessageCircle size={18} className="mr-1" />
                <span>Heroes</span>
                {unreadNotifications > 0 && (
                  <NotificationBadge count={unreadNotifications} />
                )}
              </div>
            </button>
            
            <button
              onClick={() => handleTabClick('marketplace')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'marketplace'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-600 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Bell size={18} className="mr-1" />
                <span>Market</span>
              </div>
            </button>
            
            <button
              onClick={() => handleTabClick('chronicles')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'chronicles'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-600 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Scroll size={18} className="mr-1" />
                <span>Chronicles</span>
              </div>
            </button>
          </div>
          
          {/* User Menu */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center text-sm font-medium text-amber-100 hover:text-white focus:outline-none"
              >
                <img
                  className="h-8 w-8 rounded-full border-2 border-amber-300"
                  src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                  alt="User avatar"
                />
                <span className="ml-2 mr-1">{user?.name}</span>
                <span className="bg-amber-700 px-2 py-0.5 rounded-full text-xs">
                  Lvl {user?.level}
                </span>
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-amber-100 hover:text-white hover:bg-amber-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X size={24} />
              ) : (
                <MenuIcon size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-amber-600">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => handleTabClick('home')}
              className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                activeTab === 'home'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-700 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Home size={20} className="mr-2" />
                <span>Home</span>
              </div>
            </button>
            
            <button
              onClick={() => handleTabClick('quests')}
              className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                activeTab === 'quests'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award size={20} className="mr-2" />
                  <span>Quests</span>
                </div>
                {activeQuestsCount > 0 && (
                  <div className="bg-amber-800 text-amber-100 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {activeQuestsCount}
                  </div>
                )}
              </div>
            </button>
            
            <button
              onClick={() => handleTabClick('map')}
              className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                activeTab === 'map'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-700 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Map size={20} className="mr-2" />
                <span>Adventure Map</span>
              </div>
            </button>
            
            <button
              onClick={() => handleTabClick('heroes')}
              className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                activeTab === 'heroes'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageCircle size={20} className="mr-2" />
                  <span>Heroes</span>
                </div>
                {unreadNotifications > 0 && (
                  <NotificationBadge count={unreadNotifications} />
                )}
              </div>
            </button>
            
            <button
              onClick={() => handleTabClick('marketplace')}
              className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                activeTab === 'marketplace'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-700 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Bell size={20} className="mr-2" />
                <span>Marketplace</span>
              </div>
            </button>
            
            <button
              onClick={() => handleTabClick('chronicles')}
              className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                activeTab === 'chronicles'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-100 hover:bg-amber-700 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Scroll size={20} className="mr-2" />
                <span>Chronicles</span>
              </div>
            </button>
            
            {/* Mobile profile section */}
            <div className="pt-4 pb-3 border-t border-amber-700">
              <div className="flex items-center px-3">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full border-2 border-amber-300"
                    src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                    alt="User avatar"
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user?.name}</div>
                  <div className="text-sm font-medium text-amber-200">Level {user?.level}</div>
                </div>
              </div>
              <div className="mt-3 px-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleSignOut}
                  icon={<LogOut size={16} />}
                  className="border-amber-300 text-amber-100 hover:bg-amber-700"
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 border-t border-amber-700 z-40">
        <div className="grid grid-cols-5 h-16">
          <button
            onClick={() => handleTabClick('home')}
            className={`flex flex-col items-center justify-center ${
              activeTab === 'home' ? 'text-white' : 'text-amber-200'
            }`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button
            onClick={() => handleTabClick('quests')}
            className={`flex flex-col items-center justify-center relative ${
              activeTab === 'quests' ? 'text-white' : 'text-amber-200'
            }`}
          >
            <Award size={20} />
            <span className="text-xs mt-1">Quests</span>
            {activeQuestsCount > 0 && (
              <div className="absolute top-0 right-1/4 bg-amber-800 text-amber-100 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {activeQuestsCount}
              </div>
            )}
          </button>
          
          <button
            onClick={() => handleTabClick('map')}
            className={`flex flex-col items-center justify-center ${
              activeTab === 'map' ? 'text-white' : 'text-amber-200'
            }`}
          >
            <Map size={20} />
            <span className="text-xs mt-1">Map</span>
          </button>
          
          <button
            onClick={() => handleTabClick('heroes')}
            className={`flex flex-col items-center justify-center relative ${
              activeTab === 'heroes' ? 'text-white' : 'text-amber-200'
            }`}
          >
            <MessageCircle size={20} />
            <span className="text-xs mt-1">Heroes</span>
            {unreadNotifications > 0 && (
              <div className="absolute top-0 right-1/4 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {unreadNotifications}
              </div>
            )}
          </button>
          
          <button
            onClick={() => handleTabClick('chronicles')}
            className={`flex flex-col items-center justify-center ${
              activeTab === 'chronicles' ? 'text-white' : 'text-amber-200'
            }`}
          >
            <Scroll size={20} />
            <span className="text-xs mt-1">Chronicles</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;