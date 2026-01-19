-- Add RLS to Unrestricted Database Objects
-- This migration adds Row Level Security to database objects that currently lack proper RLS policies
-- Specifically: notification_type_categories table

-- ============================================
-- PART 1: NOTIFICATION_TYPE_CATEGORIES TABLE RLS
-- ============================================

-- Enable RLS on the notification_type_categories table
ALTER TABLE notification_type_categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view all rows
-- This is a reference/lookup table with no sensitive user data
CREATE POLICY "Anyone can view notification type categories"
  ON notification_type_categories FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE notification_type_categories IS 'Reference table for notification type categories. RLS enabled following security best practices, but all authenticated users can read all rows.';
