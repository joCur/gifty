-- Update validate_invite_code to return inviter's display name
-- Must drop first because return type is changing

DROP FUNCTION IF EXISTS validate_invite_code(TEXT);

CREATE OR REPLACE FUNCTION validate_invite_code(invite_code TEXT)
RETURNS TABLE (
  valid BOOLEAN,
  error_message TEXT,
  inviter_id UUID,
  inviter_name TEXT
) AS $$
DECLARE
  invite_record RECORD;
  inviter_profile RECORD;
BEGIN
  -- Look up the invite code
  SELECT * INTO invite_record
  FROM invite_codes
  WHERE code = invite_code;

  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Invalid invite code'::TEXT, NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;

  -- Check if already used
  IF invite_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, 'This invite has already been used'::TEXT, NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;

  -- Check if expired
  IF invite_record.expires_at < NOW() THEN
    RETURN QUERY SELECT FALSE, 'This invite has expired'::TEXT, NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;

  -- Get inviter's profile
  SELECT display_name INTO inviter_profile
  FROM profiles
  WHERE id = invite_record.created_by;

  -- Valid!
  RETURN QUERY SELECT TRUE, NULL::TEXT, invite_record.created_by, inviter_profile.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
