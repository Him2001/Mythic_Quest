import React, { useState } from 'react';
import { User } from '../../types';
import AdminHeader from './AdminHeader';
import AdminStatsCards from './AdminStatsCards';
import AdminUserTable from './AdminUserTable';
import AdminActivity from './AdminActivity';
import { BarChart3, Users, Activity, Settings } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onSignOut: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'settings'>('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <AdminStatsCards refreshTrigger={refreshTrigger} />
            <AdminActivity />
          </div>
        );
      case 'users':
        return <AdminUserTable refreshTrigger={refreshTrigger} />;
      case 'activity':
        return <AdminActivity />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Database Connection</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      import.meta.env.VITE_SUPABASE_URL ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {import.meta.env.VITE_SUPABASE_URL ? 'Supabase Connected' : 'Supabase Not Configured'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {import.meta.env.VITE_SUPABASE_URL 
                      ? 'Admin dashboard is connected to your Supabase database.'
                      : 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables to connect to Supabase.'
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Capabilities</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• View and manage all user accounts</li>
                    <li>• Monitor platform statistics and activity</li>
                    <li>• Activate/deactivate user accounts</li>
                    <li>• Delete user accounts (with confirmation)</li>
                    <li>• Assign special quests to users</li>
                    <li>• View detailed user activity logs</li>
                  </ul>
                </div>
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
        onRefresh={handleRefresh}
        isRefreshing={false}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="mr-2" size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;