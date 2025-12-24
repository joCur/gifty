"use server";

import { createClient } from "@/lib/supabase/server";
import { extractItemCount } from "@/lib/utils";
import type { DashboardStats } from "@/lib/types/feed";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      total_wishlists: 0,
      total_items: 0,
      friends_count: 0,
      claimed_items_count: 0,
    };
  }

  // Parallel queries for performance
  const [wishlistsResult, friendsResult, claimsResult] = await Promise.all([
    // Get wishlists with item counts
    supabase
      .from("wishlists")
      .select("id, items:wishlist_items(count)")
      .eq("user_id", user.id),

    // Count friends
    supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),

    // Count claimed items
    supabase
      .from("item_claims")
      .select("id", { count: "exact", head: true })
      .eq("claimed_by", user.id),
  ]);

  const total_wishlists = wishlistsResult.data?.length || 0;
  const total_items =
    wishlistsResult.data?.reduce(
      (sum, w) => sum + extractItemCount(w.items),
      0
    ) || 0;

  return {
    total_wishlists,
    total_items,
    friends_count: friendsResult.count || 0,
    claimed_items_count: claimsResult.count || 0,
  };
}
