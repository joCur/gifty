/**
 * Storage utilities for Supabase Storage operations
 */

export const STORAGE_CONFIG = {
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MIME_TO_EXTENSION: {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  } as const,
};

export type AllowedMimeType = (typeof STORAGE_CONFIG.ALLOWED_TYPES)[number];

/**
 * Validate an image file for upload
 * @returns Error message if invalid, null if valid
 */
export function validateImageFile(file: File): string | null {
  if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(file.type as AllowedMimeType)) {
    return "Invalid file type. Please use JPG, PNG, or WebP";
  }

  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    return "File too large. Maximum size is 5MB";
  }

  return null;
}

/**
 * Generate a safe storage filename from validated MIME type
 * Prevents extension spoofing by deriving extension from MIME type
 */
export function generateStorageFileName(
  userId: string,
  itemId: string,
  mimeType: string
): string {
  const ext =
    STORAGE_CONFIG.MIME_TO_EXTENSION[mimeType as AllowedMimeType] || "jpg";
  return `${userId}/${itemId}/${Date.now()}.${ext}`;
}

/**
 * Extract the storage path from a Supabase Storage public URL
 * @param publicUrl The full public URL from Supabase Storage
 * @param bucket The bucket name to extract from
 * @returns The storage path (e.g., "userId/itemId/timestamp.jpg") or null if not a valid storage URL
 */
export function extractStoragePath(
  publicUrl: string,
  bucket: string
): string | null {
  try {
    const url = new URL(publicUrl);

    // Validate this is a Supabase storage URL for the specified bucket
    const bucketPath = `/storage/v1/object/public/${bucket}/`;
    if (!url.pathname.includes(bucketPath)) {
      return null;
    }

    // Extract the path after /bucket/
    const regex = new RegExp(`/${bucket}/(.+)$`);
    const match = url.pathname.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is from Supabase Storage
 */
export function isStorageUrl(url: string, bucket: string): boolean {
  return extractStoragePath(url, bucket) !== null;
}
