import { SocialPost, PostComment, DirectMessage, Conversation, Fellow, User, FriendRequest, Friendship } from '../types';
import { AuthService } from './authService';
import { NotificationService } from './notificationService';

export class SocialService {
  private static readonly STORAGE_KEY = 'mythic_social_data';

  static getStoredData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const parsedData = data ? JSON.parse(data) : {};
      
      // Ensure all required properties exist with proper defaults
      const defaultData = { 
        posts: [], 
        conversations: [], 
        messages: [],
        friendRequests: [],
        friendships: [],
        follows: {} // userId -> { following: [], followers: [] }
      };

      // Merge parsed data with defaults, ensuring all properties exist
      return {
        posts: Array.isArray(parsedData.posts) ? parsedData.posts : [],
        conversations: Array.isArray(parsedData.conversations) ? parsedData.conversations : [],
        messages: Array.isArray(parsedData.messages) ? parsedData.messages : [],
        friendRequests: Array.isArray(parsedData.friendRequests) ? parsedData.friendRequests : [],
        friendships: Array.isArray(parsedData.friendships) ? parsedData.friendships : [],
        follows: typeof parsedData.follows === 'object' && parsedData.follows !== null ? parsedData.follows : {}
      };
    } catch (error) {
      console.error('Failed to load social data:', error);
      return { 
        posts: [], 
        conversations: [], 
        messages: [], 
        friendRequests: [], 
        friendships: [], 
        follows: {} 
      };
    }
  }

  static saveStoredData(data: any) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save social data:', error);
    }
  }

  // Friend Request System
  static sendFriendRequest(senderId: string, receiverId: string): boolean {
    if (senderId === receiverId) return false;

    const data = this.getStoredData();
    
    // Check if request already exists
    const existingRequest = data.friendRequests.find((req: FriendRequest) =>
      (req.senderId === senderId && req.receiverId === receiverId) ||
      (req.senderId === receiverId && req.receiverId === senderId)
    );

    if (existingRequest) return false;

    // Check if already friends
    if (this.areFriends(senderId, receiverId)) return false;

    const friendRequest: FriendRequest = {
      id: crypto.randomUUID(),
      senderId,
      receiverId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    data.friendRequests.push(friendRequest);
    this.saveStoredData(data);

    // Create notification for receiver
    const sender = AuthService.getUserById(senderId);
    if (sender) {
      NotificationService.createFriendRequestNotification(
        receiverId,
        senderId,
        sender.name,
        sender.avatarUrl
      );
    }

    return true;
  }

  static acceptFriendRequest(requestId: string): boolean {
    const data = this.getStoredData();
    const request = data.friendRequests.find((req: FriendRequest) => req.id === requestId);
    
    if (!request || request.status !== 'pending') return false;

    // Update request status
    request.status = 'accepted';
    request.updatedAt = new Date();

    // Create friendship
    const friendship: Friendship = {
      id: crypto.randomUUID(),
      user1Id: request.senderId,
      user2Id: request.receiverId,
      createdAt: new Date()
    };

    data.friendships.push(friendship);
    this.saveStoredData(data);

    // Create notification for sender
    const receiver = AuthService.getUserById(request.receiverId);
    if (receiver) {
      NotificationService.createFriendAcceptedNotification(
        request.senderId,
        request.receiverId,
        receiver.name,
        receiver.avatarUrl
      );
    }

    return true;
  }

  static rejectFriendRequest(requestId: string): boolean {
    const data = this.getStoredData();
    const request = data.friendRequests.find((req: FriendRequest) => req.id === requestId);
    
    if (!request || request.status !== 'pending') return false;

    request.status = 'rejected';
    request.updatedAt = new Date();
    this.saveStoredData(data);
    return true;
  }

  static getFriendRequests(userId: string): { sent: FriendRequest[]; received: FriendRequest[] } {
    const data = this.getStoredData();
    
    const sent = data.friendRequests.filter((req: FriendRequest) => 
      req.senderId === userId && req.status === 'pending'
    );
    
    const received = data.friendRequests.filter((req: FriendRequest) => 
      req.receiverId === userId && req.status === 'pending'
    );

    return { sent, received };
  }

  static getFriends(userId: string): string[] {
    const data = this.getStoredData();
    const friendIds: string[] = [];

    // Ensure friendships is an array before calling forEach
    if (Array.isArray(data.friendships)) {
      data.friendships.forEach((friendship: Friendship) => {
        if (friendship.user1Id === userId) {
          friendIds.push(friendship.user2Id);
        } else if (friendship.user2Id === userId) {
          friendIds.push(friendship.user1Id);
        }
      });
    }

    return friendIds;
  }

  static areFriends(userId1: string, userId2: string): boolean {
    const data = this.getStoredData();
    
    // Ensure friendships is an array before calling some
    if (!Array.isArray(data.friendships)) {
      return false;
    }
    
    return data.friendships.some((friendship: Friendship) =>
      (friendship.user1Id === userId1 && friendship.user2Id === userId2) ||
      (friendship.user1Id === userId2 && friendship.user2Id === userId1)
    );
  }

  static removeFriend(userId1: string, userId2: string): boolean {
    const data = this.getStoredData();
    
    // Ensure friendships is an array before calling findIndex
    if (!Array.isArray(data.friendships)) {
      return false;
    }
    
    const friendshipIndex = data.friendships.findIndex((friendship: Friendship) =>
      (friendship.user1Id === userId1 && friendship.user2Id === userId2) ||
      (friendship.user1Id === userId2 && friendship.user2Id === userId1)
    );

    if (friendshipIndex === -1) return false;

    data.friendships.splice(friendshipIndex, 1);
    this.saveStoredData(data);
    return true;
  }

  static searchUsers(query: string, currentUserId: string): User[] {
    const allUsers = AuthService.getAllUsers();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) return [];

    return allUsers
      .filter(user => 
        user.id !== currentUserId &&
        user.isActive &&
        (user.name.toLowerCase().includes(searchTerm) || 
         user.email.toLowerCase().includes(searchTerm))
      )
      .slice(0, 10); // Limit to 10 results
  }

  static getFriendStatus(currentUserId: string, targetUserId: string): 'none' | 'pending_sent' | 'pending_received' | 'friends' {
    if (this.areFriends(currentUserId, targetUserId)) {
      return 'friends';
    }

    const data = this.getStoredData();
    const pendingRequest = data.friendRequests.find((req: FriendRequest) =>
      req.status === 'pending' &&
      ((req.senderId === currentUserId && req.receiverId === targetUserId) ||
       (req.senderId === targetUserId && req.receiverId === currentUserId))
    );

    if (pendingRequest) {
      return pendingRequest.senderId === currentUserId ? 'pending_sent' : 'pending_received';
    }

    return 'none';
  }

  // Post Management - Updated to show only friends' posts
  static createPost(
    userId: string,
    userName: string,
    userAvatar: string,
    userLevel: number,
    caption: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    questTag?: { questId: string; questTitle: string; questType: string },
    achievementTag?: { achievementId: string; achievementTitle: string; achievementType: string }
  ): SocialPost {
    const post: SocialPost = {
      id: crypto.randomUUID(),
      userId,
      userName,
      userAvatar,
      userLevel,
      content: {
        caption,
        mediaUrl,
        mediaType
      },
      questTag,
      achievementTag,
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const data = this.getStoredData();
    data.posts.unshift(post); // Add to beginning for newest first
    this.saveStoredData(data);

    return post;
  }

  static getFeedPosts(userId: string): SocialPost[] {
    const data = this.getStoredData();
    const friends = this.getFriends(userId);
    
    // Include user's own posts and friends' posts
    const allowedUserIds = [userId, ...friends];
    
    // Ensure posts is an array before filtering
    if (!Array.isArray(data.posts)) {
      return [];
    }
    
    return data.posts
      .filter((post: SocialPost) => allowedUserIds.includes(post.userId))
      .sort((a: SocialPost, b: SocialPost) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  static getAllPosts(): SocialPost[] {
    const data = this.getStoredData();
    
    // Ensure posts is an array before sorting
    if (!Array.isArray(data.posts)) {
      return [];
    }
    
    return data.posts.sort((a: SocialPost, b: SocialPost) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static getUserPosts(userId: string): SocialPost[] {
    const data = this.getStoredData();
    
    // Ensure posts is an array before filtering
    if (!Array.isArray(data.posts)) {
      return [];
    }
    
    return data.posts
      .filter((post: SocialPost) => post.userId === userId)
      .sort((a: SocialPost, b: SocialPost) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  static likePost(postId: string, userId: string): boolean {
    const data = this.getStoredData();
    const post = data.posts.find((p: SocialPost) => p.id === postId);
    
    if (!post) return false;

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
      
      // Create notification for post owner (only when liking, not unliking)
      const liker = AuthService.getUserById(userId);
      if (liker && post.userId !== userId) {
        NotificationService.createLikeNotification(
          post.userId,
          userId,
          liker.name,
          liker.avatarUrl,
          postId
        );
      }
    } else {
      post.likes.splice(likeIndex, 1);
    }

    post.updatedAt = new Date();
    this.saveStoredData(data);
    return true;
  }

  static addComment(
    postId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    content: string
  ): PostComment | null {
    const data = this.getStoredData();
    const post = data.posts.find((p: SocialPost) => p.id === postId);
    
    if (!post) return null;

    const comment: PostComment = {
      id: crypto.randomUUID(),
      userId,
      userName,
      userAvatar,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    post.updatedAt = new Date();
    this.saveStoredData(data);

    // Create notification for post owner
    if (post.userId !== userId) {
      NotificationService.createCommentNotification(
        post.userId,
        userId,
        userName,
        userAvatar,
        postId,
        content
      );
    }

    return comment;
  }

  // Follow System (kept for backward compatibility)
  static followUser(followerId: string, followeeId: string): boolean {
    if (followerId === followeeId) return false;

    const data = this.getStoredData();
    
    if (!data.follows[followerId]) {
      data.follows[followerId] = { following: [], followers: [] };
    }
    if (!data.follows[followeeId]) {
      data.follows[followeeId] = { following: [], followers: [] };
    }

    // Check if already following
    if (data.follows[followerId].following.includes(followeeId)) {
      return false;
    }

    data.follows[followerId].following.push(followeeId);
    data.follows[followeeId].followers.push(followerId);
    
    this.saveStoredData(data);
    return true;
  }

  static unfollowUser(followerId: string, followeeId: string): boolean {
    const data = this.getStoredData();
    
    if (!data.follows[followerId] || !data.follows[followeeId]) {
      return false;
    }

    const followingIndex = data.follows[followerId].following.indexOf(followeeId);
    const followerIndex = data.follows[followeeId].followers.indexOf(followerId);

    if (followingIndex === -1) return false;

    data.follows[followerId].following.splice(followingIndex, 1);
    if (followerIndex !== -1) {
      data.follows[followeeId].followers.splice(followerIndex, 1);
    }

    this.saveStoredData(data);
    return true;
  }

  static isFollowing(followerId: string, followeeId: string): boolean {
    const data = this.getStoredData();
    return data.follows[followerId]?.following.includes(followeeId) || false;
  }

  static getFollowing(userId: string): string[] {
    const data = this.getStoredData();
    return data.follows[userId]?.following || [];
  }

  static getFollowers(userId: string): string[] {
    const data = this.getStoredData();
    return data.follows[userId]?.followers || [];
  }

  // Messaging System - Updated to only allow messaging friends
  static createConversation(participant1: string, participant2: string): Conversation | null {
    // Check if users are friends
    if (!this.areFriends(participant1, participant2)) {
      return null;
    }

    const data = this.getStoredData();
    
    // Check if conversation already exists
    const existingConversation = data.conversations.find((conv: Conversation) =>
      conv.participants.includes(participant1) && conv.participants.includes(participant2)
    );

    if (existingConversation) {
      return existingConversation;
    }

    const conversation: Conversation = {
      id: crypto.randomUUID(),
      participants: [participant1, participant2],
      updatedAt: new Date(),
      unreadCount: {
        [participant1]: 0,
        [participant2]: 0
      }
    };

    data.conversations.push(conversation);
    this.saveStoredData(data);

    return conversation;
  }

  static sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video'
  ): DirectMessage | null {
    // Check if users are friends
    if (!this.areFriends(senderId, receiverId)) {
      return null;
    }

    const message: DirectMessage = {
      id: crypto.randomUUID(),
      conversationId,
      senderId,
      receiverId,
      content,
      mediaUrl,
      mediaType,
      createdAt: new Date(),
      read: false
    };

    const data = this.getStoredData();
    data.messages.push(message);

    // Update conversation
    const conversation = data.conversations.find((conv: Conversation) => conv.id === conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.updatedAt = new Date();
      conversation.unreadCount[receiverId] = (conversation.unreadCount[receiverId] || 0) + 1;
    }

    this.saveStoredData(data);

    // Create notification for receiver
    const sender = AuthService.getUserById(senderId);
    if (sender) {
      NotificationService.createMessageNotification(
        receiverId,
        senderId,
        sender.name,
        sender.avatarUrl,
        conversationId,
        content
      );
    }

    return message;
  }

  static getConversations(userId: string): Conversation[] {
    const data = this.getStoredData();
    return data.conversations
      .filter((conv: Conversation) => conv.participants.includes(userId))
      .sort((a: Conversation, b: Conversation) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }

  static getMessages(conversationId: string): DirectMessage[] {
    const data = this.getStoredData();
    return data.messages
      .filter((msg: DirectMessage) => msg.conversationId === conversationId)
      .sort((a: DirectMessage, b: DirectMessage) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }

  static markMessagesAsRead(conversationId: string, userId: string): void {
    const data = this.getStoredData();
    
    // Mark messages as read
    data.messages
      .filter((msg: DirectMessage) => 
        msg.conversationId === conversationId && 
        msg.receiverId === userId && 
        !msg.read
      )
      .forEach((msg: DirectMessage) => {
        msg.read = true;
      });

    // Reset unread count
    const conversation = data.conversations.find((conv: Conversation) => conv.id === conversationId);
    if (conversation) {
      conversation.unreadCount[userId] = 0;
    }

    this.saveStoredData(data);
  }

  // Utility functions
  static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return new Date(date).toLocaleDateString();
  }

  static getSocialStats(userId: string): {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    likesReceived: number;
    friendsCount: number;
  } {
    const data = this.getStoredData();
    const userPosts = Array.isArray(data.posts) ? data.posts.filter((post: SocialPost) => post.userId === userId) : [];
    const likesReceived = userPosts.reduce((total: number, post: SocialPost) => total + post.likes.length, 0);
    const friendsCount = this.getFriends(userId).length;

    return {
      postsCount: userPosts.length,
      followersCount: this.getFollowers(userId).length,
      followingCount: this.getFollowing(userId).length,
      likesReceived,
      friendsCount
    };
  }

  static updateUserOnlineStatus(userId: string, isOnline: boolean): void {
    // This would typically update the user's online status in the database
    // For now, we'll just update it in the auth service
    const user = AuthService.getUserById(userId);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeenAt = new Date();
      AuthService.updateUser(user);
    }
  }
}