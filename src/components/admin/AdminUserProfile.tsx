import React, { useState, useEffect } from 'react';
import { User, SocialPost } from '../../types';
import { AdminService } from '../../utils/adminService';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { X, User as UserIcon, Award, Coins, Calendar, Mail, Shield, Flag } from 'lucide-react';

interface AdminUserProfileProps {
  userId: string;
  onClose: () => void;
}

const AdminUserProfile: React.FC<AdminUserProfileProps> = ({ userId, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = AdminService.getUserProfile(userId);
      const posts = AdminService.getUserPosts(userId);
      
      setUser(userData);
      setUserPosts(posts);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = () => {
    if (!user) return;
    
    if (user.isActive) {
      AdminService.deactivateUser(user.id);
    } else {
      AdminService.activateUser(user.id);
    }
    
    setUser({ ...user, isActive: !user.isActive });
  };

  const handleFlagPost = (postId: string) => {
    AdminService.flagPost(postId);
    alert('Post has been flagged for review.');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 font-cinzel">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-red-600 font-cinzel">User not found.</p>
          <Button variant="primary" onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <h2 className="text-xl font-cinzel font-bold text-amber-800 flex items-center">
            <UserIcon className="mr-2" size={20} />
            User Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-start space-x-6">
            <Avatar
              src={user.avatarUrl}
              alt={user.name}
              size="xl"
              className="border-4 border-amber-300"
            />
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-cinzel font-bold text-gray-800">{user.name}</h3>
                  <p className="text-gray-600 font-merriweather">{user.email}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge color={user.isActive ? 'success' : 'error'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge color="accent">
                    {user.authMethod.charAt(0).toUpperCase() + user.authMethod.slice(1)}
                  </Badge>
                </div>
              </div>

              {user.bio && (
                <p className="text-gray-700 font-merriweather mb-4 italic">"{user.bio}"</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-cinzel font-bold text-amber-700">Level {user.level}</p>
                  <p className="text-sm text-gray-600 font-merriweather">Current Level</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-cinzel font-bold text-purple-700">{user.xp}</p>
                  <p className="text-sm text-gray-600 font-merriweather">Total XP</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-cinzel font-bold text-green-700">{user.questsCompleted}</p>
                  <p className="text-sm text-gray-600 font-merriweather">Quests Done</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-cinzel font-bold text-amber-700">{user.mythicCoins}</p>
                  <p className="text-sm text-gray-600 font-merriweather">Mythic Coins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-cinzel font-bold text-gray-800 mb-3 flex items-center">
              <Shield className="mr-2" size={16} />
              Account Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="mr-2 text-gray-500" size={16} />
                <span className="font-merriweather">
                  <strong>Joined:</strong> {formatDate(user.joinDate)}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 text-gray-500" size={16} />
                <span className="font-merriweather">
                  <strong>Last Login:</strong> {formatDate(user.lastLoginDate)}
                </span>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 text-gray-500" size={16} />
                <span className="font-merriweather">
                  <strong>Auth Method:</strong> {user.authMethod}
                </span>
              </div>
              <div className="flex items-center">
                <UserIcon className="mr-2 text-gray-500" size={16} />
                <span className="font-merriweather">
                  <strong>User ID:</strong> {user.id}
                </span>
              </div>
            </div>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-cinzel font-bold text-blue-700">{user.posts.length}</p>
              <p className="text-sm text-blue-600 font-merriweather">Posts Created</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-cinzel font-bold text-green-700">{user.followers.length}</p>
              <p className="text-sm text-green-600 font-merriweather">Followers</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-cinzel font-bold text-purple-700">{user.following.length}</p>
              <p className="text-sm text-purple-600 font-merriweather">Following</p>
            </div>
          </div>

          {/* Recent Posts */}
          {userPosts.length > 0 && (
            <div>
              <h4 className="font-cinzel font-bold text-gray-800 mb-3">Recent Posts</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {userPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="bg-gray-50 rounded-lg p-3 border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-merriweather text-sm text-gray-800 mb-2">
                          {post.content.caption}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{post.likes.length} likes</span>
                          <span>{post.comments.length} comments</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFlagPost(post.id)}
                        icon={<Flag size={12} />}
                      >
                        Flag
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Actions */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-cinzel font-bold text-gray-800 mb-3">Admin Actions</h4>
            <div className="flex space-x-3">
              <Button
                variant={user.isActive ? "outline" : "primary"}
                onClick={handleToggleUserStatus}
                icon={user.isActive ? <UserIcon size={16} /> : <UserIcon size={16} />}
              >
                {user.isActive ? 'Deactivate Account' : 'Activate Account'}
              </Button>
              
              <Button
                variant="ghost"
                onClick={onClose}
              >
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;