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
      
      // Close modal - FIXED: Properly handle both external and internal modal states
      if (onCreatePostModalClose) {
        onCreatePostModalClose();
      }
      setInternalShowCreateModal(false);

      // Call external handler if provided
      if (onCreatePost) {
        onCreatePost(caption, mediaUrl, mediaType, questTag, achievementTag);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleCloseModal = () => {
    // FIXED: Properly close both external and internal modal states
    if (onCreatePostModalClose) {
      onCreatePostModalClose();
    }
    setInternalShowCreateModal(false);
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
          <Users className="animate-spin mx-auto mb-3 text-amber-600" size={28} sm:size={32} />
          <p className="text-amber-800 font-cinzel">Loading social feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Feed Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="flex items-center">
            <Users className="text-amber-600 mr-2 sm:mr-3 magical-glow" size={24} sm:size={28} />
            <div>
              <h1 className="text-lg sm:text-2xl font-cinzel font-bold text-amber-800 magical-glow">
                Social Feed
              </h1>
              <p className="text-amber-700 font-merriweather text-sm">
                Share your wellness journey with friends
              </p>
            </div>
          </div>
          
          {!showCreatePostModal && (
            <Button
              variant="primary"
              onClick={() => setInternalShowCreateModal(true)}
              icon={<Plus size={16} sm:size={20} />}
              className="magical-glow self-start sm:self-auto text-sm sm:text-base"
            >
              Create Post
            </Button>
          )}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4 sm:space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-md">
            <Users className="mx-auto mb-4 text-gray-400" size={36} sm:size={48} />
            <h3 className="text-lg sm:text-xl font-cinzel font-bold text-gray-600 mb-2">
              No Posts Yet
            </h3>
            <p className="text-gray-500 font-merriweather mb-4 text-sm">
              {friendsCount === 0 
                ? "Add friends to see their posts in your feed!" 
                : "Be the first to share your wellness journey!"
              }
            </p>
            {!showCreatePostModal && (
              <Button
                variant="primary"
                onClick={() => setInternalShowCreateModal(true)}
                icon={<Plus size={14} sm:size={16} />}
                className="text-sm sm:text-base"
              >
                Create Your First Post
              </Button>
            )}
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={{
                id: post.id,
                userId: post.user_id,
                userName: post.user_profiles?.username || 'Unknown User',
                userAvatar: post.user_profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_profiles?.username}`,
                userLevel: post.user_profiles?.level || 1,
                content: {
                  caption: post.content,
                  mediaUrl: post.media_url,
                  mediaType: post.media_type as 'image' | 'video' | undefined
                },
                questTag: post.quest_tag_id ? {
                  questId: post.quest_tag_id,
                  questTitle: post.quest_tag_title,
                  questType: post.quest_tag_type
                } : undefined,
                achievementTag: post.achievement_tag_id ? {
                  achievementId: post.achievement_tag_id,
                  achievementTitle: post.achievement_tag_title,
                  achievementType: post.achievement_tag_type
                } : undefined,
                likes: [], // Will be populated from post_likes table
                comments: [], // Will be populated from post_comments table
                createdAt: new Date(post.timestamp),
                updatedAt: new Date(post.updated_at)
              }}
              currentUser={currentUser}
              onLike={handleLike}
              onComment={handleComment}
            />
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