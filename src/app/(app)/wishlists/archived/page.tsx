import Link from "next/link";
import { ArrowLeft, Archive, Gift, ChevronRight, Lock, Users, UserCheck } from "lucide-react";
import { getMyWishlists } from "@/lib/actions/wishlists";
import { UnarchiveButton } from "@/components/wishlists/unarchive-button";
import type { WishlistPrivacy } from "@/lib/supabase/types.custom";

const privacyConfig: Record<WishlistPrivacy, { icon: React.ReactNode; label: string; color: string }> = {
  private: {
    icon: <Lock className="w-3 h-3" />,
    label: "Private",
    color: "bg-muted text-muted-foreground",
  },
  friends: {
    icon: <Users className="w-3 h-3" />,
    label: "All Friends",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  selected_friends: {
    icon: <UserCheck className="w-3 h-3" />,
    label: "Selected",
    color: "bg-blue-500/10 text-blue-600",
  },
  // Legacy value - behaves same as 'friends'
  public: {
    icon: <Users className="w-3 h-3" />,
    label: "All Friends",
    color: "bg-emerald-500/10 text-emerald-600",
  },
};

export default async function ArchivedWishlistsPage() {
  const wishlists = await getMyWishlists(true);

  return (
    <div className="space-y-8">
      {/* Back navigation */}
      <Link
        href="/wishlists"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to active wishlists
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 flex items-center justify-center">
            <Archive className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-bold">
              Archived Wishlists
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {wishlists.length} archived {wishlists.length === 1 ? "wishlist" : "wishlists"}
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Archive className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 text-sm">
            <p className="text-amber-900 dark:text-amber-100">
              Archived wishlists are hidden from friends and cannot be edited. Unarchive them to make them visible and editable again.
            </p>
          </div>
        </div>
      </div>

      {/* Wishlists Grid */}
      {wishlists.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <Archive className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-[family-name:var(--font-outfit)] text-xl sm:text-2xl font-semibold mb-3">
              No archived wishlists
            </h3>
            <p className="text-muted-foreground mb-6">
              Wishlists you archive will appear here. They'll be hidden from friends until you unarchive them.
            </p>
            <Link
              href="/wishlists"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to active wishlists
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlists.map((wishlist) => {
            const itemCount =
              (wishlist.items as unknown as { count: number }[])?.[0]?.count || 0;
            const privacy = privacyConfig[wishlist.privacy];

            return (
              <div key={wishlist.id} className="relative group">
                <Link href={`/wishlists/${wishlist.id}`}>
                  <div className="h-full bg-card/60 border border-border/50 rounded-2xl p-5 hover:shadow-lg hover:shadow-muted/10 transition-all duration-200 hover:-translate-y-0.5 opacity-75 hover:opacity-90">
                    {/* Archived overlay effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5" />

                    <div className="relative flex flex-col h-full">
                      {/* Top row: Icon and privacy badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <Gift className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${privacy.color}`}>
                            {privacy.icon}
                            {privacy.label}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-700 dark:text-amber-400">
                            <Archive className="w-3 h-3" />
                            Archived
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 text-muted-foreground group-hover:text-foreground transition-colors">
                          {wishlist.name}
                        </h3>
                        {wishlist.description && (
                          <p className="text-sm text-muted-foreground/70 line-clamp-2 mb-3">
                            {wishlist.description}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                        <p className="text-sm text-muted-foreground">
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Unarchive button overlay */}
                <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UnarchiveButton wishlistId={wishlist.id} wishlistName={wishlist.name} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
