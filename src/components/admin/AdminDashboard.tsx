import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import AdminHeader from './AdminHeader';
import AdminStatsCards from './AdminStatsCards';
import AdminUserTable from './AdminUserTable';
import AdminUserProfile from './AdminUserProfile';
import AdminActivity from './AdminActivity';
import { SupabaseService } from '../../utils/supabaseService';
import { 
  BarChart3, 
  Users, 
  Activity, 
  Settings,
  RefreshCw,
  Database,
  Shield
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onSignOut: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'settings'>('overview');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      // Try to fetch a simple query to test connection
      const users = await SupabaseService.getAllUserProfiles();
      setIsSupabaseConnected(true);
    } catch (error) {
      console.warn('Supabase connection check failed:', error);
      setIsSupabaseConnected(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    checkSupabaseConnection();
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setRefreshTrigger(prev => prev + 1); // Refresh data when going back
  };

  const handleUserUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    if (activeTab === 'users' && selectedUser) {
      return (
        <AdminUserProfile
          user={selectedUser}
          onBack={handleBackToUsers}
          onUserUpdate={handleUserUpdate}
        />
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-cinzel font-bold text-gray-800">Platform Overview</h2>
              <div className="flex items-center space-x-3">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-cinzel ${
                  isSupabaseConnected 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <Database size={14} className="mr-1" />
                  {isSupabaseConnected ? 'Database Connected' : 'Database Offline'}
                </div>
                <button
                  onClick={handleRefresh}
                  className="flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-cinzel hover:bg-amber-200 transition-colors"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Refresh
                </button>
              </div>
            </div>
            
            <AdminStatsCards refreshTrigger={refreshTrigger} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-cinzel font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Users className="text-blue-600 mr-3" size={20} />
                      <div>
                        <div className="font-medium text-blue-800 font-cinzel">Manage Users</div>
                        <div className="text-sm text-blue-600 font-merriweather">View, edit, and manage user accounts</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('activity')}
                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Activity className="text-green-600 mr-3" size={20} />
                      <div>
                        <div className="font-medium text-green-800 font-cinzel">View Activity</div>
                        <div className="text-sm text-green-600 font-merriweather">Monitor platform activity and engagement</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-cinzel font-bold text-gray-800 mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 font-cinzel">Database</span>
                    <span className={`text-sm font-cinzel ${
                      isSupabaseConnected ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isSupabaseConnected ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 font-cinzel">Authentication</span>
                    <span className="text-sm text-green-600 font-cinzel">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 font-cinzel">Real-time Features</span>
                    <span className={`text-sm font-cinzel ${
                      isSupabaseConnected ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {isSupabaseConnected ? 'Active' : 'Limited'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-cinzel font-bold text-gray-800">User Management</h2>
              <button
                onClick={handleRefresh}
                className="flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-cinzel hover:bg-amber-200 transition-colors"
              >
                <RefreshCw size={14} className="mr-1" />
                Refresh
              </button>
            </div>
            <AdminUserTable 
              onUserSelect={handleUserSelect} 
              refreshTrigger={refreshTrigger}
            />
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-cinzel font-bold text-gray-800">Platform Activity</h2>
              <button
                onClick={handleRefresh}
                className="flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-cinzel hover:bg-amber-200 transition-colors"
              >
                <RefreshCw size={14} className="mr-1" />
                Refresh
              </button>
            </div>
            <AdminActivity refreshTrigger={refreshTrigger} />
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-cinzel font-bold text-gray-800">Admin Settings</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-cinzel font-bold text-gray-800 mb-4">System Configuration</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="text-blue-600 mr-3" size={20} />
                    <div>
                      <div className="font-medium text-gray-800 font-cinzel">Database Connection</div>
                      <div className="text-sm text-gray-600 font-merriweather">
                        {isSupabaseConnected ? 'Connected to Supabase' : 'Running in demo mode'}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-cinzel ${
                    isSupabaseConnected 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {isSupabaseConnected ? 'Live' : 'Demo'}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-800 font-cinzel mb-2">Admin Privileges</h4>
                  <ul className="text-sm text-amber-700 font-merriweather space-y-1">
                    <li>• View and manage all user accounts</li>
                    <li>• Edit user information and stats</li>
                    <li>• Assign special quests and rewards</li>
                    <li>• Monitor platform activity and engagement</li>
                    <li>• Access comprehensive analytics</li>
                  </ul>
                </div>

                {!isSupabaseConnected && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 font-cinzel mb-2">Demo Mode Notice</h4>
                    <p className="text-sm text-blue-700 font-merriweather">
                      Currently running in demo mode. To enable full functionality with real user data, 
                      connect to Supabase by clicking the "Connect to Supabase" button in the top navigation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader 
        currentUser={currentUser} 
        onSignOut={onSignOut}
        isSupabaseConnected={isSupabaseConnected}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-cinzel font-bold text-gray-800 mb-4">Admin Panel</h2>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setSelectedUser(null); // Clear selected user when changing tabs
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors font-cinzel ${
                      activeTab === tab.id
                        ? 'bg-amber-100 text-amber-800 font-bold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent size={18} className="mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;