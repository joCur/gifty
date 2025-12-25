import Link from "next/link";
import { Gift, Plus, ChevronRight, Lock, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateWishlistDialog } from "@/components/wishlists/create-wishlist-dialog";
import type { WishlistPreview } from "@/lib/types/feed";
import type { WishlistPrivacy } from "@/lib/supabase/types.custom";

interface MyWishlistsPreviewProps {
  wishlists: WishlistPreview[];
}

const privacyConfig: Record<
  WishlistPrivacy,
  { icon: React.ReactNode; label: string }
> = {
  private: {
    icon: <Lock className="w-3 h-3" />,
    label: "Private",
  },
  friends: {
    icon: <Users className="w-3 h-3" />,
    label: "Friends",
  },
  selected_friends: {
    icon: <UserCheck className="w-3 h-3" />,
    label: "Selected",
  },
  public: {
    icon: <Users className="w-3 h-3" />,
    label: "Friends",
  },
};

export function MyWishlistsPreview({ wishlists }: MyWishlistsPreviewProps) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
            My Wishlists
          </h2>
        </div>
        <Link href="/wishlists">
          <Button variant="ghost" size="sm" className="rounded-xl text-xs">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {wishlists.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-4">
            You haven&apos;t created any wishlists yet
          </p>
          <CreateWishlistDialog>
            <Button size="sm" className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Create Wishlist
            </Button>
          </CreateWishlistDialog>
        </div>
      ) : (
        <div className="space-y-2">
          {wishlists.map((wishlist) => {
            const privacy = privacyConfig[wishlist.privacy as WishlistPrivacy];

            return (
              <Link
                key={wishlist.id}
                href={`/wishlists/${wishlist.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {wishlist.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{wishlist.item_count} items</span>
                      <span className="inline-flex items-center gap-1">
                        {privacy?.icon}
                        {privacy?.label}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
