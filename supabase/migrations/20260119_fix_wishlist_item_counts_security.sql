-- Migration: Fix security vulnerability in wishlist_item_counts view
--
-- Problem: The wishlist_item_counts view was created without security_invoker,
-- which means it executes with the definer's (superuser) permissions, bypassing
-- RLS policies on the underlying wishlists and wishlist_items tables.
--
-- Solution: Recreate the view with security_invoker = true to ensure the view
-- respects RLS policies and only shows data the current user is authorized to see.
--
-- Related: Task 003 - Restrict Access to Unrestricted Tables/Views for Better Security

-- Recreate the view with security_invoker = true
-- This ensures the view executes with the calling user's permissions,
-- respecting RLS policies on wishlists and wishlist_items tables
CREATE OR REPLACE VIEW wishlist_item_counts
WITH (security_invoker = true) AS
SELECT
  w.id AS wishlist_id,
  w.user_id AS owner_id,
  COUNT(wi.id) AS total_items,
  COUNT(wi.id) FILTER (WHERE wi.is_received = FALSE AND wi.is_purchased = FALSE) AS available_items
FROM wishlists w
LEFT JOIN wishlist_items wi ON wi.wishlist_id = w.id
GROUP BY w.id, w.user_id;

-- Update comment to reflect security enhancement
COMMENT ON VIEW wishlist_item_counts IS
  'Pre-computed item counts per wishlist. total_items = all items (for owner views), available_items = excludes received/purchased (for friend views). Uses security_invoker to respect RLS policies.';

-- Note: GRANT SELECT permission is already applied in 20251231_wishlist_item_counts.sql
-- No need to reapply it here
