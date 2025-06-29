import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import AdminStatsCards from './AdminStatsCards';
import AdminUserTable from './AdminUserTable';
import AdminUserProfile from './AdminUserProfile';
import AdminActivity from './AdminActivity';
import AdminHeader from './AdminHeader';
import { SupabaseService } from '../../utils/supabaseService';
import { BarChart3, Users, Activity, Settings, Database, Wifi, WifiOff } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onSignOut: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'settings'>('overview');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'profile' | 'edit'>('table');
  const [hasSupabase, setHasSupabase] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          // Test the connection by trying to fetch a simple query
          const users = await SupabaseService.getAllUserProfiles();
          console.log('🔗 Supabase connection test successful, found', users.length, 'users');
          setHasSupabase(true);
          setConnectionStatus('connected');
        } else {
          console.log('⚠️ Supabase not configured, using demo mode');
          setHasSupabase(false);
          setConnectionStatus('disconnected');
        }
      } catch (error) {
        console.warn('❌ Supabase connection failed:', error);
        setHasSupabase(false);
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
  }, []);

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setViewMode('profile');
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setViewMode('edit');
  };

  const handleDeleteUser = (userId: string) => {
    console.log('🗑️ User deleted:', userId);
    // Refresh data if needed
  };

  const handleBackToTable = () => {
    setSelectedUser(null);
    setViewMode('table');
  };

  const handleUserUpdated = () => {
    // Refresh the user table
    setViewMode('table');
    setSelectedUser(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <AdminStatsCards hasSupabase={hasSupabase} />
            <AdminActivity hasSupabase={hasSupabase} />
          </div>
        );
      
      case 'users':
        if (viewMode === 'table') {
          return (
            <AdminUserTable
              hasSupabase={hasSupabase}
              onViewUser={handleViewUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          );
        } else {
          return (
            <AdminUserProfile
              user={selectedUser}
              mode={viewMode as 'profile' | 'edit'}
              hasSupabase={hasSupabase}
              onBack={handleBackToTable}
              onUserUpdated={handleUserUpdated}
            />
          );
        }
      
      case 'activity':
        return <AdminActivity hasSupabase={hasSupabase} />;
      
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">System Settings</h3>
            
            {/* Database Connection Status */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Database Connection</h4>
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                {connectionStatus === 'checking' ? (
                  <>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Checking connection...</span>
                  </>
                ) : connectionStatus === 'connected' ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-500" />
                    <div>
                      <span className="text-sm font-medium text-green-800">Connected to Supabase</span>
                      <p className="text-xs text-gray-600">Real-time data synchronization active</p>
                    </div>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-orange-500" />
                    <div>
                      <span className="text-sm font-medium text-orange-800">Demo Mode</span>
                      <p className="text-xs text-gray-600">Using local data - Connect Supabase for full functionality</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Environment Info */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Environment Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Supabase URL:</span>
                  <span className="font-mono text-xs">
                    {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Not Set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supabase Key:</span>
                  <span className="font-mono text-xs">
                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Not Set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin User:</span>
                  <span className="font-mono text-xs">{currentUser.name}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Application
              </button>
              <button
                onClick={onSignOut}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentUser={currentUser} onSignOut={onSignOut} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status Banner */}
        {connectionStatus !== 'checking' && (
          <div className={`mb-6 p-4 rounded-lg border ${
            hasSupabase 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-orange-50 border-orange-200 text-orange-800'
          }`}>
            <div className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              <span className="font-medium">
                {hasSupabase 
                  ? 'Connected to Supabase - Real-time data active' 
                  : 'Demo Mode - Connect Supabase for full functionality'
                }
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'activity', label: 'Activity', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id as any);
                  if (id !== 'users') {
                    setViewMode('table');
                    setSelectedUser(null);
                  }
                }}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;