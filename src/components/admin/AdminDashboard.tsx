import React, { useState, useEffect } from 'react';
import { User, AdminStats } from '../../types';
import { AdminService } from '../../utils/adminService';
import AdminHeader from './AdminHeader';
import AdminStatsCards from './AdminStatsCards';
import AdminUserTable from './AdminUserTable';
import AdminUserProfile from './AdminUserProfile';
import AdminActivity from './AdminActivity';
import { Users, BarChart3, Activity, Settings } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onSignOut: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const adminStats = AdminService.getAdminStats();
    setStats(adminStats);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleCloseUserProfile = () => {
    setSelectedUserId(null);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
    { id: 'activity', label: 'Activity', icon: <Activity size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
  ];

  return (
    <div className="min-h-screen bg-fantasy bg-cover bg-fixed bg-center relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 pointer-events-none" />
      
      <div className="relative z-10">
        <AdminHeader currentUser={currentUser} onSignOut={onSignOut} />
        
        <div className="container mx-auto px-4 py-6">
          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 max-w-md border-2 border-amber-200">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-3 rounded-md font-cinzel font-bold transition-all duration-200 flex items-center justify-center text-sm ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md magical-glow'
                      : 'text-amber-800 hover:text-amber-900 hover:bg-amber-50'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2 hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="backdrop-blur-sm bg-white/80 rounded-2xl shadow-xl border border-amber-100/20 overflow-hidden">
            <div className="absolute inset-0 border-4 border-amber-500/10 rounded-2xl pointer-events-none" />
            <div className="relative p-6">
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  <AdminStatsCards stats={stats} />
                  <AdminActivity />
                </div>
              )}

              {activeTab === 'users' && (
                <AdminUserTable onUserSelect={handleUserSelect} />
              )}

              {activeTab === 'activity' && (
                <AdminActivity />
              )}

              {activeTab === 'settings' && (
                <div className="text-center py-12">
                  <Settings className="mx-auto mb-4 text-amber-600 magical-glow\" size={48} />
                  <h3 className="text-xl font-cinzel font-bold text-amber-800 mb-2">
                    Admin Settings
                  </h3>
                  <p className="text-amber-700 font-merriweather">
                    Advanced configuration options coming soon...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile Modal */}
        {selectedUserId && (
          <AdminUserProfile
            userId={selectedUserId}
            onClose={handleCloseUserProfile}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;