import { supabase, UserProfile } from './supabaseClient';
import { SupabaseService } from './supabaseService';
import { User } from '../types';

export class SupabaseAuthService {
  // Check if Supabase is available
  private static isAvailable(): boolean {
    return supabase !== null;
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, username: string): Promise<{ user: User | null; error: string | null }> {
    if (!this.isAvailable()) {
      return { user: null, error: 'Supabase is not configured' };
    }

    try {
      // First, check if username is already taken
      const { data: existingUser, error: usernameError } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      // If we get data back, username is taken
      if (existingUser) {
        return { user: null, error: 'Username is already taken. Please choose a different one.' };
      }

      // If error is not PGRST116 (no rows returned), then it's a real error
      if (usernameError && usernameError.code !== 'PGRST116') {
        console.error('Username check error:', usernameError);
        return { user: null, error: 'Failed to check username availability. Please try again.' };
      }

      // If error is PGRST116 or no error with no data, username is available
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
        
        // Try to fetch the created profile with retries
        let profile = null;
        let retries = 3;
        
        while (retries > 0 && !profile) {
          profile = await SupabaseService.getUserProfile(data.user.id);
          if (!profile) {
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
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
    if (!this.isAvailable()) {
      return { user: null, error: 'Supabase is not configured' };
    }

    try {
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
    if (!this.isAvailable()) {
      return { error: null }; // No error in demo mode
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Get current session with timeout
  static async getCurrentSession(): Promise<{ user: User | null; error: string | null }> {
    if (!this.isAvailable()) {
      return { user: null, error: null };
    }

    try {
      // Add timeout to prevent hanging
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 8000)
      );

      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;

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
      console.warn('Session check failed:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Session check failed' };
    }
  }

  // Update user progress (XP, level, coins)
  static async updateUserProgress(userId: string, xp: number, level: number, coins: number): Promise<{ success: boolean; error: string | null }> {
    if (!this.isAvailable()) {
      return { success: true, error: null }; // Success in demo mode
    }

    try {
      const success = await SupabaseService.updateUserProgress(userId, xp, level, coins);
      return { success, error: success ? null : 'Failed to update user progress' };
    } catch (error) {
      console.warn('Failed to update user progress:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
    }
  }

  // Update user coins
  static async updateUserCoins(userId: string, coins: number): Promise<{ success: boolean; error: string | null }> {
    if (!this.isAvailable()) {
      return { success: true, error: null }; // Success in demo mode
    }

    try {
      const success = await SupabaseService.updateUserProfile(userId, { coins });
      return { success, error: success ? null : 'Failed to update user coins' };
    } catch (error) {
      console.warn('Failed to update user coins:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
    }
  }

  // Update quests completed
  static async updateQuestsCompleted(userId: string, questsCompleted: number): Promise<{ success: boolean; error: string | null }> {
    if (!this.isAvailable()) {
      return { success: true, error: null }; // Success in demo mode
    }

    try {
      const success = await SupabaseService.updateUserProfile(userId, { total_quests_completed: questsCompleted });
      return { success, error: success ? null : 'Failed to update quests completed' };
    } catch (error) {
      console.warn('Failed to update quests completed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
    }
  }

  // Update walking distance
  static async updateWalkingDistance(userId: string, dailyDistance: number, totalDistance: number, lastWalkingDate: string): Promise<{ success: boolean; error: string | null }> {
    if (!this.isAvailable()) {
      return { success: true, error: null }; // Success in demo mode
    }

    try {
      const success = await SupabaseService.updateUserProfile(userId, {
        daily_walking_distance: dailyDistance,
        total_walking_distance: totalDistance,
        last_walking_date: lastWalkingDate
      });
      return { success, error: success ? null : 'Failed to update walking distance' };
    } catch (error) {
      console.warn('Failed to update walking distance:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
    }
  }

  // Record quest completion
  static async recordQuestCompletion(
    userId: string,
    questName: string,
    questType: string,
    xpEarned: number,
    coinsEarned: number
  ): Promise<{ success: boolean; error: string | null }> {
    if (!this.isAvailable()) {
      return { success: true, error: null }; // Success in demo mode
    }

    try {
      const success = await SupabaseService.recordQuestCompletion(userId, questName, questType, xpEarned, coinsEarned);
      return { success, error: success ? null : 'Failed to record quest completion' };
    } catch (error) {
      console.warn('Failed to record quest completion:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Record failed' };
    }
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
    if (!this.isAvailable()) {
      return { success: false, error: 'Supabase is not configured' };
    }

    try {
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

  // Listen to auth state changes with error handling
  static onAuthStateChange(callback: (user: User | null) => void) {
    if (!this.isAvailable()) {
      // Return a dummy subscription for demo mode
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }

    try {
      return supabase.auth.onAuthStateChange(async (event, session) => {
        try {
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
        } catch (error) {
          console.warn('Error in auth state change handler:', error);
          callback(null);
        }
      });
    } catch (error) {
      console.warn('Failed to set up auth state listener:', error);
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  }
}