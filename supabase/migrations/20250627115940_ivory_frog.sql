/*
  # Complete Mythic Quest Database Schema - Fixed Policy Conflicts

  1. New Tables
    - Enhanced `user_profiles` with wellness tracking
    - `quests_completed` for quest completion tracking
    - `posts` for social feed with media support
    - `post_likes` and `post_comments` for social interactions
    - `conversations` and `messages` for chat system
    - `chronicles` for weekly story entries
    - `friend_requests` and `friendships` for social connections

  2. Security
    - Enable RLS on all tables
    - Comprehensive policies for data access control
    - Friend-based access for social features
    - Safe policy creation with conflict avoidance

  3. Performance
    - Proper indexing for all queries
    - Automatic triggers for data consistency
*/

-- Drop all existing policies to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on user_profiles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_profiles';
    END LOOP;
    
    -- Drop all policies on quests_completed
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'quests_completed') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON quests_completed';
    END LOOP;
    
    -- Drop all policies on posts
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'posts') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON posts';
    END LOOP;
    
    -- Drop all policies on post_likes
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'post_likes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON post_likes';
    END LOOP;
    
    -- Drop all policies on post_comments
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'post_comments') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON post_comments';
    END LOOP;
    
    -- Drop all policies on conversations
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversations') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON conversations';
    END LOOP;
    
    -- Drop all policies on messages
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'messages') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON messages';
    END LOOP;
    
    -- Drop all policies on chronicles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'chronicles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON chronicles';
    END LOOP;
    
    -- Drop all policies on friend_requests
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'friend_requests') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON friend_requests';
    END LOOP;
    
    -- Drop all policies on friendships
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'friendships') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON friendships';
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        -- Continue if any errors occur
        NULL;
END $$;

-- Enhanced user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  level integer DEFAULT 1 NOT NULL,
  xp integer DEFAULT 0 NOT NULL,
  coins integer DEFAULT 0 NOT NULL,
  total_quests_completed integer DEFAULT 0 NOT NULL,
  avatar_url text,
  bio text,
  daily_walking_distance integer DEFAULT 0 NOT NULL,
  total_walking_distance integer DEFAULT 0 NOT NULL,
  last_walking_date text,
  is_active boolean DEFAULT true NOT NULL,
  date_created timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Quests completed tracking
CREATE TABLE IF NOT EXISTS quests_completed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  quest_name text NOT NULL,
  quest_type text NOT NULL,
  xp_earned integer DEFAULT 0 NOT NULL,
  coins_earned integer DEFAULT 0 NOT NULL,
  date_completed timestamptz DEFAULT now() NOT NULL
);

-- Social posts
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  quest_tag_id text,
  quest_tag_title text,
  quest_tag_type text,
  achievement_tag_id text,
  achievement_tag_title text,
  achievement_tag_type text,
  likes_count integer DEFAULT 0 NOT NULL,
  comments_count integer DEFAULT 0 NOT NULL,
  timestamp timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Post comments
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  last_message text,
  last_updated timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  message_text text NOT NULL,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  is_read boolean DEFAULT false NOT NULL,
  timestamp timestamptz DEFAULT now() NOT NULL
);

-- Chronicles (weekly story entries)
CREATE TABLE IF NOT EXISTS chronicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  mood text,
  week_number integer,
  xp_gained integer DEFAULT 0,
  coins_earned integer DEFAULT 0,
  image_url text,
  is_private boolean DEFAULT false NOT NULL,
  date_created timestamptz DEFAULT now() NOT NULL
);

-- Friend requests
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Friendships
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests_completed ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Create all policies with unique names to avoid conflicts
CREATE POLICY "profile_own_access_v2"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profile_read_others_v2"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "quest_own_management_v2"
  ON quests_completed
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_own_management_v2"
  ON posts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_friend_read_access_v2"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE (f.user1_id = auth.uid() AND f.user2_id = user_id)
         OR (f.user2_id = auth.uid() AND f.user1_id = user_id)
    )
  );

CREATE POLICY "like_own_management_v2"
  ON post_likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "like_read_all_v2"
  ON post_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "comment_own_management_v2"
  ON post_comments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comment_read_all_v2"
  ON post_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "conversation_participant_access_v2"
  ON conversations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id)
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "message_participant_access_v2"
  ON messages
  FOR ALL
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "chronicle_own_management_v2"
  ON chronicles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chronicle_friend_read_public_v2"
  ON chronicles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    (NOT is_private AND EXISTS (
      SELECT 1 FROM friendships f
      WHERE (f.user1_id = auth.uid() AND f.user2_id = user_id)
         OR (f.user2_id = auth.uid() AND f.user1_id = user_id)
    ))
  );

CREATE POLICY "friend_request_participant_access_v2"
  ON friend_requests
  FOR ALL
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "friendship_participant_access_v2"
  ON friendships
  FOR ALL
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id)
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Functions and Triggers

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON friend_requests;
CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON friend_requests
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Function to update conversation last_updated
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger AS $$
BEGIN
  UPDATE conversations 
  SET last_updated = now(), last_message = NEW.message_text
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation on new message
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE PROCEDURE public.update_conversation_timestamp();

-- Function to update post counts
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for post counts
DROP TRIGGER IF EXISTS update_likes_count ON post_likes;
CREATE TRIGGER update_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_post_likes_count();

DROP TRIGGER IF EXISTS update_comments_count ON post_comments;
CREATE TRIGGER update_comments_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_post_comments_count();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quests_completed_user_id ON quests_completed(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_completed_date ON quests_completed(date_completed);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chronicles_user_id ON chronicles(user_id);
CREATE INDEX IF NOT EXISTS idx_chronicles_date ON chronicles(date_created);
CREATE INDEX IF NOT EXISTS idx_friendships_users ON friendships(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);