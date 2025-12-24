-- Split Claims Feature
-- Allows multiple users to share the cost of a gift

-- Create enum for split claim status
CREATE TYPE split_claim_status AS ENUM ('pending', 'confirmed');

-- Split claims table (one per item, managed by initiator)
CREATE TABLE split_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES wishlist_items(id) ON DELETE CASCADE,
  initiated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_participants INT NOT NULL CHECK (target_participants >= 2 AND target_participants <= 10),
  status split_claim_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  confirmed_at TIMESTAMPTZ,
  -- Only one split claim per item
  UNIQUE(item_id)
);

-- Split claim participants junction table
CREATE TABLE split_claim_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  split_claim_id UUID NOT NULL REFERENCES split_claims(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- One user can only participate once per split
  UNIQUE(split_claim_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_split_claims_item_id ON split_claims(item_id);
CREATE INDEX idx_split_claims_initiated_by ON split_claims(initiated_by);
CREATE INDEX idx_split_claims_status ON split_claims(status);
CREATE INDEX idx_split_claim_participants_split_claim_id ON split_claim_participants(split_claim_id);
CREATE INDEX idx_split_claim_participants_user_id ON split_claim_participants(user_id);

-- Updated_at trigger for split_claims
CREATE TRIGGER update_split_claims_updated_at
  BEFORE UPDATE ON split_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-confirm split when target reached
CREATE OR REPLACE FUNCTION check_split_claim_completion()
RETURNS TRIGGER AS $$
DECLARE
  participant_count INT;
  target INT;
  current_status split_claim_status;
BEGIN
  -- Count participants AFTER the insert (trigger fires AFTER INSERT, so NEW row is counted)
  SELECT COUNT(*)
  INTO participant_count
  FROM split_claim_participants
  WHERE split_claim_id = NEW.split_claim_id;

  -- Get split claim details
  SELECT target_participants, status
  INTO target, current_status
  FROM split_claims
  WHERE id = NEW.split_claim_id;

  -- Auto-confirm if target reached and not already confirmed
  IF participant_count >= target AND current_status = 'pending' THEN
    UPDATE split_claims
    SET status = 'confirmed', confirmed_at = NOW()
    WHERE id = NEW.split_claim_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_confirm_split_claim
  AFTER INSERT ON split_claim_participants
  FOR EACH ROW
  EXECUTE FUNCTION check_split_claim_completion();

-- Function to prevent solo claims on items with split claims
CREATE OR REPLACE FUNCTION prevent_solo_on_split_item()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM split_claims WHERE item_id = NEW.item_id) THEN
    RAISE EXCEPTION 'Item already has a split claim in progress';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_claim_on_split_item
  BEFORE INSERT ON item_claims
  FOR EACH ROW
  EXECUTE FUNCTION prevent_solo_on_split_item();

-- Function to prevent split claims on items with solo claims
CREATE OR REPLACE FUNCTION prevent_split_on_claimed_item()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM item_claims WHERE item_id = NEW.item_id) THEN
    RAISE EXCEPTION 'Item already has a solo claim';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_split_on_claimed_item
  BEFORE INSERT ON split_claims
  FOR EACH ROW
  EXECUTE FUNCTION prevent_split_on_claimed_item();

-- Enable RLS
ALTER TABLE split_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_claim_participants ENABLE ROW LEVEL SECURITY;

-- SPLIT CLAIMS RLS POLICIES
-- Users can view split claims on wishlists they can view (not their own)
CREATE POLICY "Users can view split claims on viewable wishlists"
  ON split_claims FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlist_items
      JOIN wishlists ON wishlists.id = wishlist_items.wishlist_id
      WHERE wishlist_items.id = split_claims.item_id
      AND wishlists.user_id != auth.uid()
      AND can_view_wishlist(wishlists.id, auth.uid())
    )
  );

-- Users can create split claims on viewable wishlists (not their own)
CREATE POLICY "Users can initiate split claims on viewable wishlists"
  ON split_claims FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = initiated_by
    AND EXISTS (
      SELECT 1 FROM wishlist_items
      JOIN wishlists ON wishlists.id = wishlist_items.wishlist_id
      WHERE wishlist_items.id = split_claims.item_id
      AND wishlists.user_id != auth.uid()
      AND can_view_wishlist(wishlists.id, auth.uid())
    )
  );

-- Initiator can update (confirm manually)
CREATE POLICY "Initiator can update split claim"
  ON split_claims FOR UPDATE
  TO authenticated
  USING (auth.uid() = initiated_by)
  WITH CHECK (auth.uid() = initiated_by);

-- Initiator can delete (cancel split) only while pending
CREATE POLICY "Initiator can delete pending split claim"
  ON split_claims FOR DELETE
  TO authenticated
  USING (auth.uid() = initiated_by AND status = 'pending');

-- SPLIT CLAIM PARTICIPANTS RLS POLICIES
-- Users can view participants if they can view the split claim
CREATE POLICY "Users can view split participants"
  ON split_claim_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM split_claims
      JOIN wishlist_items ON wishlist_items.id = split_claims.item_id
      JOIN wishlists ON wishlists.id = wishlist_items.wishlist_id
      WHERE split_claims.id = split_claim_participants.split_claim_id
      AND wishlists.user_id != auth.uid()
      AND can_view_wishlist(wishlists.id, auth.uid())
    )
  );

-- Users can join split claims on viewable wishlists
CREATE POLICY "Users can join split claims"
  ON split_claim_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM split_claims
      JOIN wishlist_items ON wishlist_items.id = split_claims.item_id
      JOIN wishlists ON wishlists.id = wishlist_items.wishlist_id
      WHERE split_claims.id = split_claim_participants.split_claim_id
      AND wishlists.user_id != auth.uid()
      AND can_view_wishlist(wishlists.id, auth.uid())
      AND split_claims.status = 'pending'
    )
  );

-- Users can leave split claims they joined (only while pending)
CREATE POLICY "Users can leave pending split claims"
  ON split_claim_participants FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM split_claims
      WHERE split_claims.id = split_claim_participants.split_claim_id
      AND split_claims.status = 'pending'
    )
  );
