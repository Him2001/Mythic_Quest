import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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