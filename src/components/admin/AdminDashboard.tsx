import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { AdminService } from '../../utils/adminService';
import AdminHeader from './AdminHeader';
import AdminStatsCards from './AdminStatsCards';
import AdminUserTable from './AdminUserTable';
import AdminActivity from './AdminActivity';
import AdminUserProfile from './AdminUserProfile';
import { Users, Activity, Settings, BarChart3, Shield, Crown } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onSignOut: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'settings'>('overview');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const adminStats = AdminService.getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleBackToUsers = () => {
    setSelectedUserId(null);
  };

  const renderTabContent = () => {
    if (selectedUserId) {
      return (
        <AdminUserProfile
          userId={selectedUserId}
          onBack={handleBackToUsers}
        />
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {stats && <AdminStatsCards stats={stats} />}
            <AdminActivity />
          </div>
        );
      case 'users':
        return (
          <AdminUserTable onUserSelect={handleUserSelect} />
        );
      case 'activity':
        return <AdminActivity />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <Settings className="text-amber-600 mr-3" size={24} />
              <h2 className="text-xl font-cinzel font-bold text-gray-800">System Settings</h2>
            </div>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-cinzel font-bold text-gray-800 mb-3">Application Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Environment:</span>
                    <span className="ml-2 text-gray-800">Production</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Version:</span>
                    <span className="ml-2 text-gray-800">1.0.0</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Database:</span>
                    <span className="ml-2 text-gray-800">Supabase</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Storage:</span>
                    <span className="ml-2 text-gray-800">Local + Cloud</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-cinzel font-bold text-gray-800 mb-3">System Health</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">API Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Database Connection</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Authentication Service</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                <div className="flex items-center mb-3">
                  <Crown className="text-amber-600 mr-2" size={20} />
                  <h3 className="font-cinzel font-bold text-amber-800">Administrator Privileges</h3>
                </div>
                <p className="text-amber-700 text-sm font-merriweather">
                  You have full administrative access to the Mythic Quest platform. Use these powers wisely to maintain the wellness realm.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-fantasy bg-cover bg-fixed bg-center relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-500 mx-auto mb-4"></div>
          <p className="text-amber-100 font-cinzel text-xl">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fantasy bg-cover bg-fixed bg-center relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 pointer-events-none" />
      
      {/* Admin Header */}
      <AdminHeader currentUser={currentUser} onSignOut={onSignOut} />
      
      <main className="relative pt-20 pb-6">
        <div className="container mx-auto px-4">
          {/* Admin Badge */}
          <div className="mb-6 flex items-center justify-center">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-full shadow-lg magical-glow">
              <div className="flex items-center">
                <Shield className="mr-2" size={20} />
                <span className="font-cinzel font-bold">Administrator Dashboard</span>
                <Crown className="ml-2" size={20} />
              </div>
            </div>
          </div>

          <div className="relative backdrop-blur-sm bg-white/90 rounded-2xl shadow-xl border border-amber-100/20 overflow-hidden">
            <div className="absolute inset-0 border-4 border-amber-500/10 rounded-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-purple-500/5 pointer-events-none" />
            
            <div className="relative">
              {/* Navigation Tabs */}
              {!selectedUserId && (
                <div className="border-b border-gray-200 bg-white/50">
                  <nav className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`py-4 px-2 border-b-2 font-cinzel font-bold text-sm transition-colors duration-200 flex items-center ${
                        activeTab === 'overview'
                          ? 'border-amber-500 text-amber-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <BarChart3 size={16} className="mr-2" />
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`py-4 px-2 border-b-2 font-cinzel font-bold text-sm transition-colors duration-200 flex items-center ${
                        activeTab === 'users'
                          ? 'border-amber-500 text-amber-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Users size={16} className="mr-2" />
                      Users
                    </button>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className={`py-4 px-2 border-b-2 font-cinzel font-bold text-sm transition-colors duration-200 flex items-center ${
                        activeTab === 'activity'
                          ? 'border-amber-500 text-amber-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Activity size={16} className="mr-2" />
                      Activity
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`py-4 px-2 border-b-2 font-cinzel font-bold text-sm transition-colors duration-200 flex items-center ${
                        activeTab === 'settings'
                          ? 'border-amber-500 text-amber-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </button>
                  </nav>
                </div>
              )}

              {/* Tab Content */}
              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Magical particle effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="magical-particles" />
      </div>
    </div>
  );
};

export default AdminDashboard;