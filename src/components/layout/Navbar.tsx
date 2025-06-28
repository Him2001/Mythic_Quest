import React, { useState, useEffect } from 'react';
import { User, Quest } from '../../types';
import { NotificationCountService } from '../../utils/notificationCountService';
import NotificationBadge from '../ui/NotificationBadge';
import { 
  Home, 
  Scroll, 
  Users, 
  Map, 
  ShoppingCart, 
  BookOpen, 
  Bell,
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState({
    unreadMessages: 0,
    pendingFriendRequests: 0,
    activeQuests: 0
  });

  // Update notification counts
  useEffect(() => {
    const updateCounts = () => {
      setNotificationCounts({
        unreadMessages: NotificationCountService.getUnreadMessagesCount(user.id),
        pendingFriendRequests: NotificationCountService.getPendingFriendRequestsCount(user.id),
        activeQuests: NotificationCountService.getActiveQuestsCount(quests)
      });
    };

    updateCounts();
    const interval = setInterval(updateCounts, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [user.id, quests]);

  const totalNotifications = notificationCounts.unreadMessages + 
                           notificationCounts.pendingFriendRequests;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quests', label: 'Quests', icon: Scroll, badge: notificationCounts.activeQuests },
    { id: 'heroes', label: 'Heroes', icon: Users, badge: totalNotifications },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'marketplace', label: 'Shop', icon: ShoppingCart },
    { id: 'chronicles', label: 'Chronicles', icon: BookOpen }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 via-purple-800 to-amber-800 shadow-2xl border-b-4 border-amber-500">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center magical-glow border-2 border-amber-300">
              <span className="text-amber-100 font-cinzel font-bold text-lg">MQ</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-cinzel font-bold text-amber-100 magical-glow">
                Mythic Quest
              </h1>
              <p className="text-amber-200 text-xs font-merriweather">
                Wellness Adventure
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-cinzel font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-500 text-amber-100 shadow-lg magical-glow'
                      : 'text-amber-200 hover:text-amber-100 hover:bg-purple-700/50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <NotificationBadge count={item.badge} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center space-x-1">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-500 text-amber-100 shadow-lg'
                      : 'text-amber-200 hover:text-amber-100 hover:bg-purple-700/50'
                  }`}
                >
                  <Icon size={16} />
                  {item.badge && item.badge > 0 && (
                    <NotificationBadge count={item.badge} />
                  )}
                </button>
              );
            })}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-amber-200 hover:text-amber-100 transition-colors duration-200 rounded-lg hover:bg-purple-700/50"
              >
                <Bell size={20} />
                {totalNotifications > 0 && (
                  <NotificationBadge count={totalNotifications} />
                )}
              </button>
            </div>

            {/* User Avatar and Info - Non-clickable */}
            <div className="flex items-center space-x-3">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-amber-300 magical-glow"
              />
              <div className="hidden md:block text-right">
                <p className="text-amber-100 font-cinzel font-bold text-sm">
                  {user.name}
                </p>
                <p className="text-amber-200 text-xs font-merriweather">
                  Level {user.level}
                </p>
              </div>
              
              {/* Sign Out Button */}
              <button
                onClick={onSignOut}
                className="p-2 text-amber-200 hover:text-amber-100 transition-colors duration-200 rounded-lg hover:bg-purple-700/50"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;