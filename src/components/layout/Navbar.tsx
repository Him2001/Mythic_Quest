import React, { useState } from 'react';
import { User, Quest } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import NotificationBadge from '../ui/NotificationBadge';
import ProfileDropdown from './ProfileDropdown';
import { NotificationCountService } from '../../utils/notificationCountService';
import { SoundEffects } from '../../utils/soundEffects';
import { 
  Home, 
  Scroll, 
  Map, 
  Users, 
  ShoppingBag, 
  BookOpen, 
  LogOut,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

interface NavbarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  quests: Quest[];
}

const Navbar: React.FC<NavbarProps> = ({ user, activeTab, onTabChange, onSignOut, quests }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(SoundEffects.isEnabledState());

  // Get notification counts
  const unreadMessagesCount = NotificationCountService.getUnreadMessagesCount(user.id);
  const pendingFriendRequestsCount = NotificationCountService.getPendingFriendRequestsCount(user.id);
  const activeQuestsCount = NotificationCountService.getActiveQuestsCount(quests);

  const handleTabClick = (tab: string) => {
    // Play tab switch sound
    SoundEffects.playSound('tab');
    
    // Reset notification counts when tabs are clicked
    if (tab === 'quests') {
      NotificationCountService.markQuestsVisited(user.id);
    } else if (tab === 'heroes') {
      NotificationCountService.markHeroesVisited(user.id);
    }
    
    onTabChange(tab);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    SoundEffects.setEnabled(newState);
    
    // Play confirmation sound if enabling
    if (newState) {
      SoundEffects.playSound('chime');
    }
  };

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      notificationCount: 0,
      soundEffect: 'portal'
    },
    { 
      id: 'quests', 
      label: 'Quests', 
      icon: Scroll, 
      notificationCount: activeQuestsCount,
      soundEffect: 'magic'
    },
    { 
      id: 'map', 
      label: 'Adventure Map', 
      icon: Map, 
      notificationCount: 0,
      soundEffect: 'movement'
    },
    { 
      id: 'heroes', 
      label: "Hero's Hall", 
      icon: Users, 
      notificationCount: unreadMessagesCount + pendingFriendRequestsCount,
      soundEffect: 'chime'
    },
    { 
      id: 'marketplace', 
      label: 'Marketplace', 
      icon: ShoppingBag, 
      notificationCount: 0,
      soundEffect: 'coin'
    },
    { 
      id: 'chronicles', 
      label: 'Chronicles', 
      icon: BookOpen, 
      notificationCount: 0,
      soundEffect: 'sparkle'
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 shadow-2xl border-b-4 border-amber-600">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg magical-glow">
              <Scroll className="text-amber-900" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-cinzel font-bold text-amber-100 magical-glow">
                Mythic Quest
              </h1>
              <p className="text-xs text-amber-200 font-merriweather">
                Wellness Adventure
              </p>
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
                  onClick={() => {
                    SoundEffects.playSound(item.soundEffect);
                    handleTabClick(item.id);
                  }}
                  className={`relative flex items-center px-4 py-2 rounded-lg font-cinzel font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-600 text-amber-100 shadow-lg magical-glow'
                      : 'text-amber-200 hover:text-amber-100 hover:bg-amber-700/50'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  <span className="text-sm">{item.label}</span>
                  {item.notificationCount > 0 && (
                    <NotificationBadge count={item.notificationCount} />
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile & Controls */}
          <div className="flex items-center space-x-4">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg text-amber-200 hover:text-amber-100 hover:bg-amber-700/50 transition-all duration-200"
              title={soundEnabled ? 'Disable Sound Effects' : 'Enable Sound Effects'}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            {/* User Level Badge */}
            <Badge color="warning" className="magical-glow">
              Level {user.level}
            </Badge>

            {/* User Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  SoundEffects.playSound('click');
                  setShowProfileDropdown(!showProfileDropdown);
                }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-amber-700/50 transition-all duration-200"
              >
                <Avatar
                  src={user.avatarUrl}
                  alt={user.name}
                  size="sm"
                  className="border-2 border-amber-400 magical-glow"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-cinzel font-bold text-amber-100">
                    {user.name}
                  </p>
                  <p className="text-xs text-amber-200 font-merriweather">
                    {user.mythicCoins} coins
                  </p>
                </div>
              </button>

              {showProfileDropdown && (
                <ProfileDropdown
                  user={user}
                  onSignOut={() => {
                    SoundEffects.playSound('portal');
                    onSignOut();
                  }}
                  onClose={() => setShowProfileDropdown(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex items-center justify-between space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    SoundEffects.playSound(item.soundEffect);
                    handleTabClick(item.id);
                  }}
                  className={`relative flex flex-col items-center px-3 py-2 rounded-lg font-cinzel font-bold transition-all duration-300 min-w-0 flex-1 ${
                    isActive
                      ? 'bg-amber-600 text-amber-100 shadow-lg magical-glow'
                      : 'text-amber-200 hover:text-amber-100 hover:bg-amber-700/50'
                  }`}
                >
                  <Icon size={16} className="mb-1" />
                  <span className="text-xs truncate">{item.label}</span>
                  {item.notificationCount > 0 && (
                    <NotificationBadge count={item.notificationCount} size="sm" />
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