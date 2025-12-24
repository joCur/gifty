-- Item Custom Images Migration
-- Adds custom_image_url column and creates storage bucket for user-uploaded item images

-- Add custom_image_url column to wishlist_items table
ALTER TABLE wishlist_items
ADD COLUMN custom_image_url TEXT;

COMMENT ON COLUMN wishlist_items.custom_image_url IS 'Custom uploaded image URL from item-images storage bucket';
COMMENT ON COLUMN wishlist_items.image_url IS 'External image URL (from scraped metadata or manual entry)';

-- Create item-images storage bucket (public for reading)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- RLS Policy: Public read access for all item images
CREATE POLICY "Item images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'item-images');

-- RLS Policy: Users can upload their own item images
-- File path must start with their user ID
CREATE POLICY "Users can upload their own item images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'item-images'
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

-- RLS Policy: Users can update their own item images
CREATE POLICY "Users can update their own item images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'item-images'
  AND (storage.foldername(name))[1] = (select auth.uid())::text
)
WITH CHECK (
  bucket_id = 'item-images'
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);

-- RLS Policy: Users can delete their own item images
CREATE POLICY "Users can delete their own item images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'item-images'
  AND (storage.foldername(name))[1] = (select auth.uid())::text
);
