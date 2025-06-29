import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../../utils/supabaseService';
import { Users, UserPlus, Trophy, MessageSquare, Coins, TrendingUp, Activity, RefreshCw } from 'lucide-react';

interface AdminStatsCardsProps {
  hasSupabase: boolean;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  totalQuests: number;
  totalPosts: number;
  totalCoins: number;
  averageLevel: number;
}

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ hasSupabase }) => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisWeek: 0,
    totalQuests: 0,
    totalPosts: 0,
    totalCoins: 0,
    averageLevel: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadStats = async () => {
    setIsLoading(true);
    try {
      if (hasSupabase) {
        console.log('🔄 Loading admin stats from Supabase...');
        const adminStats = await SupabaseService.getAdminStats();
        console.log('📊 Admin stats loaded:', adminStats);
        setStats(adminStats);
      } else {
        // Demo mode fallback
        console.log('📊 Using demo mode stats');
        setStats({
          totalUsers: 2,
          activeUsers: 2,
          newUsersThisWeek: 2,
          totalQuests: 15,
          totalPosts: 8,
          totalCoins: 1250,
          averageLevel: 3.5
        });
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error loading admin stats:', error);
      // Fallback stats
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisWeek: 0,
        totalQuests: 0,
        totalPosts: 0,
        totalCoins: 0,
        averageLevel: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [hasSupabase]);

  const handleRefresh = () => {
    loadStats();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
          <p className="text-gray-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
            {!hasSupabase && (
              <span className="ml-2 text-orange-600 font-medium">(Demo Mode)</span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          icon={Users}
          color="bg-blue-500"
          subtitle="Registered accounts"
        />
        
        <StatCard
          title="Active Users"
          value={formatNumber(stats.activeUsers)}
          icon={Activity}
          color="bg-green-500"
          subtitle="Active in last 30 days"
        />
        
        <StatCard
          title="New Users This Week"
          value={formatNumber(stats.newUsersThisWeek)}
          icon={UserPlus}
          color="bg-purple-500"
          subtitle="Weekly growth"
        />
        
        <StatCard
          title="Total Quests"
          value={formatNumber(stats.totalQuests)}
          icon={Trophy}
          color="bg-amber-500"
          subtitle="Completed challenges"
        />
        
        <StatCard
          title="Social Posts"
          value={formatNumber(stats.totalPosts)}
          icon={MessageSquare}
          color="bg-pink-500"
          subtitle="Community engagement"
        />
        
        <StatCard
          title="Total Coins"
          value={formatNumber(stats.totalCoins)}
          icon={Coins}
          color="bg-yellow-500"
          subtitle="In circulation"
        />
        
        <StatCard
          title="Average Level"
          value={stats.averageLevel.toFixed(1)}
          icon={TrendingUp}
          color="bg-indigo-500"
          subtitle="User progression"
        />
      </div>

      {/* Connection Status */}
      <div className="mt-6 p-4 rounded-lg border">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${hasSupabase ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          <span className="text-sm font-medium">
            {hasSupabase ? 'Connected to Supabase Database' : 'Running in Demo Mode'}
          </span>
          {hasSupabase && (
            <span className="ml-2 text-xs text-gray-500">
              Real-time data sync enabled
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStatsCards;