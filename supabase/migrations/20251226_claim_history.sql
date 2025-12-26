-- Claim History Feature
-- Adds status tracking to claims for history view, plus audit events table

-- Create claim status enum
CREATE TYPE claim_status AS ENUM ('active', 'cancelled');

-- Add status tracking to item_claims
ALTER TABLE item_claims
  ADD COLUMN status claim_status DEFAULT 'active' NOT NULL,
  ADD COLUMN cancelled_at TIMESTAMPTZ;

-- Add claim_status to split_claims (separate from lifecycle status pending/confirmed)
ALTER TABLE split_claims
  ADD COLUMN claim_status claim_status DEFAULT 'active' NOT NULL,
  ADD COLUMN cancelled_at TIMESTAMPTZ;

-- Audit trail for claim lifecycle events
CREATE TABLE claim_history_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Reference to either item_claims or split_claims (only one should be set)
  item_claim_id UUID REFERENCES item_claims(id) ON DELETE CASCADE,
  split_claim_id UUID REFERENCES split_claims(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'claimed', 'cancelled', 'uncancelled', 'joined_split', 'left_split'
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metadata JSONB, -- extensible for future data (e.g., reason for cancellation)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Ensure exactly one claim type is referenced
  CONSTRAINT claim_reference_check CHECK (
    (item_claim_id IS NOT NULL AND split_claim_id IS NULL) OR
    (item_claim_id IS NULL AND split_claim_id IS NOT NULL)
  )
);

-- Indexes for performant history queries
CREATE INDEX idx_item_claims_status ON item_claims(status);
CREATE INDEX idx_item_claims_claimed_by_status ON item_claims(claimed_by, status);
CREATE INDEX idx_item_claims_cancelled_at ON item_claims(cancelled_at) WHERE cancelled_at IS NOT NULL;

CREATE INDEX idx_split_claims_claim_status ON split_claims(claim_status);
CREATE INDEX idx_split_claims_cancelled_at ON split_claims(cancelled_at) WHERE cancelled_at IS NOT NULL;

CREATE INDEX idx_claim_history_events_item_claim_id ON claim_history_events(item_claim_id) WHERE item_claim_id IS NOT NULL;
CREATE INDEX idx_claim_history_events_split_claim_id ON claim_history_events(split_claim_id) WHERE split_claim_id IS NOT NULL;
CREATE INDEX idx_claim_history_events_user_id ON claim_history_events(user_id);
CREATE INDEX idx_claim_history_events_created_at ON claim_history_events(created_at DESC);

-- Enable RLS on new table
ALTER TABLE claim_history_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own claim history events
CREATE POLICY "Users can view their own claim history events"
  ON claim_history_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own claim history events
CREATE POLICY "Users can insert their own claim history events"
  ON claim_history_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update RLS policies for item_claims to handle status
-- Drop existing SELECT policy first
DROP POLICY IF EXISTS "Users can view claims on others wishlists" ON item_claims;

-- Recreate with status filter: only show ACTIVE claims to others
CREATE POLICY "Users can view active claims on others wishlists"
  ON item_claims FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM wishlist_items
      JOIN wishlists ON wishlists.id = wishlist_items.wishlist_id
      WHERE wishlist_items.id = item_claims.item_id
      AND wishlists.user_id != auth.uid()
      AND can_view_wishlist(wishlists.id, auth.uid())
    )
  );

-- Add policy for users to view their own claim history (all statuses)
CREATE POLICY "Users can view their own claim history"
  ON item_claims FOR SELECT
  TO authenticated
  USING (claimed_by = auth.uid());

-- Add UPDATE policy for item_claims (needed for soft delete)
CREATE POLICY "Users can update their own claims"
  ON item_claims FOR UPDATE
  TO authenticated
  USING (claimed_by = auth.uid())
  WITH CHECK (claimed_by = auth.uid());

-- Update split_claims RLS to handle claim_status
DROP POLICY IF EXISTS "Users can view split claims on viewable wishlists" ON split_claims;

-- Active split claims visible to friends who can view the wishlist
CREATE POLICY "Users can view active split claims on viewable wishlists"
  ON split_claims FOR SELECT
  TO authenticated
  USING (
    claim_status = 'active'
    AND EXISTS (
      SELECT 1 FROM wishlist_items
      JOIN wishlists ON wishlists.id = wishlist_items.wishlist_id
      WHERE wishlist_items.id = split_claims.item_id
      AND wishlists.user_id != auth.uid()
      AND can_view_wishlist(wishlists.id, auth.uid())
    )
  );

-- Users can view their own split claim history (where they are initiator or participant)
CREATE POLICY "Users can view their own split claim history"
  ON split_claims FOR SELECT
  TO authenticated
  USING (
    initiated_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM split_claim_participants
      WHERE split_claim_participants.split_claim_id = split_claims.id
      AND split_claim_participants.user_id = auth.uid()
    )
  );

-- Add UPDATE policy for split_claims claim_status (separate from existing status update)
-- Keep existing "Initiator can update split claim" policy, it still works

-- Comments for documentation
COMMENT ON COLUMN item_claims.status IS 'Claim lifecycle status: active claims are visible to friends, cancelled only to claimer';
COMMENT ON COLUMN item_claims.cancelled_at IS 'Timestamp when claim was cancelled (soft delete)';
COMMENT ON COLUMN split_claims.claim_status IS 'Overall claim status: active or cancelled. Separate from pending/confirmed lifecycle.';
COMMENT ON COLUMN split_claims.cancelled_at IS 'Timestamp when split claim was cancelled by initiator';
COMMENT ON TABLE claim_history_events IS 'Audit log tracking all claim lifecycle events for history feature';

-- Update triggers to respect claim status (so cancelled claims don't block new claims)
CREATE OR REPLACE FUNCTION prevent_solo_on_split_item()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM split_claims
    WHERE item_id = NEW.item_id
    AND claim_status = 'active'
  ) THEN
    RAISE EXCEPTION 'Item already has a split claim in progress';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_split_on_claimed_item()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM item_claims
    WHERE item_id = NEW.item_id
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Item already has a solo claim';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
