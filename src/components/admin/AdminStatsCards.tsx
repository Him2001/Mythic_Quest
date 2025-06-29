import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../../utils/supabaseService';
import { Users, TrendingUp, Award, Coins, UserPlus, Activity } from 'lucide-react';

interface AdminStatsCardsProps {
  className?: string;
}

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ className = '' }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalQuests: 0,
    totalCoins: 0,
    newUsersThisWeek: 0,
    averageLevel: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const users = await SupabaseService.getAllUserProfiles();
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Calculate stats
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.is_active !== false).length;
      const totalQuests = users.reduce((sum, user) => sum + (user.total_quests_completed || 0), 0);
      const totalCoins = users.reduce((sum, user) => sum + (user.coins || 0), 0);
      const newUsersThisWeek = users.filter(user => {
        const userDate = new Date(user.date_created || user.created_at);
        return userDate > oneWeekAgo;
      }).length;
      const averageLevel = totalUsers > 0 
        ? users.reduce((sum, user) => sum + (user.level || 1), 0) / totalUsers 
        : 0;

      setStats({
        totalUsers,
        activeUsers,
        totalQuests,
        totalCoins,
        newUsersThisWeek,
        averageLevel: Math.round(averageLevel * 10) / 10
      });
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-cinzel text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 font-cinzel mt-1">
            {loading ? '...' : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 font-merriweather mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon={Users}
        color="#3B82F6"
        subtitle="Registered adventurers"
      />
      
      <StatCard
        title="Active Users"
        value={stats.activeUsers}
        icon={Activity}
        color="#10B981"
        subtitle="Currently active"
      />
      
      <StatCard
        title="New This Week"
        value={stats.newUsersThisWeek}
        icon={UserPlus}
        color="#8B5CF6"
        subtitle="Recent signups"
      />
      
      <StatCard
        title="Total Quests"
        value={stats.totalQuests}
        icon={Award}
        color="#F59E0B"
        subtitle="Completed by all users"
      />
      
      <StatCard
        title="Total Coins"
        value={stats.totalCoins.toLocaleString()}
        icon={Coins}
        color="#EF4444"
        subtitle="Earned across platform"
      />
      
      <StatCard
        title="Average Level"
        value={stats.averageLevel}
        icon={TrendingUp}
        color="#06B6D4"
        subtitle="User progression"
      />
    </div>
  );
};

export default AdminStatsCards;