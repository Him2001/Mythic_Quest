import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../../utils/supabaseService';
import { Users, TrendingUp, Award, Coins, Activity, UserPlus } from 'lucide-react';

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

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const adminStats = await SupabaseService.getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setIsLoading(false);
    }
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

  const statCards = [
    {
      title: 'Total Users',
      value: formatNumber(stats.totalUsers),
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Active Users',
      value: formatNumber(stats.activeUsers),
      icon: Activity,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'New This Week',
      value: formatNumber(stats.newUsersThisWeek),
      icon: UserPlus,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Total Quests',
      value: formatNumber(stats.totalQuests),
      icon: Award,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      title: 'Total Posts',
      value: formatNumber(stats.totalPosts),
      icon: TrendingUp,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    {
      title: 'Total Coins',
      value: formatNumber(stats.totalCoins),
      icon: Coins,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
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
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className={`${stat.bgColor} rounded-lg shadow-md p-6 border border-gray-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${stat.textColor} text-sm font-medium font-cinzel`}>
                  {stat.title}
                </p>
                <p className={`${stat.textColor} text-3xl font-bold font-cinzel mt-2`}>
                  {stat.value}
                </p>
                {stat.title === 'Total Users' && stats.averageLevel > 0 && (
                  <p className="text-xs text-gray-600 mt-1 font-merriweather">
                    Avg Level: {stats.averageLevel}
                  </p>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStatsCards;