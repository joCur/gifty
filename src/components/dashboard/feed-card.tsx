"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Gift,
  Package,
  Loader2,
  Users,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { claimItem, unclaimItem } from "@/lib/actions/claims";
import { toast } from "sonner";
import type { FriendItemActivity } from "@/lib/types/feed";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/keys";

interface FeedCardProps {
  item: FriendItemActivity;
}

export function FeedCard({ item }: FeedCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticClaimed, setOptimisticClaimed] = useState<boolean | null>(
    null
  );
  const queryClient = useQueryClient();

  const isClaimed =
    optimisticClaimed !== null ? optimisticClaimed : item.claimed_by_me;
  const wishlistUrl = `/friends/${item.friend.id}/wishlists/${item.wishlist.id}`;
  const imageUrl = item.item.custom_image_url || item.item.image_url;

  async function handleClaim(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setOptimisticClaimed(true);

    const result = await claimItem(item.item.id, item.wishlist.id);

    if (result.error) {
      toast.error(result.error);
      setOptimisticClaimed(null);
    } else {
      toast.success("Item claimed!");
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.all });
    }
    setIsLoading(false);
  }

  async function handleUnclaim(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setOptimisticClaimed(false);

    const result = await unclaimItem(item.item.id);

    if (result.error) {
      toast.error(result.error);
      setOptimisticClaimed(null);
    } else {
      toast.success("Claim removed");
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.all });
    }
    setIsLoading(false);
  }

  return (
    <div className="group relative flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border/50">
      {/* Background link for the whole row */}
      <Link href={wishlistUrl} className="absolute inset-0 z-0" />

      {/* Item Image */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-muted to-muted/50 ring-1 ring-border/50 group-hover:ring-primary/20 transition-all pointer-events-none">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="56px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-muted-foreground/30" />
          </div>
        )}

        {/* Split claim indicator */}
        {item.has_split_claim && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Users className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Claimed overlay */}
        {item.is_claimed && !item.claimed_by_me && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Check className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 relative pointer-events-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Item title */}
            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
              {item.item.title}
            </p>

            {/* Friend info row */}
            <div className="flex items-center gap-2 mt-1">
              <Link
                href={`/friends/${item.friend.id}`}
                className="flex items-center gap-1.5 group/friend relative z-20 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <UserAvatar
                  avatarUrl={item.friend.avatar_url}
                  displayName={item.friend.display_name}
                  size="xs"
                />
                <span className="text-xs text-muted-foreground group-hover/friend:text-foreground transition-colors truncate max-w-[100px]">
                  {item.friend.display_name || "Friend"}
                </span>
              </Link>

              {item.item.price && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.item.currency} {item.item.price}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action area */}
          <div className="flex items-center gap-2 shrink-0 relative z-20 pointer-events-auto">
            {/* External link */}
            {item.item.url && (
              <a
                href={item.item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Claim button / status */}
            {isClaimed ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleUnclaim}
                disabled={isLoading}
                className="h-8 px-3 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-medium">Claimed</span>
                  </>
                )}
              </Button>
            ) : item.is_claimed ? (
              <span className="text-[10px] text-muted-foreground/70 px-2 py-1 rounded-md bg-muted/50">
                Taken
              </span>
            ) : item.has_split_claim ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 rounded-lg text-xs"
                asChild
              >
                <Link href={wishlistUrl} onClick={(e) => e.stopPropagation()}>
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  Join
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleClaim}
                disabled={isLoading}
                className="h-8 px-3 rounded-lg text-xs shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25 transition-shadow"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Gift className="w-3.5 h-3.5 mr-1.5" />
                    Claim
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chevron indicator */}
      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all shrink-0 pointer-events-none" />
    </div>
  );
}
