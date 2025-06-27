import { supabase, UserProfile } from './supabaseClient';
import { User } from '../types';

export class SupabaseAuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, username: string): Promise<{ user: User | null; error: string | null }> {
    try {
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
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch the created profile
        const profile = await this.getUserProfile(data.user.id);
        if (profile) {
          const user = this.convertProfileToUser(profile, data.user.email!);
          return { user, error: null };
        }
      }

      return { user: null, error: 'Failed to create user profile' };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const profile = await this.getUserProfile(data.user.id);
        if (profile) {
          const user = this.convertProfileToUser(profile, data.user.email!);
          return { user, error: null };
        }
      }

      return { user: null, error: 'Failed to fetch user profile' };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Get current session
  static async getCurrentSession(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return { user: null, error: error.message };
      }

      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id);
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

  // Get user profile from database
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
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
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Update XP and level
  static async updateUserProgress(userId: string, xp: number, level: number, coins: number): Promise<{ success: boolean; error: string | null }> {
    return this.updateUserProfile(userId, { xp, level, coins });
  }

  // Update coins
  static async updateUserCoins(userId: string, coins: number): Promise<{ success: boolean; error: string | null }> {
    return this.updateUserProfile(userId, { coins });
  }

  // Update quests completed
  static async updateQuestsCompleted(userId: string, questsCompleted: number): Promise<{ success: boolean; error: string | null }> {
    return this.updateUserProfile(userId, { quests_completed: questsCompleted });
  }

  // Update walking distance
  static async updateWalkingDistance(userId: string, dailyDistance: number, totalDistance: number, lastWalkingDate: string): Promise<{ success: boolean; error: string | null }> {
    return this.updateUserProfile(userId, {
      daily_walking_distance: dailyDistance,
      total_walking_distance: totalDistance,
      last_walking_date: lastWalkingDate
    });
  }

  // Convert Supabase profile to app User type
  private static convertProfileToUser(profile: UserProfile, email: string): User {
    return {
      id: profile.id,
      name: profile.username,
      email: email,
      password: '', // Don't store password in client
      level: profile.level,
      xp: profile.xp,
      xpToNextLevel: this.calculateXPToNextLevel(profile.level),
      avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
      joinDate: new Date(profile.created_at),
      questsCompleted: profile.quests_completed,
      dailyWalkingDistance: profile.daily_walking_distance,
      totalWalkingDistance: profile.total_walking_distance,
      lastWalkingDate: profile.last_walking_date || '',
      mythicCoins: profile.coins,
      inventory: [],
      posts: [],
      following: [],
      followers: [],
      bio: profile.bio || '',
      authMethod: 'email',
      isAdmin: false,
      isActive: profile.is_active,
      lastLoginDate: new Date(),
      createdAt: new Date(profile.created_at),
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
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id);
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
  }
}