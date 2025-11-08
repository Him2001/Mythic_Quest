import React, { useState, useEffect } from 'react';
import { SocialPost, User } from '../../types';
import { SocialService } from '../../utils/socialService';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Heart, MessageCircle, Share2, Award, Scroll, MoreHorizontal, Send } from 'lucide-react';

interface PostCardProps {
  post: SocialPost;
  currentUser: User;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localLikes, setLocalLikes] = useState<string[]>(post.likes || []);
  const [localComments, setLocalComments] = useState(post.comments || []);

  const isLiked = localLikes.includes(currentUser.id);
  const timeAgo = SocialService.formatTimeAgo(post.createdAt);

  // Load actual likes and comments from Supabase
  useEffect(() => {
    // In a real implementation, you would fetch likes and comments here
    // For now, we'll use the post data as-is
  }, [post.id]);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      // Optimistically update UI
      if (isLiked) {
        setLocalLikes(prev => prev.filter(id => id !== currentUser.id));
      } else {
        setLocalLikes(prev => [...prev, currentUser.id]);
      }
      
      await onLike(post.id);
    } catch (error) {
      console.error('Failed to like post:', error);
      // Revert optimistic update on error
      if (isLiked) {
        setLocalLikes(prev => [...prev, currentUser.id]);
      } else {
        setLocalLikes(prev => prev.filter(id => id !== currentUser.id));
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      // Optimistically add comment to UI
      const newComment = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatarUrl,
        content: commentText.trim(),
        createdAt: new Date()
      };
      
      setLocalComments(prev => [...prev, newComment]);
      setCommentText('');
      
      await onComment(post.id, commentText.trim());
    } catch (error) {
      console.error('Failed to submit comment:', error);
      // Remove optimistic comment on error
      setLocalComments(prev => prev.filter(c => c.id !== newComment.id));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getQuestTypeColor = (type: string): 'primary' | 'secondary' | 'accent' | 'success' | 'warning' => {
    const colorMap: Record<string, any> = {
      walking: 'primary',
      exercise: 'secondary',
      meditation: 'success',
      journaling: 'accent',
      reading: 'warning'
    };
    return colorMap[type] || 'primary';
  };

  const getQuestTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      walking: '🚶‍♀️',
      exercise: '💪',
      meditation: '🧘‍♀️',
      journaling: '📝',
      reading: '📚',
      social: '👥'
    };
    return iconMap[type] || '⭐';
  };

  const isDataURL = (url: string): boolean => {
    return url.startsWith('data:');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden fantasy-card">
      {/* Post Header */}
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar
              src={post.userAvatar}
              alt={post.userName}
              size="md"
              className="mr-2 sm:mr-3"
            />
            <div>
              <div className="flex items-center">
                <h3 className="font-cinzel font-bold text-gray-800 text-sm sm:text-base">{post.userName}</h3>
                <Badge color="accent" size="sm" className="ml-2">
                  Level {post.userLevel}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 font-merriweather">{timeAgo}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" icon={<MoreHorizontal size={14} sm:size={16} />} />
        </div>
      </div>

      {/* Post Content */}
      <div className="p-3 sm:p-4">
        <p className="text-gray-800 font-merriweather mb-4 leading-relaxed text-sm sm:text-base">
          {post.content.caption}
        </p>

        {/* Quest/Achievement Tags */}
        {post.questTag && (
          <div className="mb-3 sm:mb-4">
            <Badge 
              color={getQuestTypeColor(post.questTag.questType)} 
              className="magical-glow"
            >
              <Scroll size={10} sm:size={12} className="mr-1" />
              <span className="mr-1">{getQuestTypeIcon(post.questTag.questType)}</span>
              {post.questTag.questTitle}
            </Badge>
          </div>
        )}

        {post.achievementTag && (
          <div className="mb-3 sm:mb-4">
            <Badge color="warning" className="magical-glow">
              <Award size={10} sm:size={12} className="mr-1" />
              <span className="mr-1">🏆</span>
              {post.achievementTag.achievementTitle}
            </Badge>
          </div>
        )}

        {/* Media Content */}
        {post.content.mediaUrl && (
          <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden">
            {post.content.mediaType === 'video' ? (
              <video
                src={post.content.mediaUrl}
                controls
                className="w-full max-h-72 sm:max-h-96 object-cover"
                poster={isDataURL(post.content.mediaUrl) ? undefined : post.content.mediaUrl}
              />
            ) : (
              <img
                src={post.content.mediaUrl}
                alt="Post content"
                className="w-full max-h-72 sm:max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => {
                  // Open image in new tab for full view
                  if (isDataURL(post.content.mediaUrl!)) {
                    const newWindow = window.open();
                    if (newWindow) {
                      newWindow.document.write(`<img src="${post.content.mediaUrl}" style="max-width: 100%; height: auto;" />`);
                    }
                  } else {
                    window.open(post.content.mediaUrl, '_blank');
                  }
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 sm:space-x-2 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-gray-50 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart size={16} sm:size={20} className={`${isLiked ? 'fill-current' : ''} ${isLiking ? 'animate-pulse' : ''}`} />
              <span className="font-merriweather text-xs sm:text-sm font-medium">{localLikes.length}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-blue-500 transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              <MessageCircle size={16} sm:size={20} />
              <span className="font-merriweather text-xs sm:text-sm font-medium">{localComments.length}</span>
            </button>
            
            <button className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-green-500 transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-gray-50">
              <Share2 size={16} sm:size={20} />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-100 pt-2 sm:pt-3">
            {/* Existing Comments */}
            {localComments.length > 0 && (
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                {localComments.map(comment => (
                  <div key={comment.id} className="flex items-start space-x-2 sm:space-x-3">
                    <Avatar
                      src={comment.userAvatar}
                      alt={comment.userName}
                      size="sm"
                    />
                    <div className="flex-1 bg-gray-50 rounded-lg p-2 sm:p-3">
                      <div className="flex items-center mb-1">
                        <span className="font-cinzel font-bold text-xs sm:text-sm text-gray-800">
                          {comment.userName}
                        </span>
                        <span className="text-xs text-gray-500 ml-2 font-merriweather">
                          {SocialService.formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 font-merriweather">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment */}
            <form onSubmit={handleSubmitComment} className="flex items-start space-x-2 sm:space-x-3">
              <Avatar
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                size="sm"
              />
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-amber-500 font-merriweather text-xs sm:text-sm"
                  disabled={isSubmittingComment}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!commentText.trim() || isSubmittingComment}
                  icon={<Send size={12} sm:size={14} />}
                  className="rounded-full px-2 sm:px-3 text-xs sm:text-sm"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;