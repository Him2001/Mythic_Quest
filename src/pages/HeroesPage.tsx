import React, { useState, useEffect } from 'react';
import { User } from '../types';
import SocialFeed from '../components/social/SocialFeed';
import FriendsTab from '../components/social/FriendsTab';
import MessagingSystem from '../components/social/MessagingSystem';
import CreatePostModal from '../components/social/CreatePostModal';
import NotificationBadge from '../components/ui/NotificationBadge';
import { NotificationCountService } from '../utils/notificationCountService';
import { AchievementService } from '../utils/achievementService';
import { Users, MessageCircle, Heart } from 'lucide-react';

interface HeroesPageProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  pendingLevelUpShare?: {
    newLevel: number;
    xpEarned: number;
    coinsEarned: number;
  } | null;
  onLevelUpShareProcessed?: () => void;
}

const HeroesPage: React.FC<HeroesPageProps> = ({ 
  user, 
  onUserUpdate, 
  pendingLevelUpShare,
  onLevelUpShareProcessed 
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'friends'>('feed');
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [prefilledPost, setPrefilledPost] = useState<{
    caption: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    achievementTag?: {
      achievementId: string;
      achievementTitle: string;
      achievementType: string;
    };
  } | null>(null);

  // Get notification counts
  const unreadMessagesCount = NotificationCountService.getUnreadMessagesCount(user.id);
  const pendingFriendRequestsCount = NotificationCountService.getPendingFriendRequestsCount(user.id);

  // Handle pending level up share when component mounts or updates
  useEffect(() => {
    if (pendingLevelUpShare && onLevelUpShareProcessed) {
      // Create the level up post content
      const levelUpPost = AchievementService.createLevelUpPost(
        user,
        pendingLevelUpShare.newLevel,
        pendingLevelUpShare.xpEarned,
        pendingLevelUpShare.coinsEarned
      );

      // Set up the prefilled post data
      setPrefilledPost({
        caption: levelUpPost.content.caption,
        mediaUrl: levelUpPost.content.mediaUrl,
        mediaType: levelUpPost.content.mediaType,
        achievementTag: levelUpPost.achievementTag
      });

      // Show the create post modal
      setShowCreatePostModal(true);

      // Mark the level up share as processed
      onLevelUpShareProcessed();
    }
  }, [pendingLevelUpShare, onLevelUpShareProcessed, user]);

  const handleStartConversation = (userId: string) => {
    setSelectedUserId(userId);
    setShowMessaging(true);
  };

  const handleCloseMessaging = () => {
    setShowMessaging(false);
    setSelectedUserId(undefined);
  };

  const handleCreatePost = (
    caption: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    questTag?: { questId: string; questTitle: string; questType: string },
    achievementTag?: { achievementId: string; achievementTitle: string; achievementType: string }
  ) => {
    // This will be handled by the SocialFeed component
    setShowCreatePostModal(false);
    setPrefilledPost(null);
  };

  const handleCloseCreatePostModal = () => {
    setShowCreatePostModal(false);
    setPrefilledPost(null);
  };

  const handleTabClick = (tab: 'feed' | 'friends') => {
    // Reset notification counts when tabs are clicked
    if (tab === 'friends') {
      NotificationCountService.markFriendsChecked(user.id);
    }
    
    setActiveTab(tab);
  };

  const handleMessagesClick = () => {
    NotificationCountService.markMessagesChecked(user.id);
    setShowMessaging(true);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="flex items-center">
            <Users className="text-amber-600 mr-3 magical-glow" size={24} sm:size={28} />
            <div>
              <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-amber-800 magical-glow">
                Hero's Hall
              </h1>
              <p className="text-amber-700 font-merriweather text-sm sm:text-base">
                Connect, share, and inspire your wellness community
              </p>
            </div>
          </div>
          
          <button
            onClick={handleMessagesClick}
            className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 sm:px-4 py-2 rounded-lg font-cinzel font-bold shadow-lg hover:shadow-xl transition-all duration-300 magical-glow flex items-center text-sm sm:text-base"
          >
            <MessageCircle size={16} sm:size={20} className="mr-2" />
            Messages
            {unreadMessagesCount > 0 && (
              <NotificationBadge count={unreadMessagesCount} />
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 max-w-md">
          <button
            onClick={() => handleTabClick('feed')}
            className={`relative flex-1 py-2 px-3 sm:px-4 rounded-md font-cinzel font-bold transition-all duration-200 flex items-center justify-center text-sm sm:text-base ${
              activeTab === 'feed'
                ? 'bg-white text-amber-800 shadow-md'
                : 'text-gray-600 hover:text-amber-700'
            }`}
          >
            <Heart size={14} sm:size={16} className="mr-1 sm:mr-2" />
            Social Feed
          </button>
          <button
            onClick={() => handleTabClick('friends')}
            className={`relative flex-1 py-2 px-3 sm:px-4 rounded-md font-cinzel font-bold transition-all duration-200 flex items-center justify-center text-sm sm:text-base ${
              activeTab === 'friends'
                ? 'bg-white text-amber-800 shadow-md'
                : 'text-gray-600 hover:text-amber-700'
            }`}
          >
            <Users size={14} sm:size={16} className="mr-1 sm:mr-2" />
            Friends
            {pendingFriendRequestsCount > 0 && activeTab !== 'friends' && (
              <NotificationBadge count={pendingFriendRequestsCount} />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'feed' ? (
        <SocialFeed 
          currentUser={user} 
          onUserUpdate={onUserUpdate}
          showCreatePostModal={showCreatePostModal}
          prefilledPost={prefilledPost}
          onCreatePostModalClose={handleCloseCreatePostModal}
          onCreatePost={handleCreatePost}
        />
      ) : (
        <FriendsTab currentUser={user} onStartConversation={handleStartConversation} />
      )}

      {/* Messaging System */}
      {showMessaging && (
        <MessagingSystem
          currentUser={user}
          selectedUserId={selectedUserId}
          onClose={handleCloseMessaging}
        />
      )}
    </div>
  );
};

export default HeroesPage;