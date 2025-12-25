-- Wishlist Archiving Feature
-- Adds ability to archive wishlists, removing claims and notifying affected users
-- Archived wishlists are hidden from friends and read-only for owners

-- ============================================
-- SCHEMA CHANGES
-- ============================================

-- Add is_archived column to wishlists
ALTER TABLE wishlists ADD COLUMN is_archived BOOLEAN DEFAULT FALSE NOT NULL;

-- Create composite index for efficient filtering of archived/active wishlists
CREATE INDEX idx_wishlists_user_id_is_archived ON wishlists(user_id, is_archived);

-- Add notification type for wishlist archiving
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'wishlist_archived';

-- ============================================
-- UPDATE RLS HELPER FUNCTIONS
-- ============================================

-- Update can_view_wishlist to exclude archived wishlists for non-owners
CREATE OR REPLACE FUNCTION can_view_wishlist(wishlist_id UUID, viewer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  wishlist_record RECORD;
BEGIN
  SELECT user_id, privacy, is_archived INTO wishlist_record
  FROM wishlists WHERE id = wishlist_id;

  -- Owner can always view (including archived)
  IF wishlist_record.user_id = viewer_id THEN
    RETURN TRUE;
  END IF;

  -- Friends cannot view archived wishlists
  IF wishlist_record.is_archived THEN
    RETURN FALSE;
  END IF;

  -- Check based on privacy setting
  CASE wishlist_record.privacy
    WHEN 'friends' THEN
      RETURN are_friends(wishlist_record.user_id, viewer_id);
    WHEN 'selected_friends' THEN
      RETURN are_friends(wishlist_record.user_id, viewer_id)
        AND EXISTS (
          SELECT 1 FROM wishlist_selected_friends
          WHERE wishlist_selected_friends.wishlist_id = can_view_wishlist.wishlist_id
          AND wishlist_selected_friends.friend_id = viewer_id
        );
    WHEN 'private' THEN
      RETURN FALSE;
    WHEN 'public' THEN
      -- Legacy 'public' value treated as 'friends'
      RETURN are_friends(wishlist_record.user_id, viewer_id);
  END CASE;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE RLS POLICIES FOR READ-ONLY ENFORCEMENT
-- ============================================

-- Drop existing item modification policies
DROP POLICY IF EXISTS "Users can create items in their own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Users can update items in their own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Users can delete items from their own wishlists" ON wishlist_items;

-- Recreate with archived check for INSERT
CREATE POLICY "Users can create items in their own wishlists"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
      AND wishlists.is_archived = FALSE
    )
  );

-- Recreate with archived check for UPDATE
CREATE POLICY "Users can update items in their own wishlists"
  ON wishlist_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
      AND wishlists.is_archived = FALSE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
      AND wishlists.is_archived = FALSE
    )
  );

-- Recreate with archived check for DELETE
CREATE POLICY "Users can delete items from their own wishlists"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
      AND wishlists.is_archived = FALSE
    )
  );

-- ============================================
-- TRIGGER FOR CLAIM CLEANUP AND NOTIFICATIONS
-- ============================================

-- Function to handle wishlist archiving side effects
CREATE OR REPLACE FUNCTION handle_wishlist_archiving()
RETURNS TRIGGER AS $$
DECLARE
  affected_user_ids UUID[];
  user_id_item UUID;
  owner_name TEXT;
  deleted_claims_count INTEGER;
BEGIN
  -- Only process when archiving (not unarchiving)
  IF OLD.is_archived = FALSE AND NEW.is_archived = TRUE THEN

    -- Get owner's display name for notifications
    SELECT display_name INTO owner_name
    FROM profiles
    WHERE id = NEW.user_id;

    -- Collect all affected user IDs using set-based operations (more efficient)
    affected_user_ids := ARRAY(
      SELECT DISTINCT user_id FROM (
        -- Solo claim owners
        SELECT ic.claimed_by as user_id
        FROM item_claims ic
        JOIN wishlist_items wi ON wi.id = ic.item_id
        WHERE wi.wishlist_id = NEW.id

        UNION

        -- Split claim participants
        SELECT sc.user_id
        FROM split_claims sc
        JOIN item_claims ic ON ic.id = sc.claim_id
        JOIN wishlist_items wi ON wi.id = ic.item_id
        WHERE wi.wishlist_id = NEW.id
      ) all_users
    );

    -- Delete all claims on items in this wishlist FIRST
    -- (CASCADE will handle split_claims automatically)
    WITH deleted AS (
      DELETE FROM item_claims
      WHERE item_id IN (
        SELECT id FROM wishlist_items WHERE wishlist_id = NEW.id
      )
      RETURNING *
    )
    SELECT COUNT(*) INTO deleted_claims_count FROM deleted;

    -- Only send notifications if claims were actually deleted
    IF array_length(affected_user_ids, 1) > 0 THEN
      FOREACH user_id_item IN ARRAY affected_user_ids
      LOOP
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          actor_id,
          wishlist_id
        ) VALUES (
          user_id_item,
          'wishlist_archived',
          'Gift Claim Removed',
          COALESCE(owner_name, 'A friend') || ' archived "' || NEW.name || '" and your gift claim was removed.',
          NEW.user_id,
          NEW.id
        );
      END LOOP;

      -- Log for debugging
      RAISE NOTICE 'Archived wishlist %, removed % claims, notified % users',
        NEW.id,
        deleted_claims_count,
        array_length(affected_user_ids, 1);
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on wishlists table
DROP TRIGGER IF EXISTS on_wishlist_archived ON wishlists;
CREATE TRIGGER on_wishlist_archived
  AFTER UPDATE ON wishlists
  FOR EACH ROW
  EXECUTE FUNCTION handle_wishlist_archiving();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN wishlists.is_archived IS 'Indicates if wishlist is archived. Archived wishlists are hidden from friends and read-only for owners.';
COMMENT ON FUNCTION handle_wishlist_archiving() IS 'Automatically removes all claims and notifies affected users when a wishlist is archived.';
COMMENT ON TRIGGER on_wishlist_archived ON wishlists IS 'Triggers claim cleanup and notifications when wishlist is archived.';
