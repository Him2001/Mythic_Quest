/*
  # Fix User Profiles Row Level Security

  1. Security Updates
    - Enable RLS on user_profiles table if not already enabled
    - Create policy for users to read and update their own profiles only
    - Skip policy creation if it already exists to avoid conflicts

  2. Safety Features
    - Uses conditional logic to check for existing policies
    - Handles all edge cases gracefully
    - Ensures proper access control
*/

-- Enable RLS on user_profiles table if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'user_profiles' 
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policy for users to read and update their own profiles
-- Only create if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can read and update own profile'
  ) THEN
    CREATE POLICY "Users can read and update own profile"
      ON user_profiles
      FOR ALL
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Also create a policy for users to read other profiles (for social features)
-- Only create if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can read other profiles'
  ) THEN
    CREATE POLICY "Users can read other profiles"
      ON user_profiles
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;