"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  STORAGE_CONFIG,
  validateImageFile,
  generateStorageFileName,
  extractStoragePath,
} from "@/lib/utils/storage";

const BUCKET_NAME = "item-images";

/**
 * Upload a custom image for a wishlist item
 */
export async function uploadItemImage(
  itemId: string,
  wishlistId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify user owns the wishlist
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("user_id")
    .eq("id", wishlistId)
    .single();

  if (!wishlist || wishlist.user_id !== user.id) {
    return { error: "Not authorized" };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { error: "No file provided" };
  }

  // Validate file
  const validationError = validateImageFile(file);
  if (validationError) {
    return { error: validationError };
  }

  try {
    // Get current item and verify it belongs to this wishlist
    const { data: currentItem } = await supabase
      .from("wishlist_items")
      .select("custom_image_url, wishlist_id")
      .eq("id", itemId)
      .single();

    if (!currentItem || currentItem.wishlist_id !== wishlistId) {
      return { error: "Item not found in this wishlist" };
    }

    // Generate unique filename
    const fileName = generateStorageFileName(user.id, itemId, file.type);

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { error: "Failed to upload image. Please try again." };
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    // Update item with new custom image URL and clear external URL
    const { error: updateError } = await supabase
      .from("wishlist_items")
      .update({
        custom_image_url: publicUrl,
        image_url: null,
      })
      .eq("id", itemId);

    if (updateError) {
      // Rollback: delete the uploaded file if DB update fails
      await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      return { error: "Failed to update item. Please try again." };
    }

    // Clean up old custom image if it exists
    if (currentItem?.custom_image_url) {
      const oldPath = extractStoragePath(
        currentItem.custom_image_url,
        BUCKET_NAME
      );
      if (oldPath) {
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([oldPath]);
        if (deleteError) {
          // Log but don't fail - the new image is already set
          console.error("Failed to delete old item image:", deleteError);
        }
      }
    }

    revalidatePath(`/wishlists/${wishlistId}`);
    return { success: true, imageUrl: publicUrl };
  } catch (error) {
    console.error("Item image upload error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Remove the custom image from a wishlist item
 */
export async function removeItemImage(itemId: string, wishlistId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify user owns the wishlist
  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("user_id")
    .eq("id", wishlistId)
    .single();

  if (!wishlist || wishlist.user_id !== user.id) {
    return { error: "Not authorized" };
  }

  try {
    // Get current item and verify it belongs to this wishlist
    const { data: item } = await supabase
      .from("wishlist_items")
      .select("custom_image_url, wishlist_id")
      .eq("id", itemId)
      .single();

    if (!item || item.wishlist_id !== wishlistId) {
      return { error: "Item not found in this wishlist" };
    }

    if (!item.custom_image_url) {
      return { error: "No custom image to remove" };
    }

    // Update item to remove custom image URL
    const { error: updateError } = await supabase
      .from("wishlist_items")
      .update({ custom_image_url: null })
      .eq("id", itemId);

    if (updateError) {
      return { error: "Failed to update item. Please try again." };
    }

    // Delete file from storage
    const filePath = extractStoragePath(item.custom_image_url, BUCKET_NAME);
    if (filePath) {
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
      if (deleteError) {
        // Log but don't fail - the image URL is already removed from item
        console.error("Failed to delete item image file:", deleteError);
      }
    }

    revalidatePath(`/wishlists/${wishlistId}`);
    return { success: true };
  } catch (error) {
    console.error("Item image removal error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Delete custom image from storage (called when item is deleted)
 * This is a helper function for the deleteItem action
 */
export async function cleanupItemImage(customImageUrl: string | null) {
  if (!customImageUrl) return;

  const supabase = await createClient();
  const filePath = extractStoragePath(customImageUrl, BUCKET_NAME);

  if (filePath) {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error) {
      console.error("Failed to cleanup item image:", error);
    }
  }
}
