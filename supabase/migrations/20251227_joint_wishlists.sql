-- Joint Wishlists Feature
-- Allows multiple co-owners to manage a wishlist together
-- Gift claims are hidden from ALL co-owners (not just the item creator)
-- Primary owner (creator) retains exclusive rights to delete/archive

-- ============================================
-- SCHEMA CHANGES
-- ============================================

-- Junction table for wishlist collaborators (co-owners)
CREATE TABLE wishlist_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One user can only be a collaborator once per wishlist
  UNIQUE(wishlist_id, user_id)
);

-- Add flag to wishlists to easily identify joint wishlists
ALTER TABLE wishlists ADD COLUMN is_joint BOOLEAN DEFAULT FALSE NOT NULL;

-- Indexes for performance
CREATE INDEX idx_wishlist_collaborators_wishlist_id ON wishlist_collaborators(wishlist_id);
CREATE INDEX idx_wishlist_collaborators_user_id ON wishlist_collaborators(user_id);
CREATE INDEX idx_wishlists_is_joint ON wishlists(is_joint) WHERE is_joint = TRUE;

-- Add notification types
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'collaborator_invited';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'collaborator_left';

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is a collaborator (co-owner) of a wishlist
CREATE OR REPLACE FUNCTION is_wishlist_collaborator(target_wishlist_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM wishlist_collaborators wc
    WHERE wc.wishlist_id = target_wishlist_id
    AND wc.user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if user has edit rights on wishlist (primary owner OR collaborator)
CREATE OR REPLACE FUNCTION can_edit_wishlist(target_wishlist_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  wishlist_record RECORD;
BEGIN
  SELECT w.user_id, w.is_archived INTO wishlist_record
  FROM wishlists w WHERE w.id = target_wishlist_id;

  -- Cannot edit archived wishlists
  IF wishlist_record.is_archived THEN
    RETURN FALSE;
  END IF;

  -- Primary owner can edit
  IF wishlist_record.user_id = target_user_id THEN
    RETURN TRUE;
  END IF;

  -- Collaborator can edit
  RETURN is_wishlist_collaborator(target_wishlist_id, target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if user is primary owner
CREATE OR REPLACE FUNCTION is_primary_owner(target_wishlist_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM wishlists
    WHERE id = target_wishlist_id
    AND user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if user is a participant in a split claim (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION is_split_claim_participant(target_split_claim_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM split_claim_participants
    WHERE split_claim_id = target_split_claim_id
    AND user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if user initiated a split claim (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION is_split_claim_initiator(target_split_claim_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM split_claims
    WHERE id = target_split_claim_id
    AND initiated_by = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if user can view a split claim's item (not owner/collaborator and is friend)
-- SECURITY DEFINER to avoid RLS recursion
CREATE OR REPLACE FUNCTION can_view_split_claim_as_friend(target_split_claim_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  wishlist_record RECORD;
BEGIN
  SELECT w.id as wishlist_id, w.user_id, w.privacy, w.is_archived
  INTO wishlist_record
  FROM split_claims sc
  JOIN wishlist_items wi ON wi.id = sc.item_id
  JOIN wishlists w ON w.id = wi.wishlist_id
  WHERE sc.id = target_split_claim_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Cannot be owner or collaborator
  IF wishlist_record.user_id = target_user_id THEN
    RETURN FALSE;
  END IF;

  IF is_wishlist_collaborator(wishlist_record.wishlist_id, target_user_id) THEN
    RETURN FALSE;
  END IF;

  -- Cannot view archived
  IF wishlist_record.is_archived THEN
    RETURN FALSE;
  END IF;

  -- Check privacy
  IF wishlist_record.privacy = 'friends' THEN
    RETURN are_friends(wishlist_record.user_id, target_user_id);
  ELSIF wishlist_record.privacy = 'selected_friends' THEN
    RETURN are_friends(wishlist_record.user_id, target_user_id)
      AND EXISTS (
        SELECT 1 FROM wishlist_selected_friends wsf
        WHERE wsf.wishlist_id = wishlist_record.wishlist_id
        AND wsf.friend_id = target_user_id
      );
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if split claim is pending (for join checks)
CREATE OR REPLACE FUNCTION is_split_claim_pending(target_split_claim_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM split_claims
    WHERE id = target_split_claim_id
    AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update can_view_wishlist to include collaborators
-- Note: Must use same parameter names as original function (wishlist_id, viewer_id)
CREATE OR REPLACE FUNCTION can_view_wishlist(wishlist_id UUID, viewer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  wishlist_record RECORD;
BEGIN
  SELECT user_id, privacy, is_archived INTO wishlist_record
  FROM wishlists WHERE id = can_view_wishlist.wishlist_id;

  -- Primary owner can always view (including archived)
  IF wishlist_record.user_id = viewer_id THEN
    RETURN TRUE;
  END IF;

  -- Collaborators can always view (including archived)
  IF is_wishlist_collaborator(can_view_wishlist.wishlist_id, viewer_id) THEN
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
          SELECT 1 FROM wishlist_selected_friends wsf
          WHERE wsf.wishlist_id = can_view_wishlist.wishlist_id
          AND wsf.friend_id = viewer_id
        );
    WHEN 'private' THEN
      RETURN FALSE;
    WHEN 'public' THEN
      -- Legacy 'public' value treated as 'friends'
      RETURN are_friends(wishlist_record.user_id, viewer_id);
  END CASE;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- UPDATE RLS POLICIES
-- ============================================

-- Enable RLS on new table
ALTER TABLE wishlist_collaborators ENABLE ROW LEVEL SECURITY;

-- WISHLIST_COLLABORATORS POLICIES

-- Users can view collaborators if they can view the wishlist
CREATE POLICY "Users can view collaborators of viewable wishlists"
  ON wishlist_collaborators FOR SELECT
  TO authenticated
  USING (can_view_wishlist(wishlist_id, (SELECT auth.uid())));

-- Primary owner can add collaborators
CREATE POLICY "Primary owner can add collaborators"
  ON wishlist_collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    is_primary_owner(wishlist_id, (SELECT auth.uid()))
  );

-- Primary owner or the collaborator themselves can remove
CREATE POLICY "Primary owner or self can remove collaborators"
  ON wishlist_collaborators FOR DELETE
  TO authenticated
  USING (
    is_primary_owner(wishlist_id, (SELECT auth.uid()))
    OR user_id = (SELECT auth.uid())
  );

-- UPDATE EXISTING WISHLIST POLICIES

-- Drop and recreate wishlists SELECT policies
DROP POLICY IF EXISTS "Users can view their own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Friends can view wishlists based on privacy" ON wishlists;

-- Users can view wishlists they own OR are collaborators on
CREATE POLICY "Users can view their wishlists and collaborations"
  ON wishlists FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = user_id
    OR is_wishlist_collaborator(id, (SELECT auth.uid()))
  );

-- Friends can view wishlists based on privacy (non-owners)
CREATE POLICY "Friends can view wishlists based on privacy"
  ON wishlists FOR SELECT
  TO authenticated
  USING (
    user_id != (SELECT auth.uid())
    AND NOT is_wishlist_collaborator(id, (SELECT auth.uid()))
    AND can_view_wishlist(id, (SELECT auth.uid()))
  );

-- Drop and recreate UPDATE policy for wishlists
DROP POLICY IF EXISTS "Users can update their own wishlists" ON wishlists;

CREATE POLICY "Co-owners can update wishlists"
  ON wishlists FOR UPDATE
  TO authenticated
  USING (can_edit_wishlist(id, (SELECT auth.uid())))
  WITH CHECK (can_edit_wishlist(id, (SELECT auth.uid())));

-- DELETE policy stays primary-owner only (no change needed - already uses user_id = auth.uid())

-- UPDATE WISHLIST_ITEMS POLICIES

-- Drop and recreate item policies to use can_edit_wishlist()
DROP POLICY IF EXISTS "Users can view their own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can create items in their own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Users can update items in their own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Users can delete items from their own wishlists" ON wishlist_items;

CREATE POLICY "Users can view their own wishlist items"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        wishlists.user_id = (SELECT auth.uid())
        OR is_wishlist_collaborator(wishlists.id, (SELECT auth.uid()))
      )
    )
  );

CREATE POLICY "Co-owners can create items"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND can_edit_wishlist(wishlists.id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Co-owners can update items"
  ON wishlist_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND can_edit_wishlist(wishlists.id, (SELECT auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND can_edit_wishlist(wishlists.id, (SELECT auth.uid()))
    )
  );

CREATE POLICY "Co-owners can delete items"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND can_edit_wishlist(wishlists.id, (SELECT auth.uid()))
    )
  );

-- Keep "Friends can view items in viewable wishlists" policy as is

-- UPDATE ITEM_CLAIMS RLS TO HIDE FROM ALL CO-OWNERS

-- Drop existing claims SELECT policy
DROP POLICY IF EXISTS "Users can view claims on others wishlists" ON item_claims;
DROP POLICY IF EXISTS "Users can view active claims on others wishlists" ON item_claims;

-- Users can view claims if:
-- 1. They made the claim (their own claims), OR
-- 2. They can view the wishlist AND are NOT a co-owner (primary owner or collaborator)
DROP POLICY IF EXISTS "Users can view claims on non-owned wishlists" ON item_claims;

CREATE POLICY "Users can view claims"
  ON item_claims FOR SELECT
  TO authenticated
  USING (
    -- User made this claim
    claimed_by = (SELECT auth.uid())
    OR (
      -- User is a friend who can view but is NOT an owner/collaborator
      EXISTS (
        SELECT 1 FROM wishlist_items wi
        JOIN wishlists w ON w.id = wi.wishlist_id
        WHERE wi.id = item_claims.item_id
        AND w.user_id != (SELECT auth.uid())
        AND NOT is_wishlist_collaborator(w.id, (SELECT auth.uid()))
        AND NOT w.is_archived
        AND (
          (w.privacy = 'friends' AND are_friends(w.user_id, (SELECT auth.uid())))
          OR (w.privacy = 'selected_friends' AND are_friends(w.user_id, (SELECT auth.uid())) AND EXISTS (
            SELECT 1 FROM wishlist_selected_friends wsf
            WHERE wsf.wishlist_id = w.id AND wsf.friend_id = (SELECT auth.uid())
          ))
        )
      )
    )
  );

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own claims history" ON item_claims;
DROP POLICY IF EXISTS "Users can view their own claims" ON item_claims;

-- Update claim INSERT policy
DROP POLICY IF EXISTS "Users can claim items on viewable wishlists" ON item_claims;
DROP POLICY IF EXISTS "Users can claim items on non-owned wishlists" ON item_claims;

CREATE POLICY "Users can claim items on friend wishlists"
  ON item_claims FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = claimed_by
    AND EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = item_claims.item_id
      AND w.user_id != (SELECT auth.uid())
      AND NOT is_wishlist_collaborator(w.id, (SELECT auth.uid()))
      AND NOT w.is_archived
      AND (
        (w.privacy = 'friends' AND are_friends(w.user_id, (SELECT auth.uid())))
        OR (w.privacy = 'selected_friends' AND are_friends(w.user_id, (SELECT auth.uid())) AND EXISTS (
          SELECT 1 FROM wishlist_selected_friends wsf
          WHERE wsf.wishlist_id = w.id AND wsf.friend_id = (SELECT auth.uid())
        ))
      )
    )
  );

-- UPDATE SPLIT_CLAIMS RLS TO HIDE FROM ALL CO-OWNERS

-- Drop existing split claims policies if they exist
DROP POLICY IF EXISTS "Users can view split claims on viewable wishlists" ON split_claims;
DROP POLICY IF EXISTS "Users can view claims on participant split" ON split_claims;
DROP POLICY IF EXISTS "Users can view split claims on non-owned wishlists" ON split_claims;
DROP POLICY IF EXISTS "Users can view their participating split claims" ON split_claims;

-- Users can view split claims if:
-- 1. They initiated it or are a participant, OR
-- 2. They can view the wishlist AND are NOT a co-owner (primary owner or collaborator)
CREATE POLICY "Users can view split claims"
  ON split_claims FOR SELECT
  TO authenticated
  USING (
    -- User initiated or is participant (using SECURITY DEFINER function to avoid RLS recursion)
    initiated_by = (SELECT auth.uid())
    OR is_split_claim_participant(id, (SELECT auth.uid()))
    OR (
      -- User is a friend who can view but is NOT an owner/collaborator
      EXISTS (
        SELECT 1 FROM wishlist_items wi
        JOIN wishlists w ON w.id = wi.wishlist_id
        WHERE wi.id = split_claims.item_id
        AND w.user_id != (SELECT auth.uid())
        AND NOT is_wishlist_collaborator(w.id, (SELECT auth.uid()))
        AND NOT w.is_archived
        AND (
          (w.privacy = 'friends' AND are_friends(w.user_id, (SELECT auth.uid())))
          OR (w.privacy = 'selected_friends' AND are_friends(w.user_id, (SELECT auth.uid())) AND EXISTS (
            SELECT 1 FROM wishlist_selected_friends wsf
            WHERE wsf.wishlist_id = w.id AND wsf.friend_id = (SELECT auth.uid())
          ))
        )
      )
    )
  );

-- Update split claim INSERT policy
DROP POLICY IF EXISTS "Users can initiate split claims on viewable wishlists" ON split_claims;
DROP POLICY IF EXISTS "Users can initiate split claims on non-owned wishlists" ON split_claims;

CREATE POLICY "Users can initiate split claims on friend wishlists"
  ON split_claims FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = initiated_by
    AND EXISTS (
      SELECT 1 FROM wishlist_items wi
      JOIN wishlists w ON w.id = wi.wishlist_id
      WHERE wi.id = split_claims.item_id
      AND w.user_id != (SELECT auth.uid())
      AND NOT is_wishlist_collaborator(w.id, (SELECT auth.uid()))
      AND NOT w.is_archived
      AND (
        (w.privacy = 'friends' AND are_friends(w.user_id, (SELECT auth.uid())))
        OR (w.privacy = 'selected_friends' AND are_friends(w.user_id, (SELECT auth.uid())) AND EXISTS (
          SELECT 1 FROM wishlist_selected_friends wsf
          WHERE wsf.wishlist_id = w.id AND wsf.friend_id = (SELECT auth.uid())
        ))
      )
    )
  );

-- UPDATE SPLIT_CLAIM_PARTICIPANTS RLS TO AVOID RECURSION
-- Use SECURITY DEFINER helper functions to prevent circular dependencies

DROP POLICY IF EXISTS "Users can view split participants" ON split_claim_participants;

CREATE POLICY "Users can view split participants"
  ON split_claim_participants FOR SELECT
  TO authenticated
  USING (
    -- User is the participant
    user_id = (SELECT auth.uid())
    -- OR user initiated the split claim
    OR is_split_claim_initiator(split_claim_id, (SELECT auth.uid()))
    -- OR user is a friend who can view
    OR can_view_split_claim_as_friend(split_claim_id, (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "Users can join split claims" ON split_claim_participants;

CREATE POLICY "Users can join split claims"
  ON split_claim_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND is_split_claim_pending(split_claim_id)
    AND can_view_split_claim_as_friend(split_claim_id, (SELECT auth.uid()))
  );

-- DELETE policy stays as is - doesn't cause recursion since it only checks status

-- ============================================
-- TRIGGERS
-- ============================================

-- Automatically set is_joint flag when collaborators are added/removed
CREATE OR REPLACE FUNCTION update_wishlist_is_joint_flag()
RETURNS TRIGGER AS $$
DECLARE
  collaborator_count INTEGER;
  target_wishlist_id UUID;
BEGIN
  -- Get the affected wishlist ID
  IF TG_OP = 'DELETE' THEN
    target_wishlist_id := OLD.wishlist_id;
  ELSE
    target_wishlist_id := NEW.wishlist_id;
  END IF;

  -- Count collaborators for the affected wishlist
  SELECT COUNT(*) INTO collaborator_count
  FROM wishlist_collaborators
  WHERE wishlist_id = target_wishlist_id;

  UPDATE wishlists
  SET is_joint = (collaborator_count > 0)
  WHERE id = target_wishlist_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_is_joint_on_collaborator_change
  AFTER INSERT OR DELETE ON wishlist_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION update_wishlist_is_joint_flag();

-- Notify user when added as collaborator
CREATE OR REPLACE FUNCTION notify_collaborator_added()
RETURNS TRIGGER AS $$
DECLARE
  wishlist_name TEXT;
  inviter_name TEXT;
BEGIN
  -- Get wishlist name and inviter name
  SELECT w.name, p.display_name
  INTO wishlist_name, inviter_name
  FROM wishlists w, profiles p
  WHERE w.id = NEW.wishlist_id
  AND p.id = NEW.invited_by;

  -- Notify the invited user
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    actor_id,
    wishlist_id
  ) VALUES (
    NEW.user_id,
    'collaborator_invited',
    'Added as Co-owner',
    COALESCE(inviter_name, 'Someone') || ' added you as a co-owner of "' || COALESCE(wishlist_name, 'a wishlist') || '"',
    NEW.invited_by,
    NEW.wishlist_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_collaborator_added
  AFTER INSERT ON wishlist_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION notify_collaborator_added();

-- Notify primary owner when collaborator leaves
CREATE OR REPLACE FUNCTION notify_collaborator_left()
RETURNS TRIGGER AS $$
DECLARE
  wishlist_owner_id UUID;
  wishlist_name TEXT;
  leaver_name TEXT;
BEGIN
  -- Get wishlist owner, name and leaver name
  SELECT w.user_id, w.name, p.display_name
  INTO wishlist_owner_id, wishlist_name, leaver_name
  FROM wishlists w, profiles p
  WHERE w.id = OLD.wishlist_id
  AND p.id = OLD.user_id;

  -- Notify the primary owner (only if the leaving user deleted themselves)
  IF OLD.user_id != wishlist_owner_id THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      actor_id,
      wishlist_id
    ) VALUES (
      wishlist_owner_id,
      'collaborator_left',
      'Co-owner Left',
      COALESCE(leaver_name, 'Someone') || ' left "' || COALESCE(wishlist_name, 'your wishlist') || '" as a co-owner',
      OLD.user_id,
      OLD.wishlist_id
    );
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_collaborator_left
  AFTER DELETE ON wishlist_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION notify_collaborator_left();

-- Remove collaborators when friendship ends
CREATE OR REPLACE FUNCTION remove_collaborators_on_unfriend()
RETURNS TRIGGER AS $$
BEGIN
  -- When friendship ends (deleted or declined), remove any collaborator relationships
  DELETE FROM wishlist_collaborators
  WHERE (
    -- User A was collaborator on User B's wishlist
    (user_id = OLD.requester_id AND wishlist_id IN (SELECT id FROM wishlists WHERE user_id = OLD.addressee_id))
    OR
    (user_id = OLD.addressee_id AND wishlist_id IN (SELECT id FROM wishlists WHERE user_id = OLD.requester_id))
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_friendship_ended_remove_collaborators
  AFTER DELETE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION remove_collaborators_on_unfriend();

-- Also remove when friendship is declined
CREATE TRIGGER on_friendship_declined_remove_collaborators
  AFTER UPDATE OF status ON friendships
  FOR EACH ROW
  WHEN (NEW.status = 'declined')
  EXECUTE FUNCTION remove_collaborators_on_unfriend();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE wishlist_collaborators IS 'Junction table for joint wishlist co-owners. Primary owner is still in wishlists.user_id';
COMMENT ON COLUMN wishlists.is_joint IS 'Automatically maintained flag indicating if wishlist has collaborators';
COMMENT ON FUNCTION is_wishlist_collaborator(UUID, UUID) IS 'Returns true if user is a collaborator (co-owner) on the wishlist';
COMMENT ON FUNCTION can_edit_wishlist(UUID, UUID) IS 'Returns true if user can edit wishlist (primary owner OR collaborator, and not archived)';
COMMENT ON FUNCTION is_primary_owner(UUID, UUID) IS 'Returns true if user is the primary owner (creator) of the wishlist';
COMMENT ON FUNCTION is_split_claim_participant(UUID, UUID) IS 'Returns true if user is a participant in a split claim (SECURITY DEFINER to avoid RLS recursion)';
COMMENT ON FUNCTION is_split_claim_initiator(UUID, UUID) IS 'Returns true if user initiated a split claim (SECURITY DEFINER to avoid RLS recursion)';
COMMENT ON FUNCTION can_view_split_claim_as_friend(UUID, UUID) IS 'Returns true if user can view a split claim as a friend (not owner/collaborator, SECURITY DEFINER)';
COMMENT ON FUNCTION is_split_claim_pending(UUID) IS 'Returns true if split claim is pending (SECURITY DEFINER to avoid RLS recursion)';
