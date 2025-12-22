"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Trash2, Check, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteItem, markItemPurchased } from "@/lib/actions/items";
import { toast } from "sonner";
import type { WishlistItem } from "@/lib/supabase/types";

interface WishlistItemCardProps {
  item: WishlistItem;
  wishlistId: string;
  isOwner: boolean;
  showClaimStatus?: boolean;
  isClaimed?: boolean;
  onClaim?: () => void;
  onUnclaim?: () => void;
}

export function WishlistItemCard({
  item,
  wishlistId,
  isOwner,
  showClaimStatus = false,
  isClaimed = false,
  onClaim,
  onUnclaim,
}: WishlistItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteItem(item.id, wishlistId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Item removed");
    }
    setIsDeleting(false);
  }

  async function handleTogglePurchased() {
    const result = await markItemPurchased(item.id, wishlistId, !item.is_purchased);
    if (result.error) {
      toast.error(result.error);
    }
  }

  return (
    <Card className={item.is_purchased ? "opacity-60" : ""}>
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
                <h3
                  className={`font-medium truncate ${
                    item.is_purchased ? "line-through" : ""
                  }`}
                >
                  {item.title}
                </h3>
                {item.price && (
                  <p className="text-sm text-muted-foreground">
                    {item.currency && item.currency}{" "}
                    {item.price}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                >
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isDeleting}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleTogglePurchased}>
                        <Check className="w-4 h-4 mr-2" />
                        {item.is_purchased ? "Mark as not purchased" : "Mark as purchased"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {!isOwner && showClaimStatus && (
                  <Button
                    variant={isClaimed ? "secondary" : "outline"}
                    size="sm"
                    onClick={isClaimed ? onUnclaim : onClaim}
                    className="ml-2"
                  >
                    {isClaimed ? "Unclaim" : "I'll get this"}
                  </Button>
                )}
              </div>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {item.description}
              </p>
            )}
            {item.notes && isOwner && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                Note: {item.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
