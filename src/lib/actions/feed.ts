"use server";

import { createClient } from "@/lib/supabase/server";
import type { FeedResponse, FriendItemActivity } from "@/lib/types/feed";

const ITEMS_PER_PAGE = 12;

export async function getFriendActivityFeed(
  cursor?: string,
  limit: number = ITEMS_PER_PAGE
): Promise<FeedResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { items: [], next_cursor: null, has_more: false };
  }

  // Get all friend IDs
  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  if (!friendships || friendships.length === 0) {
    return { items: [], next_cursor: null, has_more: false };
  }

  const friendIds = friendships.map((f) =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  );

  // Get wishlists where user is in the selected_friends list
  const { data: selectedFriendsAccess } = await supabase
    .from("wishlist_selected_friends")
    .select("wishlist_id")
    .eq("friend_id", user.id);

  const accessibleSelectedWishlistIds =
    selectedFriendsAccess?.map((sf) => sf.wishlist_id) || [];

  // Step 1: Get accessible wishlist IDs from friends
  // Filter by: friend ownership, not archived, and privacy settings
  const { data: accessibleWishlists } = await supabase
    .from("wishlists")
    .select("id, name, user_id")
    .in("user_id", friendIds)
    .eq("is_archived", false)
    .or(
      accessibleSelectedWishlistIds.length > 0
        ? `privacy.in.(friends,public),and(privacy.eq.selected_friends,id.in.(${accessibleSelectedWishlistIds.join(",")}))`
        : "privacy.in.(friends,public)"
    );

  if (!accessibleWishlists || accessibleWishlists.length === 0) {
    return { items: [], next_cursor: null, has_more: false };
  }

  const accessibleWishlistIds = accessibleWishlists.map((w) => w.id);
  const wishlistsMap = new Map(accessibleWishlists.map((w) => [w.id, w]));

  // Step 2: Query items from those wishlists
  let query = supabase
    .from("wishlist_items")
    .select(
      `
      id,
      title,
      description,
      image_url,
      custom_image_url,
      price,
      currency,
      url,
      created_at,
      wishlist_id
    `
    )
    .in("wishlist_id", accessibleWishlistIds)
    .order("created_at", { ascending: false })
    .limit(limit + 1); // Fetch one extra to determine has_more

  // Cursor-based pagination
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: items } = await query;

  if (!items || items.length === 0) {
    return { items: [], next_cursor: null, has_more: false };
  }

  const has_more = items.length > limit;
  const feedItems = items.slice(0, limit);
  const next_cursor = has_more
    ? feedItems[feedItems.length - 1].created_at
    : null;

  // Prepare IDs for parallel queries
  const itemIds = feedItems.map((item) => item.id);
  const wishlistOwnerIds = [
    ...new Set(
      feedItems
        .map((item) => wishlistsMap.get(item.wishlist_id)?.user_id)
        .filter((id): id is string => typeof id === "string")
    ),
  ];

  // Fetch owner profiles, claims, and split claims in parallel
  const [ownerProfilesResult, claimsResult, splitClaimsResult] = await Promise.all([
    wishlistOwnerIds.length > 0
      ? supabase.from("profiles").select("id, display_name, avatar_url").in("id", wishlistOwnerIds)
      : Promise.resolve({ data: [] }),
    supabase.from("item_claims").select("item_id, claimed_by").in("item_id", itemIds).eq("status", "active"),
    supabase.from("split_claims").select("item_id").in("item_id", itemIds).eq("claim_status", "active"),
  ]);

  const ownersMap = new Map(ownerProfilesResult.data?.map((p) => [p.id, p]) || []);
  const claimsMap = new Map(claimsResult.data?.map((c) => [c.item_id, c]) || []);
  const splitClaimsSet = new Set(splitClaimsResult.data?.map((sc) => sc.item_id) || []);

  // Transform to feed items
  const feedActivityItems: FriendItemActivity[] = feedItems.map((item) => {
    const claim = claimsMap.get(item.id);
    const wishlist = wishlistsMap.get(item.wishlist_id);
    const owner = wishlist ? ownersMap.get(wishlist.user_id) : null;

    return {
      id: item.id,
      type: "friend_item" as const,
      timestamp: item.created_at,
      friend: {
        id: wishlist?.user_id || "",
        display_name: owner?.display_name || null,
        avatar_url: owner?.avatar_url || null,
      },
      item: {
        id: item.id,
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        custom_image_url: item.custom_image_url,
        price: item.price,
        currency: item.currency,
        url: item.url,
      },
      wishlist: {
        id: wishlist?.id || "",
        name: wishlist?.name || "",
      },
      is_claimed: !!claim,
      claimed_by_me: claim?.claimed_by === user.id,
      has_split_claim: splitClaimsSet.has(item.id),
    };
  });

  return {
    items: feedActivityItems,
    next_cursor,
    has_more,
  };
}
