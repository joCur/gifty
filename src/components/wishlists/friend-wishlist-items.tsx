"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Check, Gift, Loader2, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { claimItem, unclaimItem } from "@/lib/actions/claims";
import { toast } from "sonner";
import type { WishlistItem } from "@/lib/supabase/types";

interface Claim {
  id: string;
  item_id: string;
  claimed_by: string;
  claimer: { id: string; display_name: string | null } | null;
}

interface FriendWishlistItemsProps {
  items: WishlistItem[];
  wishlistId: string;
  claimsMap: Map<string, Claim>;
  currentUserId: string | undefined;
}

export function FriendWishlistItems({
  items,
  wishlistId,
  claimsMap,
  currentUserId,
}: FriendWishlistItemsProps) {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [localClaims, setLocalClaims] = useState(claimsMap);

  async function handleClaim(itemId: string) {
    if (!currentUserId) return;

    setLoadingItemId(itemId);
    const result = await claimItem(itemId, wishlistId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Item claimed! Others can see you're getting this.");
      setLocalClaims((prev) => {
        const newMap = new Map(prev);
        newMap.set(itemId, {
          id: "temp",
          item_id: itemId,
          claimed_by: currentUserId,
          claimer: { id: currentUserId, display_name: "You" },
        });
        return newMap;
      });
    }
    setLoadingItemId(null);
  }

  async function handleUnclaim(itemId: string) {
    setLoadingItemId(itemId);
    const result = await unclaimItem(itemId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Item unclaimed");
      setLocalClaims((prev) => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });
    }
    setLoadingItemId(null);
  }

  if (items.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12 lg:p-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-[family-name:var(--font-outfit)] text-xl sm:text-2xl font-semibold mb-3">
            No items yet
          </h3>
          <p className="text-muted-foreground">
            This wishlist is empty. Check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hint banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          Claim items you plan to buy so others know not to get them. The wishlist owner won&apos;t see who claimed what!
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const claim = localClaims.get(item.id);
          const isClaimedByMe = claim?.claimed_by === currentUserId;
          const isClaimedByOther = claim && !isClaimedByMe;
          const isLoading = loadingItemId === item.id;

          return (
            <div
              key={item.id}
              className={`group relative h-full bg-card border rounded-2xl overflow-hidden transition-all duration-200 ${
                isClaimedByMe
                  ? "border-emerald-500/50 shadow-md shadow-emerald-500/10"
                  : isClaimedByOther
                  ? "border-border/50 opacity-60"
                  : "border-border/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              }`}
            >
              {/* Hover gradient overlay */}
              {!isClaimedByOther && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
              )}

              {/* Image */}
              <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className={`object-cover transition-transform duration-300 ${
                      !isClaimedByOther ? "group-hover:scale-105" : ""
                    }`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}

                {/* Claimed overlay */}
                {isClaimedByMe && (
                  <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}

                {/* Other's claimed overlay */}
                {isClaimedByOther && (
                  <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
                    <div className="px-3 py-1.5 rounded-full bg-muted/90 text-sm font-medium">
                      Already claimed
                    </div>
                  </div>
                )}

                {/* Price badge */}
                {item.price && (
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-background/90 backdrop-blur-sm text-sm font-medium shadow-sm">
                    {item.currency && item.currency} {item.price}
                  </div>
                )}

                {/* External link button */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm shadow-sm hover:bg-background"
                    asChild
                  >
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-4">
                <h3 className={`font-semibold line-clamp-2 ${
                  !isClaimedByOther ? "group-hover:text-primary transition-colors" : ""
                }`}>
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5">
                    {item.description}
                  </p>
                )}

                {/* Claim status and button */}
                <div className="mt-3 pt-3 border-t border-border/50">
                  {isClaimedByMe ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <Check className="w-3 h-3" />
                        You&apos;re getting this
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnclaim(item.id)}
                        disabled={isLoading}
                        className="h-8"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Unclaim"
                        )}
                      </Button>
                    </div>
                  ) : isClaimedByOther ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Check className="w-3 h-3" />
                      {claim.claimer?.display_name || "Someone"} is getting this
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleClaim(item.id)}
                      disabled={isLoading}
                      className="w-full h-8 shadow-sm shadow-primary/20"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "I'll get this"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
