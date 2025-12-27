"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Package, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClaimStatusBadge } from "@/components/claims/claim-status-badge";
import { useClaimHistory } from "@/lib/queries/hooks";

export function RecentClaimsSection() {
  // Share the same cache as full history page for consistency
  const { data: history, isLoading } = useClaimHistory();

  // Flatten periods and take only the 5 most recent claims for dashboard
  const recentClaims = history?.periods.flatMap((p) => p.claims).slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-500/5 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
            Recent Claims
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (recentClaims.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-500/5 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
            Recent Claims
          </h2>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          You haven&apos;t claimed any gifts yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-500/5 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
              Recent Claims
            </h2>
            <p className="text-xs text-muted-foreground">
              Your latest claimed gifts
            </p>
          </div>
        </div>
        <Link href="/claims-history">
          <Button variant="ghost" size="sm" className="text-xs gap-1.5">
            <History className="w-3.5 h-3.5" />
            View all
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {recentClaims.map((claim) => {
          const imageUrl = claim.item.custom_image_url || claim.item.image_url;
          return (
            <div
              key={claim.id}
              className="relative flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group border border-border/50"
            >
              <Link
                href={`/friends/${claim.friend.id}/wishlists/${claim.item.wishlist_id}`}
                className="absolute inset-0 z-0"
              />

              {/* Item Image */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={claim.item.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {claim.item.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      For {claim.friend.display_name || "Friend"}
                    </p>
                  </div>
                  <ClaimStatusBadge
                    status={claim.status}
                    type={claim.type}
                    splitStatus={claim.type === "split" ? claim.split_status : undefined}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
