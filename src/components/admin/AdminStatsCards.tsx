import React from 'react';
import { AdminStats } from '../../types';
import { Users, TrendingUp, Award, Coins, UserPlus, BarChart3 } from 'lucide-react';

interface AdminStatsCardsProps {
  stats: AdminStats;
}

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users size={24} />,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: <TrendingUp size={24} />,
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Quests Completed',
      value: stats.totalQuestsCompleted.toLocaleString(),
      icon: <Award size={24} />,
      color: 'from-amber-500 to-yellow-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Total XP Earned',
      value: stats.totalXPEarned.toLocaleString(),
      icon: <BarChart3 size={24} />,
      color: 'from-purple-500 to-violet-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Mythic Coins',
      value: stats.totalCoinsEarned.toLocaleString(),
      icon: <Coins size={24} />,
      color: 'from-orange-500 to-red-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'New This Week',
      value: stats.newUsersThisWeek.toLocaleString(),
      icon: <UserPlus size={24} />,
      color: 'from-indigo-500 to-blue-500',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    }
  ];

  return (
    <div>
      <div className="flex items-center mb-6">
        <BarChart3 className="text-amber-600 mr-3 magical-glow" size={24} />
        <h2 className="text-xl font-cinzel font-bold text-amber-800 magical-glow">
          Platform Statistics
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} ${card.borderColor} border-2 rounded-lg p-6 magical-glow transition-transform duration-300 hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color} text-white magical-glow`}>
                {card.icon}
              </div>
            </div>
            
            <div>
              <h3 className={`text-2xl font-cinzel font-bold ${card.textColor} mb-1`}>
                {card.value}
              </h3>
              <p className={`text-sm font-merriweather ${card.textColor}/80`}>
                {card.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-6">
          <h3 className="font-cinzel font-bold text-amber-800 mb-2 flex items-center">
            <Award className="mr-2 magical-glow" size={20} />
            Average User Level
          </h3>
          <p className="text-3xl font-cinzel font-bold text-amber-700">
            {stats.averageLevel}
          </p>
          <p className="text-sm text-amber-600 font-merriweather">
            Community progression metric
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-lg p-6">
          <h3 className="font-cinzel font-bold text-purple-800 mb-2 flex items-center">
            <Users className="mr-2 magical-glow" size={20} />
            Social Posts
          </h3>
          <p className="text-3xl font-cinzel font-bold text-purple-700">
            {stats.totalPosts}
          </p>
          <p className="text-sm text-purple-600 font-merriweather">
            Community engagement level
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsCards;