import React, { useState, useRef, useEffect } from 'react';
import { User, Quest } from '../../types';
import { NotificationCountService } from '../../utils/notificationCountService';
import { 
  Home, 
  Sparkles, 
  Map, 
  Users, 
  ShoppingCart, 
  ScrollText, 
  Coins,
  ChevronDown,
  VolumeX,
  Volume2,
  LogOut
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get notification counts
  const pendingFriendRequestsCount = NotificationCountService.getPendingFriendRequestsCount(user.id);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleAudioToggle = () => {
    setAudioEnabled(!audioEnabled);
  };

  const handleSignOut = () => {
    setShowDropdown(false);
    onSignOut();
  };

  const navItems = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'quests', label: 'QUESTS', icon: Sparkles, badge: quests.filter(q => !q.completed).length },
    { id: 'map', label: 'ADVENTURE MAP', icon: Map },
    { id: 'heroes', label: 'HEROES', icon: Users, badge: pendingFriendRequestsCount },
    { id: 'marketplace', label: 'MARKETPLACE', icon: ShoppingCart },
    { id: 'chronicles', label: 'CHRONICLES', icon: ScrollText }
  ];

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-purple-800 to-orange-600 shadow-lg border-b-4 border-amber-500/30 relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 min-w-0 flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg magical-glow border-2 border-amber-300">
              <Sparkles className="text-amber-100" size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-amber-100 font-cinzel font-bold text-lg sm:text-xl leading-tight whitespace-nowrap">
                MYTHIC QUEST
              </h1>
              <p className="text-amber-200 text-xs font-merriweather leading-tight whitespace-nowrap">
                Wellness Adventure
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl mx-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg font-cinzel font-bold text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-amber-500 text-white shadow-lg magical-glow'
                    : 'text-amber-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right Side - Coins and User */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Coins Display */}
            <div className="flex items-center bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-full font-cinzel font-bold shadow-lg magical-glow border-2 border-amber-300">
              <Coins size={18} className="mr-2" />
              <span className="text-lg">{user.mythicCoins}</span>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleUserClick}
                className="flex items-center space-x-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-full font-cinzel font-bold shadow-lg hover:shadow-xl transition-all duration-300 magical-glow border-2 border-amber-300"
              >
                <img 
                  src={user.avatarUrl} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-amber-200"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-bold leading-tight">{user.name.toUpperCase()}</div>
                  <div className="text-xs text-amber-100 leading-tight">LEVEL {user.level}</div>
                </div>
                <ChevronDown size={16} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-amber-200 z-50 overflow-hidden">
                  {/* User Info Header */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 border-b border-amber-200">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-amber-300"
                      />
                      <div>
                        <h3 className="font-cinzel font-bold text-amber-800 text-lg">{user.name.toUpperCase()}</h3>
                        <p className="text-amber-600 text-sm font-merriweather">{user.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-cinzel font-bold">
                            Level {user.level}
                          </span>
                          <span className="text-amber-700 text-xs font-cinzel">{user.xp} XP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-4 border-b border-amber-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-cinzel font-bold text-amber-600">{user.questsCompleted}</div>
                        <div className="text-xs text-amber-700 font-merriweather">Quests</div>
                      </div>
                      <div>
                        <div className="text-2xl font-cinzel font-bold text-amber-600">{user.mythicCoins}</div>
                        <div className="text-xs text-amber-700 font-merriweather">Coins</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={handleAudioToggle}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-amber-50 rounded-lg transition-colors duration-200"
                    >
                      {audioEnabled ? (
                        <Volume2 className="text-green-600" size={18} />
                      ) : (
                        <VolumeX className="text-red-600" size={18} />
                      )}
                      <span className="font-cinzel text-gray-700">
                        {audioEnabled ? 'Audio Enabled' : 'Audio Muted (Dev)'}
                      </span>
                    </button>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors duration-200 text-red-600"
                    >
                      <LogOut size={18} />
                      <span className="font-cinzel">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-4">
          <div className="grid grid-cols-3 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center space-y-1 p-2 rounded-lg font-cinzel font-bold text-xs transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-amber-500 text-white shadow-lg magical-glow'
                    : 'text-amber-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={16} />
                <span className="text-center leading-tight">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-lg">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;