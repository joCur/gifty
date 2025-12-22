import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getWishlist } from "@/lib/actions/wishlists";
import { getItemClaims } from "@/lib/actions/claims";
import { getUser } from "@/lib/supabase/auth";
import { FriendWishlistItems } from "@/components/wishlists/friend-wishlist-items";

export default async function FriendWishlistPage({
  params,
}: {
  params: Promise<{ id: string; wishlistId: string }>;
}) {
  const { id: friendId, wishlistId } = await params;
  const [wishlist, user, claims] = await Promise.all([
    getWishlist(wishlistId),
    getUser(),
    getItemClaims(wishlistId),
  ]);

  if (!wishlist || wishlist.user_id !== friendId) {
    notFound();
  }

  const owner = wishlist.owner as {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };

  const initials = owner.display_name
    ? owner.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const items = wishlist.items || [];
  const currentUserId = user?.id;

  // Map claims to items
  const claimsMap = new Map(claims.map((c) => [c.item_id, c]));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/friends/${friendId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={owner.avatar_url || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{wishlist.name}</h1>
            <p className="text-sm text-muted-foreground truncate">
              {owner.display_name}&apos;s wishlist
            </p>
          </div>
        </div>
      </div>

      {wishlist.description && (
        <p className="text-muted-foreground">{wishlist.description}</p>
      )}

      <FriendWishlistItems
        items={items}
        wishlistId={wishlistId}
        claimsMap={claimsMap}
        currentUserId={currentUserId}
      />
    </div>
  );
}
