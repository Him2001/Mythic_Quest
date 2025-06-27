import React, { useState, useEffect } from 'react';
import { User, SocialPost } from '../../types';
import { AdminService } from '../../utils/adminService';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { Activity, Users, MessageSquare, UserPlus, TrendingUp } from 'lucide-react';

const AdminActivity: React.FC = () => {
  const [activityData, setActivityData] = useState<{
    newUsers: User[];
    recentPosts: SocialPost[];
    activeUsers: User[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivityData();
  }, []);

  const loadActivityData = async () => {
    setIsLoading(true);
    try {
      const data = AdminService.getRecentActivity();
      setActivityData(data);
    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 font-cinzel">Loading activity data...</p>
        </div>
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="text-center py-12">
        <Activity className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
          No Activity Data
        </h3>
        <p className="text-gray-500 font-merriweather">
          Unable to load recent activity information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Activity className="text-amber-600 mr-3 magical-glow" size={24} />
        <h2 className="text-xl font-cinzel font-bold text-amber-800 magical-glow">
          Recent Activity
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Users */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
          <div className="flex items-center mb-4">
            <UserPlus className="text-blue-600 mr-2" size={20} />
            <h3 className="font-cinzel font-bold text-blue-800">New Users This Week</h3>
          </div>
          
          {activityData.newUsers.length === 0 ? (
            <p className="text-gray-500 font-merriweather text-sm">No new users this week</p>
          ) : (
            <div className="space-y-3">
              {activityData.newUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.name}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel font-bold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 font-merriweather">
                      {formatTimeAgo(user.createdAt)}
                    </p>
                  </div>
                  <Badge color="accent" size="sm">
                    Level {user.level}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="text-green-600 mr-2" size={20} />
            <h3 className="font-cinzel font-bold text-green-800">Active Users (24h)</h3>
          </div>
          
          {activityData.activeUsers.length === 0 ? (
            <p className="text-gray-500 font-merriweather text-sm">No active users in the last 24 hours</p>
          ) : (
            <div className="space-y-3">
              {activityData.activeUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.name}
                    size="sm"
                    status="online"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel font-bold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 font-merriweather">
                      Last seen {formatTimeAgo(user.lastLoginDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-cinzel text-green-600">{user.questsCompleted} quests</p>
                    <p className="text-xs font-cinzel text-amber-600">{user.mythicCoins} coins</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="text-purple-600 mr-2" size={20} />
            <h3 className="font-cinzel font-bold text-purple-800">Recent Posts</h3>
          </div>
          
          {activityData.recentPosts.length === 0 ? (
            <p className="text-gray-500 font-merriweather text-sm">No recent posts</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activityData.recentPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <Avatar
                      src={post.userAvatar}
                      alt={post.userName}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-cinzel font-bold text-gray-800 text-sm truncate">
                          {post.userName}
                        </p>
                        <Badge color="accent" size="sm">
                          Level {post.userLevel}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-700 font-merriweather line-clamp-2 mb-1">
                        {post.content.caption}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{post.likes.length} likes</span>
                        <span>{post.comments.length} comments</span>
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminActivity;