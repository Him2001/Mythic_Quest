import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { SupabaseService } from '../../utils/supabaseService';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { ArrowLeft, Mail, Calendar, Award, Coins, MapPin, Activity, Trash2, UserCheck, UserX } from 'lucide-react';

interface AdminUserProfileProps {
  userId: string;
  onBack: () => void;
  onDeleteUser: (userId: string) => void;
}

const AdminUserProfile: React.FC<AdminUserProfileProps> = ({ userId, onBack, onDeleteUser }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [profile, stats] = await Promise.all([
        SupabaseService.getUserProfile(userId),
        SupabaseService.getUserStats(userId)
      ]);

      if (!profile) {
        setError('User not found');
        return;
      }

      setUser(profile);
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    
    if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      try {
        const success = await SupabaseService.deleteUser(userId);
        if (success) {
          onDeleteUser(userId);
          onBack();
        } else {
          alert('Failed to delete user. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-800 font-cinzel">Loading user profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <UserX className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="text-lg font-cinzel font-bold text-gray-600 mb-2">
            {error || 'User Not Found'}
          </h3>
          <Button variant="primary" onClick={onBack} icon={<ArrowLeft size={16} />}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            icon={<ArrowLeft size={16} />}
            className="font-cinzel"
          >
            Back to Users
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDeleteUser}
            icon={<Trash2 size={16} />}
            className="text-red-600 hover:text-red-700 font-cinzel"
          >
            Delete User
          </Button>
        </div>

        {/* User Info */}
        <div className="flex items-start space-x-6">
          <Avatar
            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.username}
            size="xl"
          />
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-cinzel font-bold text-gray-900">
                {user.username || 'Unknown User'}
              </h1>
              <Badge 
                color={user.is_active !== false ? 'success' : 'error'} 
                size="sm"
              >
                {user.is_active !== false ? 'Active' : 'Inactive'}
              </Badge>
              <Badge color="accent" size="sm">
                Level {user.level || 1}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail size={16} className="mr-2" />
                <span className="font-merriweather">{user.email || 'No email'}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                <span className="font-merriweather">
                  Joined {formatDate(user.date_created || user.created_at)}
                </span>
              </div>
              
              <div className="flex items-center">
                <Activity size={16} className="mr-2" />
                <span className="font-merriweather">
                  Last updated {formatDate(user.updated_at || user.date_created || user.created_at)}
                </span>
              </div>
            </div>

            {user.bio && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 font-merriweather">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-cinzel text-gray-600 uppercase">Experience</p>
              <p className="text-2xl font-bold text-blue-600 font-cinzel">{user.xp || 0}</p>
              <p className="text-xs text-gray-500 font-merriweather">XP earned</p>
            </div>
            <Award className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-cinzel text-gray-600 uppercase">Coins</p>
              <p className="text-2xl font-bold text-amber-600 font-cinzel">{user.coins || 0}</p>
              <p className="text-xs text-gray-500 font-merriweather">Mythic coins</p>
            </div>
            <Coins className="text-amber-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-cinzel text-gray-600 uppercase">Quests</p>
              <p className="text-2xl font-bold text-green-600 font-cinzel">{user.total_quests_completed || 0}</p>
              <p className="text-xs text-gray-500 font-merriweather">Completed</p>
            </div>
            <Award className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-cinzel text-gray-600 uppercase">Walking</p>
              <p className="text-2xl font-bold text-purple-600 font-cinzel">
                {formatDistance(user.total_walking_distance || 0)}
              </p>
              <p className="text-xs text-gray-500 font-merriweather">Total distance</p>
            </div>
            <MapPin className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Activity Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-cinzel font-bold text-gray-800 mb-4">Activity Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-cinzel font-bold text-gray-700 mb-3">Wellness Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-merriweather">Daily Walking Distance:</span>
                <span className="text-sm font-bold text-gray-900 font-cinzel">
                  {formatDistance(user.daily_walking_distance || 0)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-merriweather">Total Walking Distance:</span>
                <span className="text-sm font-bold text-gray-900 font-cinzel">
                  {formatDistance(user.total_walking_distance || 0)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-merriweather">Last Walking Date:</span>
                <span className="text-sm font-bold text-gray-900 font-cinzel">
                  {user.last_walking_date || 'Never'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-cinzel font-bold text-gray-700 mb-3">Platform Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-merriweather">Total Posts:</span>
                <span className="text-sm font-bold text-gray-900 font-cinzel">
                  {userStats?.totalPosts || 0}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-merriweather">Account Status:</span>
                <Badge 
                  color={user.is_active !== false ? 'success' : 'error'} 
                  size="sm"
                >
                  {user.is_active !== false ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-merriweather">User ID:</span>
                <span className="text-xs font-mono text-gray-500 break-all">
                  {user.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;