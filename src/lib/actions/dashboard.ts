"use server";

import { createClient } from "@/lib/supabase/server";
import { extractItemCount } from "@/lib/utils";
import type { BirthdayEvent, WishlistPreview } from "@/lib/types/feed";

export async function getUpcomingBirthdays(
  daysAhead: number = 30
): Promise<BirthdayEvent[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Get all friends with birthdays
  const { data: friendships } = await supabase
    .from("friendships")
    .select(
      `
      id,
      requester_id,
      addressee_id,
      requester:profiles!friendships_requester_id_fkey(id, display_name, avatar_url, birthday),
      addressee:profiles!friendships_addressee_id_fkey(id, display_name, avatar_url, birthday)
    `
    )
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  if (!friendships) return [];

  // Map to friend profiles and filter those with birthdays
  const friends = friendships
    .map((f) => (f.requester_id === user.id ? f.addressee : f.requester))
    .filter((f) => f && f.birthday) as Array<{
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    birthday: string;
  }>;

  // Calculate days until birthday for each friend
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();

  const birthdayEvents: BirthdayEvent[] = friends.map((friend) => {
    const [, month, day] = friend.birthday.split("-").map(Number);
    const birthdayThisYear = new Date(currentYear, month - 1, day);
    birthdayThisYear.setHours(0, 0, 0, 0);

    let nextBirthday = birthdayThisYear;
    if (birthdayThisYear < today) {
      nextBirthday = new Date(currentYear + 1, month - 1, day);
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: `birthday-${friend.id}`,
      type: "birthday" as const,
      timestamp: nextBirthday.toISOString(),
      friend: {
        id: friend.id,
        display_name: friend.display_name,
        avatar_url: friend.avatar_url,
        birthday: friend.birthday,
      },
      days_until: diffDays,
    };
  });

  // Filter to upcoming birthdays and sort by days until
  return birthdayEvents
    .filter((e) => e.days_until >= 0 && e.days_until <= daysAhead)
    .sort((a, b) => a.days_until - b.days_until)
    .slice(0, 5); // Top 5 upcoming
}

export async function getMyWishlistsPreview(): Promise<WishlistPreview[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("wishlists")
    .select(
      `
      id,
      name,
      privacy,
      items:wishlist_items(count)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  if (!data) return [];

  return data.map((wishlist) => ({
    id: wishlist.id,
    name: wishlist.name,
    privacy: wishlist.privacy,
    item_count: extractItemCount(wishlist.items),
  }));
}
