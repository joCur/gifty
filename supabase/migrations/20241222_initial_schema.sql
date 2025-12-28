-- Gifty Database Schema
-- Initial migration with all tables and RLS policies

-- Note: Using gen_random_uuid() which is built into PostgreSQL 13+
-- No extension needed (uuid-ossp is in extensions schema on Supabase cloud)

-- Create custom types
CREATE TYPE wishlist_privacy AS ENUM ('public', 'friends', 'private');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'declined');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  birthday DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Wishlists table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  privacy wishlist_privacy DEFAULT 'friends' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Wishlist items table
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price TEXT,
  currency TEXT,
  is_purchased BOOLEAN DEFAULT FALSE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Friendships table
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status friendship_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Prevent duplicate friendships
  UNIQUE(requester_id, addressee_id),
  -- Prevent self-friendship
  CHECK (requester_id != addressee_id)
);

-- Item claims table (for gift coordination)
CREATE TABLE item_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
  claimed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Only one person can claim an item
  UNIQUE(item_id)
);

-- Indexes for performance
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX idx_friendships_requester_id ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee_id ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_item_claims_item_id ON item_claims(item_id);
CREATE INDEX idx_item_claims_claimed_by ON item_claims(claimed_by);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON wishlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helper function to check if two users are friends
CREATE OR REPLACE FUNCTION are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (requester_id = user1_id AND addressee_id = user2_id)
      OR (requester_id = user2_id AND addressee_id = user1_id)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can view wishlist
CREATE OR REPLACE FUNCTION can_view_wishlist(wishlist_id UUID, viewer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  wishlist_record RECORD;
BEGIN
  SELECT user_id, privacy INTO wishlist_record
  FROM wishlists WHERE id = wishlist_id;

  -- Owner can always view
  IF wishlist_record.user_id = viewer_id THEN
    RETURN TRUE;
  END IF;

  -- Check based on privacy setting
  CASE wishlist_record.privacy
    WHEN 'public' THEN
      -- Public wishlists visible to all friends
      RETURN are_friends(wishlist_record.user_id, viewer_id);
    WHEN 'friends' THEN
      -- Friends setting also means all friends can view
      RETURN are_friends(wishlist_record.user_id, viewer_id);
    WHEN 'private' THEN
      -- Private wishlists only visible to owner
      RETURN FALSE;
  END CASE;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_claims ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can view any profile (needed for friend search)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- WISHLISTS POLICIES
-- Users can view their own wishlists
CREATE POLICY "Users can view their own wishlists"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Friends can view wishlists based on privacy settings
CREATE POLICY "Friends can view wishlists based on privacy"
  ON wishlists FOR SELECT
  TO authenticated
  USING (
    user_id != auth.uid()
    AND can_view_wishlist(id, auth.uid())
  );

-- Users can create their own wishlists
CREATE POLICY "Users can create their own wishlists"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own wishlists
CREATE POLICY "Users can update their own wishlists"
  ON wishlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own wishlists
CREATE POLICY "Users can delete their own wishlists"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- WISHLIST ITEMS POLICIES
-- Users can view items in wishlists they own
CREATE POLICY "Users can view their own wishlist items"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

-- Friends can view items in viewable wishlists
CREATE POLICY "Friends can view items in viewable wishlists"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id != auth.uid()
      AND can_view_wishlist(wishlists.id, auth.uid())
    )
  );

-- Users can create items in their own wishlists
CREATE POLICY "Users can create items in their own wishlists"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

-- Users can update items in their own wishlists
CREATE POLICY "Users can update items in their own wishlists"
  ON wishlist_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

-- Users can delete items from their own wishlists
CREATE POLICY "Users can delete items from their own wishlists"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

-- FRIENDSHIPS POLICIES
-- Users can view friendships they're part of
CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can create friend requests (as requester)
CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

-- Users can update friendships they're the addressee of (accept/decline)
CREATE POLICY "Addressee can respond to friend requests"
  ON friendships FOR UPDATE
  TO authenticated
  USING (auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = addressee_id);

-- Users can delete friendships they're part of
CREATE POLICY "Users can remove friendships"
  ON friendships FOR DELETE
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ITEM CLAIMS POLICIES
-- Users can view claims on items in wishlists they don't own (see what's claimed)
-- But NOT on their own wishlists (to keep gifts a surprise!)
CREATE POLICY "Users can view claims on others wishlists"
  ON item_claims FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlist_items
      JOIN wishlists ON wishlists.id = wishlist_items.wishlist_id
      WHERE wishlist_items.id = item_claims.item_id
      AND wishlists.user_id != auth.uid()
      AND can_view_wishlist(wishlists.id, auth.uid())
    )
  );

-- Users can claim items on wishlists they can view (not their own)
CREATE POLICY "Users can claim items on viewable wishlists"
  ON item_claims FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = claimed_by
    AND EXISTS (
      SELECT 1 FROM wishlist_items
      JOIN wishlists ON wishlists.id = wishlist_items.wishlist_id
      WHERE wishlist_items.id = item_claims.item_id
      AND wishlists.user_id != auth.uid()
      AND can_view_wishlist(wishlists.id, auth.uid())
    )
  );

-- Users can unclaim items they claimed
CREATE POLICY "Users can unclaim their own claims"
  ON item_claims FOR DELETE
  TO authenticated
  USING (auth.uid() = claimed_by);
