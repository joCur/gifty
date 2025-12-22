"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Check, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Gift className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No items yet</h3>
          <p className="text-muted-foreground text-sm">
            This wishlist is empty.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Claim items you plan to buy so others know not to get them.
      </p>

      <div className="grid gap-4">
        {items.map((item) => {
          const claim = localClaims.get(item.id);
          const isClaimedByMe = claim?.claimed_by === currentUserId;
          const isClaimedByOther = claim && !isClaimedByMe;
          const isLoading = loadingItemId === item.id;

          return (
            <Card
              key={item.id}
              className={
                isClaimedByOther
                  ? "opacity-60"
                  : isClaimedByMe
                  ? "ring-2 ring-green-500/50"
                  : ""
              }
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.image_url && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        {item.price && (
                          <p className="text-sm text-muted-foreground">
                            {item.currency} {item.price}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        asChild
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>

                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {claim ? (
                        <Badge
                          variant={isClaimedByMe ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          {isClaimedByMe
                            ? "You're getting this"
                            : `${claim.claimer?.display_name || "Someone"} is getting this`}
                        </Badge>
                      ) : (
                        <span />
                      )}

                      {!isClaimedByOther && (
                        <Button
                          size="sm"
                          variant={isClaimedByMe ? "outline" : "default"}
                          onClick={() =>
                            isClaimedByMe
                              ? handleUnclaim(item.id)
                              : handleClaim(item.id)
                          }
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isClaimedByMe ? (
                            "Unclaim"
                          ) : (
                            "I'll get this"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
