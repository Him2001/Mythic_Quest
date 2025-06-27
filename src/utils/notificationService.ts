import { Notification as AppNotification, NotificationState } from '../types';
import { AuthService } from './authService';

export class NotificationService {
  private static readonly STORAGE_KEY = 'mythic_notifications';
  private static listeners: Set<(state: NotificationState) => void> = new Set();

  static getStoredData(): Record<string, NotificationState> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load notification data:', error);
      return {};
    }
  }

  static saveStoredData(data: Record<string, NotificationState>) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save notification data:', error);
    }
  }

  static getUserNotificationState(userId: string): NotificationState {
    const data = this.getStoredData();
    return data[userId] || {
      notifications: [],
      unreadCount: 0,
      unreadMessages: 0,
      lastChecked: new Date()
    };
  }

  static saveUserNotificationState(userId: string, state: NotificationState) {
    const data = this.getStoredData();
    data[userId] = state;
    this.saveStoredData(data);
    this.notifyListeners(state);
  }

  static addNotification(
    userId: string,
    type: AppNotification['type'],
    title: string,
    message: string,
    data?: AppNotification['data']
  ): AppNotification {
    const notification: AppNotification = {
      id: crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
      data
    };

    const state = this.getUserNotificationState(userId);
    state.notifications.unshift(notification); // Add to beginning
    state.unreadCount += 1;

    // Update message count if it's a message notification
    if (type === 'message') {
      state.unreadMessages += 1;
    }

    // Keep only last 50 notifications
    if (state.notifications.length > 50) {
      state.notifications = state.notifications.slice(0, 50);
    }

    this.saveUserNotificationState(userId, state);
    this.showBrowserNotification(notification);

    return notification;
  }

  static markNotificationAsRead(userId: string, notificationId: string): boolean {
    const state = this.getUserNotificationState(userId);
    const notification = state.notifications.find(n => n.id === notificationId);

    if (!notification || notification.read) return false;

    notification.read = true;
    state.unreadCount = Math.max(0, state.unreadCount - 1);

    if (notification.type === 'message') {
      state.unreadMessages = Math.max(0, state.unreadMessages - 1);
    }

    this.saveUserNotificationState(userId, state);
    return true;
  }

  static markAllNotificationsAsRead(userId: string): void {
    const state = this.getUserNotificationState(userId);
    
    state.notifications.forEach(notification => {
      notification.read = true;
    });

    state.unreadCount = 0;
    state.unreadMessages = 0;
    state.lastChecked = new Date();

    this.saveUserNotificationState(userId, state);
  }

  static markMessagesAsRead(userId: string): void {
    const state = this.getUserNotificationState(userId);
    
    state.notifications
      .filter(n => n.type === 'message' && !n.read)
      .forEach(notification => {
        notification.read = true;
      });

    // Recalculate unread counts
    const unreadNotifications = state.notifications.filter(n => !n.read);
    state.unreadCount = unreadNotifications.length;
    state.unreadMessages = 0; // Reset message count

    this.saveUserNotificationState(userId, state);
  }

  static getUnreadMessageCount(userId: string): number {
    const state = this.getUserNotificationState(userId);
    return state.unreadMessages;
  }

  static getUnreadNotificationCount(userId: string): number {
    const state = this.getUserNotificationState(userId);
    return state.unreadCount;
  }

  static getNotifications(userId: string, limit: number = 20): AppNotification[] {
    const state = this.getUserNotificationState(userId);
    return state.notifications.slice(0, limit);
  }

  static deleteNotification(userId: string, notificationId: string): boolean {
    const state = this.getUserNotificationState(userId);
    const index = state.notifications.findIndex(n => n.id === notificationId);

    if (index === -1) return false;

    const notification = state.notifications[index];
    if (!notification.read) {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
      if (notification.type === 'message') {
        state.unreadMessages = Math.max(0, state.unreadMessages - 1);
      }
    }

    state.notifications.splice(index, 1);
    this.saveUserNotificationState(userId, state);
    return true;
  }

  static clearAllNotifications(userId: string): void {
    const state: NotificationState = {
      notifications: [],
      unreadCount: 0,
      unreadMessages: 0,
      lastChecked: new Date()
    };

    this.saveUserNotificationState(userId, state);
  }

  // Real-time notification helpers
  static createMessageNotification(
    receiverId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    conversationId: string,
    messagePreview: string
  ): void {
    this.addNotification(
      receiverId,
      'message',
      `New message from ${senderName}`,
      messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview,
      {
        conversationId,
        senderId,
        senderName,
        senderAvatar
      }
    );
  }

  static createCommentNotification(
    postOwnerId: string,
    commenterId: string,
    commenterName: string,
    commenterAvatar: string,
    postId: string,
    commentText: string
  ): void {
    if (postOwnerId === commenterId) return; // Don't notify for own comments

    this.addNotification(
      postOwnerId,
      'comment',
      `${commenterName} commented on your post`,
      commentText.length > 50 ? commentText.substring(0, 50) + '...' : commentText,
      {
        postId,
        senderId: commenterId,
        senderName: commenterName,
        senderAvatar: commenterAvatar
      }
    );
  }

  static createLikeNotification(
    postOwnerId: string,
    likerId: string,
    likerName: string,
    likerAvatar: string,
    postId: string
  ): void {
    if (postOwnerId === likerId) return; // Don't notify for own likes

    this.addNotification(
      postOwnerId,
      'like',
      `${likerName} liked your post`,
      'Someone appreciated your wellness journey!',
      {
        postId,
        senderId: likerId,
        senderName: likerName,
        senderAvatar: likerAvatar
      }
    );
  }

  static createFriendRequestNotification(
    receiverId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string
  ): void {
    this.addNotification(
      receiverId,
      'friend_request',
      `Friend request from ${senderName}`,
      `${senderName} wants to connect with you on your wellness journey`,
      {
        senderId,
        senderName,
        senderAvatar
      }
    );
  }

  static createFriendAcceptedNotification(
    userId: string,
    friendId: string,
    friendName: string,
    friendAvatar: string
  ): void {
    this.addNotification(
      userId,
      'friend_accepted',
      `${friendName} accepted your friend request`,
      `You are now connected! Start sharing your wellness journey together.`,
      {
        senderId: friendId,
        senderName: friendName,
        senderAvatar: friendAvatar
      }
    );
  }

  // Browser notification support
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static showBrowserNotification(notification: AppNotification): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: notification.data?.senderAvatar || '/vite.svg',
      badge: '/vite.svg',
      tag: notification.id,
      requireInteraction: false,
      silent: false
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 5000);

    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
      
      // Navigate to relevant section based on notification type
      if (notification.type === 'message' && notification.data?.conversationId) {
        // Could trigger navigation to messages
        console.log('Navigate to conversation:', notification.data.conversationId);
      }
    };
  }

  // Event listener system for real-time updates
  static subscribe(callback: (state: NotificationState) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  static notifyListeners(state: NotificationState): void {
    this.listeners.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
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

  static getNotificationIcon(type: AppNotification['type']): string {
    const iconMap = {
      message: '💬',
      comment: '💭',
      like: '❤️',
      friend_request: '👥',
      friend_accepted: '🤝'
    };
    return iconMap[type] || '🔔';
  }
}