import React, { useState, useEffect } from 'react';
import { SocialPost, User } from '../../types';
import { SupabaseService } from '../../utils/supabaseService';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import { Plus, Users, TrendingUp, UserPlus } from 'lucide-react';
import Button from '../ui/Button';

interface SocialFeedProps {
  currentUser: User;
  onUserUpdate: (updatedUser: User) => void;
  showCreatePostModal?: boolean;
  prefilledPost?: {
    caption: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    achievementTag?: {
      achievementId: string;
      achievementTitle: string;
      achievementType: string;
    };
  } | null;
  onCreatePostModalClose?: () => void;
  onCreatePost?: (
    caption: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    questTag?: { questId: string; questTitle: string; questType: string },
    achievementTag?: { achievementId: string; achievementTitle: string; achievementType: string }
  ) => void;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ 
  currentUser, 
  onUserUpdate,
  showCreatePostModal = false,
  prefilledPost = null,
  onCreatePostModalClose,
  onCreatePost
}) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [internalShowCreateModal, setInternalShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [friendsCount, setFriendsCount] = useState(0);

  // Use external modal state if provided, otherwise use internal state
  const modalVisible = showCreatePostModal || internalShowCreateModal;

  useEffect(() => {
    loadPosts();
    loadFriendsCount();
  }, [currentUser.id]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const feedPosts = await SupabaseService.getFeedPosts(currentUser.id);
      setPosts(feedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendsCount = async () => {
    try {
      const friends = await SupabaseService.getFriends(currentUser.id);
      setFriendsCount(friends.length);
    } catch (error) {
      console.error('Failed to load friends count:', error);
    }
  };

  const handleCreatePost = async (
    caption: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    questTag?: { questId: string; questTitle: string; questType: string },
    achievementTag?: { achievementId: string; achievementTitle: string; achievementType: string }
  ) => {
    try {
      const newPost = await SupabaseService.createPost(
        currentUser.id,
        caption,
        mediaUrl,
        mediaType,
        questTag,
        achievementTag
      );

      if (newPost) {
        // Refresh feed
        loadPosts();
      }
      
      // Close modal
      if (onCreatePostModalClose) {
        onCreatePostModalClose();
      } else {
        setInternalShowCreateModal(false);
      }

      // Call external handler if provided
      if (onCreatePost) {
        onCreatePost(caption, mediaUrl, mediaType, questTag, achievementTag);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleCloseModal = () => {
    if (onCreatePostModalClose) {
      onCreatePostModalClose();
    } else {
      setInternalShowCreateModal(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const success = await SupabaseService.likePost(postId, currentUser.id);
      if (success) {
        // Refresh posts to show updated likes
        loadPosts();
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      const comment = await SupabaseService.addComment(postId, currentUser.id, content);
      
      if (comment) {
        // Refresh posts to show new comment
        loadPosts();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error; // Re-throw to show error in UI
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="animate-spin mx-auto mb-3 text-amber-600" size={32} />
          <p className="text-amber-800 font-cinzel">Loading social feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Feed Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="text-amber-600 mr-3 magical-glow" size={28} />
            <div>
              <h1 className="text-2xl font-cinzel font-bold text-amber-800 magical-glow">
                Social Feed
              </h1>
              <p className="text-amber-700 font-merriweather">
                Share your wellness journey with friends
              </p>
            </div>
          </div>
          
          {!showCreatePostModal && (
            <Button
              variant="primary"
              onClick={() => setInternalShowCreateModal(true)}
              icon={<Plus size={20} />}
              className="magical-glow"
            >
              Create Post
            </Button>
          )}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-cinzel font-bold text-gray-600 mb-2">
              No Posts Yet
            </h3>
            <p className="text-gray-500 font-merriweather mb-4">
              {friendsCount === 0 
                ? "Add friends to see their posts in your feed!" 
                : "Be the first to share your wellness journey!"
              }
            </p>
            {!showCreatePostModal && (
              <Button
                variant="primary"
                onClick={() => setInternalShowCreateModal(true)}
                icon={<Plus size={16} />}
              >
                Create Your First Post
              </Button>
            )}
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden fantasy-card">
              {/* Post content would be rendered here */}
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <img 
                    src={post.user_profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_profiles?.username}`}
                    alt={post.user_profiles?.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h4 className="font-cinzel font-bold text-gray-800">{post.user_profiles?.username}</h4>
                    <p className="text-sm text-gray-500 font-merriweather">Level {post.user_profiles?.level}</p>
                  </div>
                </div>
                
                <p className="text-gray-800 font-merriweather mb-4">{post.content}</p>
                
                {post.media_url && (
                  <div className="mb-4">
                    {post.media_type === 'video' ? (
                      <video src={post.media_url} controls className="w-full rounded-lg" />
                    ) : (
                      <img src={post.media_url} alt="Post media" className="w-full rounded-lg" />
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{post.likes_count} likes</span>
                  <span>{post.comments_count} comments</span>
                  <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {modalVisible && (
        <CreatePostModal
          currentUser={currentUser}
          onCreatePost={handleCreatePost}
          onClose={handleCloseModal}
          prefilledPost={prefilledPost}
        />
      )}
    </div>
  );
};

export default SocialFeed;