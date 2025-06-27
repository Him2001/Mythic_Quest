import { supabase, UserProfile } from './supabaseClient';
import { SupabaseService } from './supabaseService';
import { User } from '../types';

export class SupabaseAuthService {
  // Check if Supabase is configured
  private static isConfigured(): boolean {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(supabaseUrl && supabaseKey);
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, username: string): Promise<{ user: User | null; error: string | null }> {
    try {
      if (!this.isConfigured()) {
        return { user: null, error: 'Supabase is not configured. Please check your environment variables.' };
      }

      // First, check if username is already taken
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        return { user: null, error: 'Username is already taken. Please choose a different one.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Wait for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to fetch the created profile
        let profile = await SupabaseService.getUserProfile(data.user.id);
        
        // If profile doesn't exist, create it manually
        if (!profile) {
          console.log('Profile not found, creating manually...');
          profile = await SupabaseService.createProfile(data.user.id, username, email);
        }
        
        if (profile) {
          const user = this.convertProfileToUser(profile, data.user.email!);
          return { user, error: null };
        } else {
          return { user: null, error: 'Failed to create user profile. Please try again.' };
        }
      }

      return { user: null, error: 'Account creation failed. Please try again.' };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      if (!this.isConfigured()) {
        return { user: null, error: 'Supabase is not configured. Please check your environment variables.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const profile = await SupabaseService.getUserProfile(data.user.id);
        if (profile) {
          const user = this.convertProfileToUser(profile, data.user.email!);
          return { user, error: null };
        } else {
          return { user: null, error: 'User profile not found. Please contact support.' };
        }
      }

      return { user: null, error: 'Sign in failed. Please try again.' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      if (!this.isConfigured()) {
        return { error: null }; // No error if not configured
      }

      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Get current session
  static async getCurrentSession(): Promise<{ user: User | null; error: string | null }> {
    try {
      if (!this.isConfigured()) {
        return { user: null, error: 'Supabase is not configured' };
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return { user: null, error: error.message };
      }

      if (session?.user) {
        const profile = await SupabaseService.getUserProfile(session.user.id);
        if (profile) {
          const user = this.convertProfileToUser(profile, session.user.email!);
          return { user, error: null };
        }
      }

      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Update user progress (XP, level, coins)
  static async updateUserProgress(userId: string, xp: number, level: number, coins: number): Promise<{ success: boolean; error: string | null }> {
    if (!this.isConfigured()) {
      return { success: true, error: null }; // Pretend success in demo mode
    }

    const success = await SupabaseService.updateUserProgress(userId, xp, level, coins);
    return { success, error: success ? null : 'Failed to update user progress' };
  }

  // Update user coins
  static async updateUserCoins(userId: string, coins: number): Promise<{ success: boolean; error: string | null }> {
    if (!this.isConfigured()) {
      return { success: true, error: null }; // Pretend success in demo mode
    }

    const success = await SupabaseService.updateUserProfile(userId, { coins });
    return { success, error: success ? null : 'Failed to update user coins' };
  }

  // Update quests completed
  static async updateQuestsCompleted(userId: string, questsCompleted: number): Promise<{ success: boolean; error: string | null }> {
    if (!this.isConfigured()) {
      return { success: true, error: null }; // Pretend success in demo mode
    }

    const success = await SupabaseService.updateUserProfile(userId, { total_quests_completed: questsCompleted });
    return { success, error: success ? null : 'Failed to update quests completed' };
  }

  // Update walking distance
  static async updateWalkingDistance(userId: string, dailyDistance: number, totalDistance: number, lastWalkingDate: string): Promise<{ success: boolean; error: string | null }> {
    if (!this.isConfigured()) {
      return { success: true, error: null }; // Pretend success in demo mode
    }

    const success = await SupabaseService.updateUserProfile(userId, {
      daily_walking_distance: dailyDistance,
      total_walking_distance: totalDistance,
      last_walking_date: lastWalkingDate
    });
    return { success, error: success ? null : 'Failed to update walking distance' };
  }

  // Record quest completion
  static async recordQuestCompletion(
    userId: string,
    questName: string,
    questType: string,
    xpEarned: number,
    coinsEarned: number
  ): Promise<{ success: boolean; error: string | null }> {
    if (!this.isConfigured()) {
      return { success: true, error: null }; // Pretend success in demo mode
    }

    const success = await SupabaseService.recordQuestCompletion(userId, questName, questType, xpEarned, coinsEarned);
    return { success, error: success ? null : 'Failed to record quest completion' };
  }

  // Convert Supabase profile to app User type
  private static convertProfileToUser(profile: any, email: string): User {
    return {
      id: profile.id,
      name: profile.username,
      email: email,
      password: '', // Don't store password in client
      level: profile.level || 1,
      xp: profile.xp || 0,
      xpToNextLevel: this.calculateXPToNextLevel(profile.level || 1),
      avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
      joinDate: new Date(profile.date_created || profile.created_at),
      questsCompleted: profile.total_quests_completed || 0,
      dailyWalkingDistance: profile.daily_walking_distance || 0,
      totalWalkingDistance: profile.total_walking_distance || 0,
      lastWalkingDate: profile.last_walking_date || '',
      mythicCoins: profile.coins || 0,
      inventory: [],
      posts: [],
      following: [],
      followers: [],
      bio: profile.bio || '',
      authMethod: 'email',
      isAdmin: false,
      isActive: profile.is_active !== false,
      lastLoginDate: new Date(),
      createdAt: new Date(profile.date_created || profile.created_at),
      isOnline: true,
      lastSeenAt: new Date(),
      chronicles: []
    };
  }

  // Calculate XP needed for next level
  private static calculateXPToNextLevel(currentLevel: number): number {
    return Math.floor(100 * Math.pow(1.5, currentLevel - 1));
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!this.isConfigured()) {
        return { success: false, error: 'Supabase is not configured' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    if (!this.isConfigured()) {
      // Return a mock subscription for demo mode
      return {
        unsubscribe: () => {}
      };
    }

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await SupabaseService.getUserProfile(session.user.id);
        if (profile) {
          const user = this.convertProfileToUser(profile, session.user.email!);
          callback(user);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });

    return data;
  }
}