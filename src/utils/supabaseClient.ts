import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if environment variables are present
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('Supabase environment variables not found. Running in demo mode.');
}

// Export a safe client that handles missing configuration
export { supabase };

// Database types
export interface UserProfile {
  id: string;
  username: string;
  xp: number;
  coins: number;
  level: number;
  avatar_url?: string;
  bio?: string;
  quests_completed: number;
  daily_walking_distance: number;
  total_walking_distance: number;
  last_walking_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}