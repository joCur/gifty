"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "./helpers";
import { revalidatePath } from "next/cache";
import type { WishlistPrivacy } from "@/lib/supabase/types.custom";

/**
 * Helper: Verify user owns the wishlist
 */
async function verifyWishlistOwnership(
  supabase: any,
  userId: string,
  wishlistId: string,
  additionalFields?: string
): Promise<{ wishlist: any } | { error: string }> {
  const selectFields = additionalFields ? `user_id, ${additionalFields}` : "user_id";

  const { data: wishlist, error: fetchError } = await supabase
    .from("wishlists")
    .select(selectFields)
    .eq("id", wishlistId)
    .single();

  if (fetchError) {
    return { error: "Wishlist not found" };
  }

  if (!wishlist || wishlist.user_id !== userId) {
    return { error: "Not authorized" };
  }

  return { wishlist };
}

export async function getMyWishlists(archived: boolean = false) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("wishlists")
    .select(
      `
      *,
      items:wishlist_items(count)
    `
    )
    .eq("user_id", user.id)
    .eq("is_archived", archived)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching wishlists:", error);
    return [];
  }

  return data || [];
}

export async function getWishlist(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("wishlists")
    .select(
      `
      *,
      owner:profiles!wishlists_user_id_fkey(id, display_name, avatar_url),
      items:wishlist_items(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching wishlist:", error);
    return null;
  }

  return data;
}

export async function createWishlist(formData: FormData) {
  try {
    const { supabase, user } = await requireAuth();

    const name = formData.get("name") as string;
    if (!name || !name.trim()) {
      return { error: "Name is required" };
    }

    const description = (formData.get("description") as string) || null;
    const privacy = (formData.get("privacy") as WishlistPrivacy) || "friends";

    if (!["friends", "selected_friends", "private"].includes(privacy)) {
      return { error: "Invalid privacy setting" };
    }

    const { data, error } = await supabase
      .from("wishlists")
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        privacy,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    return { data };
  } catch {
    return { error: "Not authenticated" };
  }
}

export async function updateWishlist(id: string, formData: FormData) {
  try {
    const { supabase, user } = await requireAuth();

    // Verify ownership
    const verification = await verifyWishlistOwnership(supabase, user.id, id);
    if ("error" in verification) {
      return verification;
    }

    const name = formData.get("name") as string;
    if (!name || !name.trim()) {
      return { error: "Name is required" };
    }

    const description = (formData.get("description") as string) || null;
    const privacy = (formData.get("privacy") as WishlistPrivacy) || "friends";

    if (!["friends", "selected_friends", "private"].includes(privacy)) {
      return { error: "Invalid privacy setting" };
    }

    const { error } = await supabase
      .from("wishlists")
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        privacy,
      })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/wishlists/${id}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Not authenticated" };
  }
}

export async function deleteWishlist(id: string) {
  try {
    const { supabase, user } = await requireAuth();

    // Verify ownership
    const verification = await verifyWishlistOwnership(supabase, user.id, id);
    if ("error" in verification) {
      return verification;
    }

    const { error } = await supabase.from("wishlists").delete().eq("id", id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Not authenticated" };
  }
}

export async function archiveWishlist(id: string) {
  try {
    const { supabase, user } = await requireAuth();

    // Verify ownership and get wishlist details
    const verification = await verifyWishlistOwnership(supabase, user.id, id, "name, is_archived");
    if ("error" in verification) {
      return verification;
    }

    const { wishlist } = verification;

    if (wishlist.is_archived) {
      return { error: "Wishlist is already archived" };
    }

    // Update wishlist to archived
    // Database trigger will handle claim deletion and notifications
    const { error: updateError } = await supabase
      .from("wishlists")
      .update({ is_archived: true })
      .eq("id", id);

    if (updateError) {
      console.error("Error archiving wishlist:", updateError);
      return { error: "Failed to archive wishlist" };
    }

    // Revalidate relevant paths
    revalidatePath("/wishlists", "layout");
    revalidatePath(`/wishlists/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Unexpected error archiving wishlist:", error);
    return { error: "Not authenticated" };
  }
}

export async function unarchiveWishlist(id: string) {
  try {
    const { supabase, user } = await requireAuth();

    // Verify ownership and get wishlist details
    const verification = await verifyWishlistOwnership(supabase, user.id, id, "is_archived");
    if ("error" in verification) {
      return verification;
    }

    const { wishlist } = verification;

    if (!wishlist.is_archived) {
      return { error: "Wishlist is not archived" };
    }

    // Update wishlist to active
    const { error: updateError } = await supabase
      .from("wishlists")
      .update({ is_archived: false })
      .eq("id", id);

    if (updateError) {
      console.error("Error unarchiving wishlist:", updateError);
      return { error: "Failed to unarchive wishlist" };
    }

    // Revalidate relevant paths
    revalidatePath("/wishlists", "layout");
    revalidatePath(`/wishlists/${id}`);

    return { success: true };
  } catch (error) {
    console.error("Unexpected error unarchiving wishlist:", error);
    return { error: "Not authenticated" };
  }
}
