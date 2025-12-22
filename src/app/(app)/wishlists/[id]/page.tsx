import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getWishlist } from "@/lib/actions/wishlists";
import { getUser } from "@/lib/supabase/auth";
import { WishlistItemCard } from "@/components/wishlists/wishlist-item-card";
import { AddItemSheet } from "@/components/wishlists/add-item-sheet";
import { WishlistSettingsSheet } from "@/components/wishlists/wishlist-settings-sheet";
import { Lock, Users, Globe } from "lucide-react";
import type { WishlistPrivacy } from "@/lib/supabase/types";

const privacyConfig: Record<
  WishlistPrivacy,
  { icon: React.ReactNode; label: string }
> = {
  private: { icon: <Lock className="w-3 h-3" />, label: "Private" },
  friends: { icon: <Users className="w-3 h-3" />, label: "Friends" },
  public: { icon: <Globe className="w-3 h-3" />, label: "All friends" },
};

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [wishlist, user] = await Promise.all([getWishlist(id), getUser()]);

  if (!wishlist) {
    notFound();
  }

  const isOwner = user?.id === wishlist.user_id;
  const items = wishlist.items || [];
  const privacy = privacyConfig[wishlist.privacy];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold truncate">{wishlist.name}</h1>
            {isOwner && (
              <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                {privacy.icon}
                {privacy.label}
              </Badge>
            )}
          </div>
          {wishlist.description && (
            <p className="text-muted-foreground text-sm truncate">
              {wishlist.description}
            </p>
          )}
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <AddItemSheet wishlistId={wishlist.id}>
              <Button size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </AddItemSheet>
            <WishlistSettingsSheet wishlist={wishlist}>
              <Button size="icon" variant="outline">
                <Settings className="w-4 h-4" />
              </Button>
            </WishlistSettingsSheet>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No items yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {isOwner
              ? "Add items by pasting a link to something you want."
              : "This wishlist is empty."}
          </p>
          {isOwner && (
            <AddItemSheet wishlistId={wishlist.id}>
              <Button>Add your first item</Button>
            </AddItemSheet>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              wishlistId={wishlist.id}
              isOwner={isOwner}
            />
          ))}
        </div>
      )}
    </div>
  );
}
