import React, { useState, useEffect } from 'react';
import { SocialPost, User } from '../../types';
import { SocialService } from '../../utils/socialService';
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
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [internalShowCreateModal, setInternalShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [friendsCount, setFriendsCount] = useState(0);

  // Use external modal state if provided, otherwise use internal state
  const modalVisible = showCreatePostModal || internalShowCreateModal;

  useEffect(() => {
    loadPosts();
    loadFriendsCount();
  }, [currentUser.id]);

  const loadPosts = () => {
    setIsLoading(true);
    try {
      // Get posts from friends and self only
      const feedPosts = SocialService.getFeedPosts(currentUser.id);
      setPosts(feedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendsCount = () => {
    const friends = SocialService.getFriends(currentUser.id);
    setFriendsCount(friends.length);
  };

  const handleCreatePost = (
    caption: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    questTag?: { questId: string; questTitle: string; questType: string },
    achievementTag?: { achievementId: string; achievementTitle: string; achievementType: string }
  ) => {
    try {
      const newPost = SocialService.createPost(
        currentUser.id,
        currentUser.name,
        currentUser.avatarUrl,
        currentUser.level,
        caption,
        mediaUrl,
        mediaType,
        questTag,
        achievementTag
      );

      // Update user's posts
      const updatedUser = {
        ...currentUser,
        posts: [newPost, ...currentUser.posts]
      };
      onUserUpdate(updatedUser);

      // Refresh feed
      loadPosts();
      
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
      const success = SocialService.likePost(postId, currentUser.id);
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
      const comment = SocialService.addComment(
        postId,
        currentUser.id,
        currentUser.name,
        currentUser.avatarUrl,
        content
      );
      
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
            <PostCard
              key={post.id}
              post={post}
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