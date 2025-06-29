import { SocialService } from './socialService';

export class NotificationCountService {
  private static readonly STORAGE_KEY = 'mythic_notification_counts';

  static getStoredData(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load notification count data:', error);
      return {};
    }
  }

  static saveStoredData(data: Record<string, any>) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save notification count data:', error);
    }
  }

  static getUserCounts(userId: string): {
    lastHeroesVisit: Date;
    lastQuestsVisit: Date;
    lastMessagesCheck: Date;
    lastFriendsCheck: Date;
  } {
    const data = this.getStoredData();
    const userCounts = data[userId] || {};
    
    return {
      lastHeroesVisit: userCounts.lastHeroesVisit ? new Date(userCounts.lastHeroesVisit) : new Date(0),
      lastQuestsVisit: userCounts.lastQuestsVisit ? new Date(userCounts.lastQuestsVisit) : new Date(0),
      lastMessagesCheck: userCounts.lastMessagesCheck ? new Date(userCounts.lastMessagesCheck) : new Date(0),
      lastFriendsCheck: userCounts.lastFriendsCheck ? new Date(userCounts.lastFriendsCheck) : new Date(0)
    };
  }

  static updateUserCounts(userId: string, updates: Partial<{
    lastHeroesVisit: Date;
    lastQuestsVisit: Date;
    lastMessagesCheck: Date;
    lastFriendsCheck: Date;
  }>) {
    const data = this.getStoredData();
    if (!data[userId]) {
      data[userId] = {};
    }

    Object.keys(updates).forEach(key => {
      const value = updates[key as keyof typeof updates];
      if (value instanceof Date) {
        data[userId][key] = value.toISOString();
      } else {
        data[userId][key] = value;
      }
    });

    this.saveStoredData(data);
  }

  static markHeroesVisited(userId: string) {
    this.updateUserCounts(userId, { lastHeroesVisit: new Date() });
  }

  static markQuestsVisited(userId: string) {
    this.updateUserCounts(userId, { lastQuestsVisit: new Date() });
  }

  static markMessagesChecked(userId: string) {
    this.updateUserCounts(userId, { lastMessagesCheck: new Date() });
  }

  static markFriendsChecked(userId: string) {
    this.updateUserCounts(userId, { lastFriendsCheck: new Date() });
  }

  // Calculate real-time counts
  static getUnreadMessagesCount(userId: string): number {
    const conversations = SocialService.getConversations(userId);
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCount[userId] || 0);
    }, 0);
  }

  static getPendingFriendRequestsCount(userId: string): number {
    const { received } = SocialService.getFriendRequests(userId);
    return received.length;
  }

  static getActiveQuestsCount(quests: any[]): number {
    return quests.filter(quest => !quest.completed).length;
  }

  // Add the missing method that was causing the error
  static getUnreadNotificationCount(userId: string): number {
    // This method returns the total unread notification count
    // For now, we'll combine messages and friend requests
    const unreadMessages = this.getUnreadMessagesCount(userId);
    const pendingRequests = this.getPendingFriendRequestsCount(userId);
    return unreadMessages + pendingRequests;
  }
}