import React from 'react';
import { User } from '../../types';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { Shield, LogOut, Crown } from 'lucide-react';

interface AdminHeaderProps {
  currentUser: User;
  onSignOut: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ currentUser, onSignOut }) => {
  return (
    <header className="bg-gradient-to-r from-mystic-dark/95 to-purple-900/95 shadow-lg border-b border-amber-900/20 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex items-center mr-6">
              <Shield className="text-amber-400 mr-3 magical-glow" size={28} />
              <div>
                <h1 className="text-xl font-cinzel font-bold text-amber-100 magical-glow">
                  Admin Dashboard
                </h1>
                <p className="text-amber-200/80 text-xs font-merriweather">
                  Mythic Quest Management Portal
                </p>
              </div>
            </div>
          </div>
          
          {/* Admin user info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-500/30">
              <Crown className="text-amber-400 mr-2 magical-glow" size={16} />
              <span className="text-amber-200 font-cinzel text-sm">Administrator</span>
            </div>
            
            <div className="flex items-center magical-glow">
              <Avatar
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                size="sm"
                className="border-2 border-amber-500"
              />
              <span className="ml-2 text-sm font-cinzel font-medium text-amber-100 hidden md:block">
                {currentUser.name}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              icon={<LogOut size={16} />}
              className="text-amber-200 border-amber-500/50 hover:bg-amber-500/20"
            >
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;