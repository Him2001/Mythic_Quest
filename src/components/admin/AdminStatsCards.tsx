import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../../utils/supabaseService';
import { Users, TrendingUp, Award, Coins, Activity, MessageSquare, RefreshCw } from 'lucide-react';

interface AdminStatsCardsProps {
  refreshTrigger?: number;
}

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ refreshTrigger = 0 }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisWeek: 0,
    totalQuests: 0,
    totalPosts: 0,
    totalCoins: 0,
    averageLevel: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'demo' | 'error'>('demo');

  const loadStats = async () => {
    setIsLoading(true);
    console.log('🔄 Loading admin stats...');
    
    try {
      // Check if Supabase is available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('📊 Supabase not configured, using demo stats');
        setConnectionStatus('demo');
        setStats({
          totalUsers: 2,
          activeUsers: 2,
          newUsersThisWeek: 2,
          totalQuests: 15,
          totalPosts: 8,
          totalCoins: 450,
          averageLevel: 3.5
        });
        setLastUpdated(new Date());
        return;
      }

      setConnectionStatus('connected');
      const adminStats = await SupabaseService.getAdminStats();
      console.log('📊 Received admin stats:', adminStats);
      
      setStats(adminStats);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('❌ Error loading admin stats:', error);
      setConnectionStatus('error');
      
      // Fallback to demo data
      setStats({
        totalUsers: 2,
        activeUsers: 2,
        newUsersThisWeek: 2,
        totalQuests: 15,
        totalPosts: 8,
        totalCoins: 450,
        averageLevel: 3.5
      });
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'demo': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected to Supabase';
      case 'demo': return 'Demo Mode (Supabase not configured)';
      case 'error': return 'Connection Error - Using fallback data';
      default: return 'Unknown status';
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: formatNumber(stats.totalUsers),
      icon: Users,
      color: 'bg-blue-500',
      change: stats.newUsersThisWeek > 0 ? `+${stats.newUsersThisWeek} this week` : 'No new users this week'
    },
    {
      title: 'Active Users',
      value: formatNumber(stats.activeUsers),
      icon: Activity,
      color: 'bg-green-500',
      change: `${Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% of total`
    },
    {
      title: 'New This Week',
      value: formatNumber(stats.newUsersThisWeek),
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: 'Recent registrations'
    },
    {
      title: 'Total Quests',
      value: formatNumber(stats.totalQuests),
      icon: Award,
      color: 'bg-amber-500',
      change: 'Completed by all users'
    },
    {
      title: 'Social Posts',
      value: formatNumber(stats.totalPosts),
      icon: MessageSquare,
      color: 'bg-pink-500',
      change: 'Community engagement'
    },
    {
      title: 'Total Coins',
      value: formatNumber(stats.totalCoins),
      icon: Coins,
      color: 'bg-yellow-500',
      change: `Avg level: ${stats.averageLevel}`
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Connection Status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'demo' ? 'bg-orange-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-sm font-medium ${getConnectionStatusColor()}`}>
            {getConnectionStatusText()}
          </span>
        </div>
        
        {lastUpdated && (
          <div className="flex items-center text-xs text-gray-500">
            <RefreshCw size={12} className="mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Debug Information */}
      {connectionStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <strong>Debug Info:</strong> Unable to connect to Supabase. Check your environment variables and database connection.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminStatsCards;