import { supabase } from './supabaseClient';
import { AuthService } from './authService';
import { SupabaseAuthService } from './supabaseAuthService';
import { SupabaseService } from './supabaseService';
import { User } from '../types';

/**
 * Service to help sync accounts between localStorage and Supabase
 * This is useful for migrating existing accounts to Supabase
 */
export class AccountSyncService {
  /**
   * Check if an account exists in Supabase by attempting to sign in
   * Returns true if account exists and password is correct
   */
  static async checkAccountExistsInSupabase(email: string, password: string): Promise<{
    exists: boolean;
    hasCorrectPassword: boolean;
    error?: string;
  }> {
    if (!supabase) {
      return { exists: false, hasCorrectPassword: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (data && data.user) {
        // Sign out immediately after checking
        await supabase.auth.signOut();
        return { exists: true, hasCorrectPassword: true };
      }

      if (error) {
        // Check error type
        if (error.message.includes('Invalid login credentials')) {
          // Account might exist but password is wrong, or account doesn't exist
          return { exists: false, hasCorrectPassword: false, error: error.message };
        } else if (error.message.includes('Email not confirmed')) {
          return { exists: true, hasCorrectPassword: true, error: 'Email not confirmed' };
        } else {
          return { exists: false, hasCorrectPassword: false, error: error.message };
        }
      }

      return { exists: false, hasCorrectPassword: false };
    } catch (error) {
      console.error('Error checking account:', error);
      return { exists: false, hasCorrectPassword: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Migrate a localStorage account to Supabase
   * This creates a new account in Supabase with the same credentials
   */
  static async migrateAccountToSupabase(localStorageUser: User): Promise<{
    success: boolean;
    error?: string;
    newUser?: User;
  }> {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      // Check if account already exists in Supabase
      const checkResult = await this.checkAccountExistsInSupabase(
        localStorageUser.email,
        localStorageUser.password
      );

      if (checkResult.exists && checkResult.hasCorrectPassword) {
        return { success: true, error: 'Account already exists in Supabase' };
      }

      // Create new account in Supabase
      const { user, error } = await SupabaseAuthService.signUp(
        localStorageUser.email,
        localStorageUser.password,
        localStorageUser.name
      );

      if (error) {
        return { success: false, error };
      }

      if (user) {
        // Update the user profile with data from localStorage
        if (!user.isAdmin) {
          try {
            await SupabaseAuthService.updateUserProgress(
              user.id,
              localStorageUser.xp,
              localStorageUser.level,
              localStorageUser.mythicCoins
            );
            await SupabaseAuthService.updateQuestsCompleted(
              user.id,
              localStorageUser.questsCompleted
            );
            await SupabaseAuthService.updateWalkingDistance(
              user.id,
              localStorageUser.dailyWalkingDistance,
              localStorageUser.totalWalkingDistance,
              localStorageUser.lastWalkingDate
            );
          } catch (updateError) {
            console.warn('Failed to sync user data to Supabase:', updateError);
          }
        }

        return { success: true, newUser: user };
      }

      return { success: false, error: 'Failed to create account in Supabase' };
    } catch (error) {
      console.error('Error migrating account:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get all localStorage accounts that need to be synced
   */
  static getLocalStorageAccounts(): User[] {
    return AuthService.getAllUsers();
  }

  /**
   * Check which localStorage accounts are missing from Supabase
   */
  static async findUnsyncedAccounts(): Promise<{
    synced: User[];
    unsynced: User[];
    errors: Array<{ email: string; error: string }>;
  }> {
    const localStorageUsers = this.getLocalStorageAccounts();
    const synced: User[] = [];
    const unsynced: User[] = [];
    const errors: Array<{ email: string; error: string }> = [];

    for (const user of localStorageUsers) {
      if (!user.password) {
        unsynced.push(user);
        errors.push({ email: user.email, error: 'No password stored' });
        continue;
      }

      try {
        const checkResult = await this.checkAccountExistsInSupabase(user.email, user.password);
        if (checkResult.exists && checkResult.hasCorrectPassword) {
          synced.push(user);
        } else {
          unsynced.push(user);
          if (checkResult.error) {
            errors.push({ email: user.email, error: checkResult.error });
          }
        }
      } catch (error) {
        unsynced.push(user);
        errors.push({
          email: user.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { synced, unsynced, errors };
  }
}

