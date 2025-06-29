import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../../utils/supabaseService';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { 
  ArrowLeft, 
  Edit, 
  Award, 
  Coins, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  MessageSquare,
  Crown,
  Activity,
  Users,
  BookOpen
} from 'lucide-react';

interface AdminUserProfileProps {
  user: any;
  onBack: () => void;
  onUserUpdate: () => void;
}

const AdminUserProfile: React.FC<AdminUserProfileProps> = ({ user, onBack, onUserUpdate }) => {
  const [userActivity, setUserActivity] = useState({
    quests: [],
    posts: [],
    chronicles: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);

  useEffect(() => {
    loadUserActivity();
  }, [user.id]);

  const loadUserActivity = async () => {
    setIsLoading(true);
    try {
      const activity = await SupabaseService.getUserActivity(user.id);
      setUserActivity(activity);
    } catch (error) {
      console.error('Failed to load user activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (updates: any) => {
    try {
      const success = await SupabaseService.adminUpdateUserProfile(user.id, updates);
      if (success) {
        onUserUpdate();
        setShowEditModal(false);
        alert('User updated successfully');
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleAssignQuest = async (questData: any) => {
    try {
      const success = await SupabaseService.assignSpecialQuest(user.id, questData);
      if (success) {
        loadUserActivity();
        onUserUpdate();
        setShowQuestModal(false);
        alert('Special quest assigned successfully');
      } else {
        alert('Failed to assign quest');
      }
    } catch (error) {
      console.error('Error assigning quest:', error);
      alert('Error assigning quest');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            icon={<ArrowLeft size={20} />}
            className="text-white hover:bg-white/20"
          >
            Back to Users
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(true)}
              icon={<Edit size={16} />}
              className="text-white border-white hover:bg-white hover:text-amber-600"
            >
              Edit User
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowQuestModal(true)}
              icon={<Award size={16} />}
              className="text-white border-white hover:bg-white hover:text-amber-600"
            >
              Assign Quest
            </Button>
          </div>
        </div>

        <div className="flex items-center">
          <Avatar
            src={user.avatar_url}
            alt={user.username}
            size="xl"
            className="mr-6 border-4 border-white/20"
          />
          <div>
            <div className="flex items-center mb-2">
              <h1 className="text-3xl font-cinzel font-bold mr-3">{user.username}</h1>
              {user.level >= 10 && (
                <Crown className="text-yellow-300" size={24} />
              )}
            </div>
            <p className="text-amber-100 font-merriweather mb-2">{user.email}</p>
            <div className="flex items-center space-x-4">
              <Badge 
                color={user.is_active ? 'success' : 'error'}
                className="bg-white/20 text-white border-white/30"
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-amber-100 font-merriweather text-sm">
                Joined {formatTimeAgo(user.date_created)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-cinzel font-bold text-gray-800">{user.level}</div>
            <div className="text-sm text-gray-600 font-merriweather">Level</div>
            <div className="text-xs text-gray-500 font-merriweather">{user.xp || 0} XP</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
              <Coins className="text-yellow-600" size={24} />
            </div>
            <div className="text-2xl font-cinzel font-bold text-gray-800">{user.coins || 0}</div>
            <div className="text-sm text-gray-600 font-merriweather">Coins</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
              <Award className="text-green-600" size={24} />
            </div>
            <div className="text-2xl font-cinzel font-bold text-gray-800">{user.total_quests_completed || 0}</div>
            <div className="text-sm text-gray-600 font-merriweather">Quests</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
              <MapPin className="text-purple-600" size={24} />
            </div>
            <div className="text-2xl font-cinzel font-bold text-gray-800">
              {Math.round((user.total_walking_distance || 0) / 1000)}
            </div>
            <div className="text-sm text-gray-600 font-merriweather">KM Walked</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-cinzel font-bold text-gray-800 mb-4">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar className="text-gray-400 mr-3" size={16} />
              <div>
                <div className="text-sm font-medium text-gray-700 font-cinzel">Account Created</div>
                <div className="text-sm text-gray-600 font-merriweather">{formatDate(user.date_created)}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Activity className="text-gray-400 mr-3" size={16} />
              <div>
                <div className="text-sm font-medium text-gray-700 font-cinzel">Last Updated</div>
                <div className="text-sm text-gray-600 font-merriweather">{formatDate(user.updated_at)}</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {user.bio && (
              <div>
                <div className="text-sm font-medium text-gray-700 font-cinzel mb-1">Bio</div>
                <div className="text-sm text-gray-600 font-merriweather">{user.bio}</div>
              </div>
            )}
            {user.last_walking_date && (
              <div className="flex items-center">
                <MapPin className="text-gray-400 mr-3" size={16} />
                <div>
                  <div className="text-sm font-medium text-gray-700 font-cinzel">Last Walk</div>
                  <div className="text-sm text-gray-600 font-merriweather">{user.last_walking_date}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Sections */}
      {isLoading ? (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Recent Quests */}
          <div>
            <div className="flex items-center mb-4">
              <Award className="text-green-600 mr-2" size={20} />
              <h3 className="text-lg font-cinzel font-bold text-gray-800">Recent Quests</h3>
              <span className="ml-2 text-sm text-gray-500 font-merriweather">
                ({userActivity.quests.length} total)
              </span>
            </div>
            {userActivity.quests.length > 0 ? (
              <div className="space-y-3">
                {userActivity.quests.slice(0, 5).map((quest: any) => (
                  <div key={quest.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800 font-cinzel">{quest.quest_name}</div>
                        <div className="text-sm text-gray-600 font-merriweather capitalize">{quest.quest_type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600 font-cinzel">
                          +{quest.xp_earned} XP, +{quest.coins_earned} coins
                        </div>
                        <div className="text-xs text-gray-500 font-merriweather">
                          {formatTimeAgo(quest.date_completed)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 font-merriweather text-sm">No quests completed yet</div>
            )}
          </div>

          {/* Recent Posts */}
          <div>
            <div className="flex items-center mb-4">
              <MessageSquare className="text-blue-600 mr-2" size={20} />
              <h3 className="text-lg font-cinzel font-bold text-gray-800">Recent Posts</h3>
              <span className="ml-2 text-sm text-gray-500 font-merriweather">
                ({userActivity.posts.length} total)
              </span>
            </div>
            {userActivity.posts.length > 0 ? (
              <div className="space-y-3">
                {userActivity.posts.slice(0, 3).map((post: any) => (
                  <div key={post.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-800 font-merriweather mb-2">
                      {post.content.substring(0, 150)}
                      {post.content.length > 150 && '...'}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-merriweather">{formatTimeAgo(post.timestamp)}</span>
                      <div className="flex items-center space-x-3">
                        <span>{post.likes_count} likes</span>
                        <span>{post.comments_count} comments</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 font-merriweather text-sm">No posts created yet</div>
            )}
          </div>

          {/* Recent Chronicles */}
          <div>
            <div className="flex items-center mb-4">
              <BookOpen className="text-purple-600 mr-2" size={20} />
              <h3 className="text-lg font-cinzel font-bold text-gray-800">Recent Chronicles</h3>
              <span className="ml-2 text-sm text-gray-500 font-merriweather">
                ({userActivity.chronicles.length} total)
              </span>
            </div>
            {userActivity.chronicles.length > 0 ? (
              <div className="space-y-3">
                {userActivity.chronicles.slice(0, 3).map((chronicle: any) => (
                  <div key={chronicle.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="font-medium text-gray-800 font-cinzel mb-1">{chronicle.title}</div>
                    <div className="text-sm text-gray-600 font-merriweather mb-2">
                      {chronicle.content.substring(0, 100)}
                      {chronicle.content.length > 100 && '...'}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-merriweather">{formatTimeAgo(chronicle.date_created)}</span>
                      <div className="flex items-center space-x-2">
                        {chronicle.mood && (
                          <span className="capitalize">{chronicle.mood}</span>
                        )}
                        <Badge color={chronicle.is_private ? 'error' : 'success'} size="sm">
                          {chronicle.is_private ? 'Private' : 'Public'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 font-merriweather text-sm">No chronicles created yet</div>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <EditUserModal
          user={user}
          onSave={handleEditUser}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Assign Quest Modal */}
      {showQuestModal && (
        <AssignQuestModal
          user={user}
          onAssign={handleAssignQuest}
          onClose={() => setShowQuestModal(false)}
        />
      )}
    </div>
  );
};

// Edit User Modal Component (same as in AdminUserTable)
const EditUserModal: React.FC<{
  user: any;
  onSave: (updates: any) => void;
  onClose: () => void;
}> = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    level: user.level || 1,
    xp: user.xp || 0,
    coins: user.coins || 0,
    bio: user.bio || '',
    is_active: user.is_active !== false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-cinzel font-bold text-gray-800 mb-4">
            Edit User: {user.username}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                  Level
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                  XP
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.xp}
                  onChange={(e) => setFormData(prev => ({ ...prev, xp: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                  Coins
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.coins}
                  onChange={(e) => setFormData(prev => ({ ...prev, coins: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 font-cinzel">
                Active Account
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Assign Quest Modal Component (same as in AdminUserTable)
const AssignQuestModal: React.FC<{
  user: any;
  onAssign: (questData: any) => void;
  onClose: () => void;
}> = ({ user, onAssign, onClose }) => {
  const [questData, setQuestData] = useState({
    questName: '',
    questType: 'special',
    xpReward: 100,
    coinsReward: 50,
    description: ''
  });

  const questTypes = [
    { value: 'special', label: 'Special Quest' },
    { value: 'bonus', label: 'Bonus Challenge' },
    { value: 'achievement', label: 'Achievement Unlock' },
    { value: 'milestone', label: 'Milestone Reward' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questData.questName.trim()) return;
    onAssign(questData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-cinzel font-bold text-gray-800 mb-4">
            Assign Special Quest to {user.username}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                Quest Name
              </label>
              <input
                type="text"
                value={questData.questName}
                onChange={(e) => setQuestData(prev => ({ ...prev, questName: e.target.value }))}
                placeholder="Enter quest name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                Quest Type
              </label>
              <select
                value={questData.questType}
                onChange={(e) => setQuestData(prev => ({ ...prev, questType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
              >
                {questTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                  XP Reward
                </label>
                <input
                  type="number"
                  min="0"
                  value={questData.xpReward}
                  onChange={(e) => setQuestData(prev => ({ ...prev, xpReward: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                  Coin Reward
                </label>
                <input
                  type="number"
                  min="0"
                  value={questData.coinsReward}
                  onChange={(e) => setQuestData(prev => ({ ...prev, coinsReward: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-cinzel mb-1">
                Description (Optional)
              </label>
              <textarea
                value={questData.description}
                onChange={(e) => setQuestData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Quest description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 font-merriweather"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Assign Quest
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;