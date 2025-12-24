-- Invite-Only Registration System
-- Allows existing users to generate invite codes for new user registration

-- Create invite_codes table
CREATE TABLE invite_codes (
  code TEXT PRIMARY KEY,  -- 8-char alphanumeric code (e.g., "GIFT2024")
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Indexes for performance
CREATE INDEX idx_invite_codes_created_by ON invite_codes(created_by);
CREATE INDEX idx_invite_codes_unused ON invite_codes(code) WHERE used_at IS NULL;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Users can view their own created invites
CREATE POLICY "Users can view their own invites"
  ON invite_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Users can create invites
CREATE POLICY "Users can create invites"
  ON invite_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- ============================================
-- VALIDATION FUNCTION (runs as definer to bypass RLS)
-- ============================================

CREATE OR REPLACE FUNCTION validate_invite_code(invite_code TEXT)
RETURNS TABLE (
  valid BOOLEAN,
  error_message TEXT,
  inviter_id UUID
) AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Look up the invite code
  SELECT * INTO invite_record
  FROM invite_codes
  WHERE code = invite_code;

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Invalid invite code'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check if already used
  IF invite_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, 'This invite has already been used'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check if expired
  IF invite_record.expires_at < NOW() THEN
    RETURN QUERY SELECT FALSE, 'This invite has expired'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Valid!
  RETURN QUERY SELECT TRUE, NULL::TEXT, invite_record.created_by;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CONSUME INVITE AND CREATE FRIENDSHIP (atomic)
-- ============================================

CREATE OR REPLACE FUNCTION consume_invite_and_befriend(
  invite_code TEXT,
  new_user_id UUID
)
RETURNS void AS $$
DECLARE
  inviter_id UUID;
BEGIN
  -- Lock the invite row for update and validate
  SELECT created_by INTO inviter_id
  FROM invite_codes
  WHERE code = invite_code
    AND used_at IS NULL
    AND expires_at > NOW()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  -- Mark invite as used
  UPDATE invite_codes
  SET used_at = NOW(), used_by = new_user_id
  WHERE code = invite_code;

  -- Create friendship (auto-accepted, inviter is requester)
  INSERT INTO friendships (requester_id, addressee_id, status)
  VALUES (inviter_id, new_user_id, 'accepted')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
