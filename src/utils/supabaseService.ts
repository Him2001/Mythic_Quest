import { supabase } from './supabaseClient';
import { User, SocialPost, DirectMessage, Conversation, Chronicle, Quest } from '../types';

export class SupabaseService {
  // Check if Supabase is available
  private static isAvailable(): boolean {
    return supabase !== null;
  }

  // User Profile Management
  static async getUserProfile(userId: string) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  static async createProfile(userId: string, username: string, email?: string) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const profileData = {
        id: userId,
        username: username,
        email: email || '',
        xp: 0,
        coins: 0,
        level: 1,
        total_quests_completed: 0,
        daily_walking_distance: 0,
        total_walking_distance: 0,
        is_active: true,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        date_created: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: any) {
    if (!this.isAvailable()) {
      return true; // Success in demo mode
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return false;
    }
  }

  static async updateUserProgress(userId: string, xp: number, level: number, coins: number) {
    return this.updateUserProfile(userId, { xp, level, coins });
  }

  // Quest Completion Tracking
  static async recordQuestCompletion(
    userId: string,
    questName: string,
    questType: string,
    xpEarned: number,
    coinsEarned: number
  ) {
    if (!this.isAvailable()) {
      return true; // Success in demo mode
    }

    try {
      const { error } = await supabase
        .from('quests_completed')
        .insert({
          user_id: userId,
          quest_name: questName,
          quest_type: questType,
          xp_earned: xpEarned,
          coins_earned: coinsEarned
        });

      if (error) {
        console.error('Error recording quest completion:', error);
        return false;
      }

      // Update user's total quest count
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('total_quests_completed')
        .eq('id', userId)
        .single();

      if (profile) {
        await this.updateUserProfile(userId, {
          total_quests_completed: (profile.total_quests_completed || 0) + 1
        });
      }

      return true;
    } catch (error) {
      console.error('Error in recordQuestCompletion:', error);
      return false;
    }
  }

  static async getUserQuestHistory(userId: string) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('quests_completed')
        .select('*')
        .eq('user_id', userId)
        .order('date_completed', { ascending: false });

      if (error) {
        console.error('Error fetching quest history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserQuestHistory:', error);
      return [];
    }
  }

  // Social Posts Management
  static async createPost(
    userId: string,
    content: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    questTag?: any,
    achievementTag?: any
  ) {
    if (!this.isAvailable()) {
      return { id: crypto.randomUUID(), user_id: userId, content }; // Mock success in demo mode
    }

    try {
      const postData: any = {
        user_id: userId,
        content,
        media_url: mediaUrl,
        media_type: mediaType
      };

      if (questTag) {
        postData.quest_tag_id = questTag.questId;
        postData.quest_tag_title = questTag.questTitle;
        postData.quest_tag_type = questTag.questType;
      }

      if (achievementTag) {
        postData.achievement_tag_id = achievementTag.achievementId;
        postData.achievement_tag_title = achievementTag.achievementTitle;
        postData.achievement_tag_type = achievementTag.achievementType;
      }

      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createPost:', error);
      return null;
    }
  }

  static async getFeedPosts(userId: string) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      // Get posts from user and their friends
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles!posts_user_id_fkey (
            username,
            avatar_url,
            level
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching feed posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFeedPosts:', error);
      return [];
    }
  }

  static async likePost(postId: string, userId: string) {
    if (!this.isAvailable()) {
      return true; // Success in demo mode
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        return !error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId });

        return !error;
      }
    } catch (error) {
      console.error('Error in likePost:', error);
      return false;
    }
  }

  static async addComment(postId: string, userId: string, content: string) {
    if (!this.isAvailable()) {
      return { id: crypto.randomUUID(), content, user_id: userId }; // Mock success in demo mode
    }

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content
        })
        .select(`
          *,
          user_profiles!post_comments_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addComment:', error);
      return null;
    }
  }

  // Messaging System
  static async createConversation(user1Id: string, user2Id: string) {
    if (!this.isAvailable()) {
      return { id: crypto.randomUUID(), user1_id: user1Id, user2_id: user2Id }; // Mock success in demo mode
    }

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
        .single();

      if (existing) {
        return existing;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createConversation:', error);
      return null;
    }
  }

  static async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    messageText: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video'
  ) {
    if (!this.isAvailable()) {
      return { id: crypto.randomUUID(), message_text: messageText }; // Mock success in demo mode
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          message_text: messageText,
          media_url: mediaUrl,
          media_type: mediaType
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return null;
    }
  }

  static async getConversations(userId: string) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:user_profiles!conversations_user1_id_fkey (
            id,
            username,
            avatar_url
          ),
          user2:user_profiles!conversations_user2_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConversations:', error);
      return [];
    }
  }

  static async getMessages(conversationId: string) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_profiles!messages_sender_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  }

  static async markMessagesAsRead(conversationId: string, userId: string) {
    if (!this.isAvailable()) {
      return true; // Success in demo mode
    }

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
      return false;
    }
  }

  // Chronicles Management
  static async createChronicle(
    userId: string,
    title: string,
    content: string,
    mood?: string,
    weekNumber?: number,
    xpGained?: number,
    coinsEarned?: number,
    imageUrl?: string,
    isPrivate: boolean = false
  ) {
    if (!this.isAvailable()) {
      return { id: crypto.randomUUID(), title, content }; // Mock success in demo mode
    }

    try {
      const { data, error } = await supabase
        .from('chronicles')
        .insert({
          user_id: userId,
          title,
          content,
          mood,
          week_number: weekNumber,
          xp_gained: xpGained,
          coins_earned: coinsEarned,
          image_url: imageUrl,
          is_private: isPrivate
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chronicle:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createChronicle:', error);
      return null;
    }
  }

  static async getUserChronicles(userId: string) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('chronicles')
        .select('*')
        .eq('user_id', userId)
        .order('date_created', { ascending: false });

      if (error) {
        console.error('Error fetching user chronicles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserChronicles:', error);
      return [];
    }
  }

  static async getFriendsChronicles(userId: string) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      // Get public chronicles from friends
      const { data, error } = await supabase
        .from('chronicles')
        .select(`
          *,
          user_profiles!chronicles_user_id_fkey (
            username,
            avatar_url,
            level
          )
        `)
        .eq('is_private', false)
        .neq('user_id', userId)
        .order('date_created', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching friends chronicles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFriendsChronicles:', error);
      return [];
    }
  }

  static async updateChroniclePrivacy(chronicleId: string, isPrivate: boolean) {
    if (!this.isAvailable()) {
      return true; // Success in demo mode
    }

    try {
      const { error } = await supabase
        .from('chronicles')
        .update({ is_private: isPrivate })
        .eq('id', chronicleId);

      if (error) {
        console.error('Error updating chronicle privacy:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateChroniclePrivacy:', error);
      return false;
    }
  }

  static async deleteChronicle(chronicleId: string) {
    if (!this.isAvailable()) {
      return true; // Success in demo mode
    }

    try {
      const { error } = await supabase
        .from('chronicles')
        .delete()
        .eq('id', chronicleId);

      if (error) {
        console.error('Error deleting chronicle:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteChronicle:', error);
      return false;
    }
  }

  // Friend System
  static async sendFriendRequest(senderId: string, receiverId: string) {
    if (!this.isAvailable()) {
      return { id: crypto.randomUUID(), sender_id: senderId, receiver_id: receiverId }; // Mock success in demo mode
    }

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending friend request:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in sendFriendRequest:', error);
      return null;
    }
  }

  static async acceptFriendRequest(requestId: string) {
    if (!this.isAvailable()) {
      return true; // Success in demo mode
    }

    try {
      // Get the friend request
      const { data: request, error: requestError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        console.error('Error fetching friend request:', requestError);
        return false;
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating friend request:', updateError);
        return false;
      }

      // Create friendship
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert({
          user1_id: request.sender_id,
          user2_id: request.receiver_id
        });

      if (friendshipError) {
        console.error('Error creating friendship:', friendshipError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in acceptFriendRequest:', error);
      return false;
    }
  }

  static async getFriendRequests(userId: string) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:user_profiles!friend_requests_sender_id_fkey (
            id,
            username,
            avatar_url
          ),
          receiver:user_profiles!friend_requests_receiver_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching friend requests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFriendRequests:', error);
      return [];
    }
  }

  static async getFriends(userId: string) {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          user1:user_profiles!friendships_user1_id_fkey (
            id,
            username,
            avatar_url,
            level
          ),
          user2:user_profiles!friendships_user2_id_fkey (
            id,
            username,
            avatar_url,
            level
          )
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (error) {
        console.error('Error fetching friends:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFriends:', error);
      return [];
    }
  }

  // Real-time subscriptions with error handling
  static subscribeToUserUpdates(userId: string, callback: (payload: any) => void) {
    if (!this.isAvailable()) {
      return { unsubscribe: () => {} }; // Mock subscription in demo mode
    }

    try {
      return supabase
        .channel(`user_${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${userId}`
        }, callback)
        .subscribe();
    } catch (error) {
      console.warn('Failed to subscribe to user updates:', error);
      return { unsubscribe: () => {} };
    }
  }

  static subscribeToConversation(conversationId: string, callback: (payload: any) => void) {
    if (!this.isAvailable()) {
      return { unsubscribe: () => {} }; // Mock subscription in demo mode
    }

    try {
      return supabase
        .channel(`conversation_${conversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, callback)
        .subscribe();
    } catch (error) {
      console.warn('Failed to subscribe to conversation:', error);
      return { unsubscribe: () => {} };
    }
  }

  static subscribeToFeedUpdates(callback: (payload: any) => void) {
    if (!this.isAvailable()) {
      return { unsubscribe: () => {} }; // Mock subscription in demo mode
    }

    try {
      return supabase
        .channel('feed_updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, callback)
        .subscribe();
    } catch (error) {
      console.warn('Failed to subscribe to feed updates:', error);
      return { unsubscribe: () => {} };
    }
  }

  // Analytics and Stats
  static async getUserStats(userId: string) {
    if (!this.isAvailable()) {
      return { profile: null, totalQuests: 0, totalPosts: 0 };
    }

    try {
      const [profile, questsCount, postsCount] = await Promise.all([
        this.getUserProfile(userId),
        supabase.from('quests_completed').select('*', { count: 'exact' }).eq('user_id', userId),
        supabase.from('posts').select('*', { count: 'exact' }).eq('user_id', userId)
      ]);

      return {
        profile,
        totalQuests: questsCount.count || 0,
        totalPosts: postsCount.count || 0
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return {
        profile: null,
        totalQuests: 0,
        totalPosts: 0
      };
    }
  }
}