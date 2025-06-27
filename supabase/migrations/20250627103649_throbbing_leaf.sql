/*
  # Complete Mythic Quest Database Schema

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

  3. Performance
    - Proper indexing for all queries
    - Automatic triggers for data consistency
*/

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read and update own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can read other profiles" ON user_profiles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Enhanced user profiles table (extend existing if needed)
DO $$ 
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
    ALTER TABLE user_profiles ADD COLUMN email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'total_quests_completed') THEN
    ALTER TABLE user_profiles ADD COLUMN total_quests_completed integer DEFAULT 0 NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'daily_walking_distance') THEN
    ALTER TABLE user_profiles ADD COLUMN daily_walking_distance integer DEFAULT 0 NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'total_walking_distance') THEN
    ALTER TABLE user_profiles ADD COLUMN total_walking_distance integer DEFAULT 0 NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'last_walking_date') THEN
    ALTER TABLE user_profiles ADD COLUMN last_walking_date text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'date_created') THEN
    ALTER TABLE user_profiles ADD COLUMN date_created timestamptz DEFAULT now() NOT NULL;
  END IF;
END $$;

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

-- User Profiles Policies
CREATE POLICY "Users can read and update own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read other profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Quests Completed Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quests_completed' AND policyname = 'Users can manage own quests') THEN
    CREATE POLICY "Users can manage own quests"
      ON quests_completed
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Posts Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can manage own posts') THEN
    CREATE POLICY "Users can manage own posts"
      ON posts
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Users can read friends posts') THEN
    CREATE POLICY "Users can read friends posts"
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
  END IF;
END $$;

-- Post Likes Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Users can manage own likes') THEN
    CREATE POLICY "Users can manage own likes"
      ON post_likes
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Users can read all likes') THEN
    CREATE POLICY "Users can read all likes"
      ON post_likes
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Post Comments Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can manage own comments') THEN
    CREATE POLICY "Users can manage own comments"
      ON post_comments
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Users can read all comments') THEN
    CREATE POLICY "Users can read all comments"
      ON post_comments
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Conversations Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can access own conversations') THEN
    CREATE POLICY "Users can access own conversations"
      ON conversations
      FOR ALL
      TO authenticated
      USING (auth.uid() = user1_id OR auth.uid() = user2_id)
      WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
  END IF;
END $$;

-- Messages Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can access own messages') THEN
    CREATE POLICY "Users can access own messages"
      ON messages
      FOR ALL
      TO authenticated
      USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
      WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);
  END IF;
END $$;

-- Chronicles Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chronicles' AND policyname = 'Users can manage own chronicles') THEN
    CREATE POLICY "Users can manage own chronicles"
      ON chronicles
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chronicles' AND policyname = 'Users can read friends public chronicles') THEN
    CREATE POLICY "Users can read friends public chronicles"
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
  END IF;
END $$;

-- Friend Requests Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friend_requests' AND policyname = 'Users can manage own friend requests') THEN
    CREATE POLICY "Users can manage own friend requests"
      ON friend_requests
      FOR ALL
      TO authenticated
      USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
      WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);
  END IF;
END $$;

-- Friendships Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'friendships' AND policyname = 'Users can access own friendships') THEN
    CREATE POLICY "Users can access own friendships"
      ON friendships
      FOR ALL
      TO authenticated
      USING (auth.uid() = user1_id OR auth.uid() = user2_id)
      WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
  END IF;
END $$;

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