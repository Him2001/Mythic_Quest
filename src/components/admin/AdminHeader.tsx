import React from 'react';
import { User } from '../../types';
import { LogOut, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

interface AdminHeaderProps {
  currentUser: User;
  onSignOut: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  currentUser, 
  onSignOut, 
  onRefresh,
  isRefreshing = false 
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Mythic Quest Administration Panel</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              icon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              icon={<LogOut size={16} />}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;