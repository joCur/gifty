"use client";

import { useState, useTransition } from "react";
import { Users, X, UserPlus, Crown, LogOut, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { removeCollaborator, leaveJointWishlist } from "@/lib/actions/collaborators";
import { AddCollaboratorDialog } from "./add-collaborator-dialog";
import { toast } from "sonner";
import type { CollaboratorWithProfile, Profile } from "@/lib/supabase/types.custom";

interface CollaboratorsSheetProps {
  wishlistId: string;
  wishlistName: string;
  owner: Pick<Profile, "id" | "display_name" | "avatar_url"> | null;
  collaborators: CollaboratorWithProfile[];
  currentUserId: string;
  isPrimaryOwner: boolean;
  isArchived: boolean;
  children?: React.ReactNode;
}

export function CollaboratorsSheet({
  wishlistId,
  wishlistName,
  owner,
  collaborators,
  currentUserId,
  isPrimaryOwner,
  isArchived,
  children,
}: CollaboratorsSheetProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (collaboratorUserId: string) => {
    setRemovingId(collaboratorUserId);
    startTransition(async () => {
      const result = await removeCollaborator(wishlistId, collaboratorUserId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Collaborator removed");
      }
      setRemovingId(null);
    });
  };

  const handleLeave = async () => {
    startTransition(async () => {
      const result = await leaveJointWishlist(wishlistId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("You left the wishlist");
        setOpen(false);
      }
    });
  };

  const totalCoOwners = 1 + collaborators.length;
  const existingCollaboratorIds = [
    ...(owner?.id ? [owner.id] : []),
    ...collaborators.map((c) => c.user_id),
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="rounded-xl">
            <Users className="w-4 h-4 mr-2" />
            {totalCoOwners} Co-owner{totalCoOwners !== 1 ? "s" : ""}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-[family-name:var(--font-outfit)]">
            Co-owners
          </SheetTitle>
          <SheetDescription>
            People who can add and edit items in &quot;{wishlistName}&quot;
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* Primary Owner */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Primary Owner
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Avatar>
                <AvatarImage src={owner?.avatar_url || undefined} />
                <AvatarFallback>
                  {getInitials(owner?.display_name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {owner?.display_name || "Unknown"}
                  {owner?.id === currentUserId && (
                    <span className="text-muted-foreground"> (You)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Can manage all aspects
                </p>
              </div>
              <Crown className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
          </div>

          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Collaborators ({collaborators.length})
              </h3>
              <div className="space-y-2">
                {collaborators.map((collab) => {
                  const isSelf = collab.user_id === currentUserId;
                  const canRemove = isPrimaryOwner && !isArchived;
                  const isRemoving = removingId === collab.user_id;

                  return (
                    <div
                      key={collab.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
                    >
                      <Avatar>
                        <AvatarImage
                          src={collab.user?.avatar_url || undefined}
                        />
                        <AvatarFallback>
                          {getInitials(collab.user?.display_name || "User")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {collab.user?.display_name || "Unknown"}
                          {isSelf && (
                            <span className="text-muted-foreground"> (You)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Can add & edit items
                        </p>
                      </div>
                      {canRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(collab.user_id)}
                          disabled={isPending || isRemoving}
                          className="shrink-0"
                        >
                          {isRemoving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Button (Primary owner only) */}
          {isPrimaryOwner && !isArchived && (
            <AddCollaboratorDialog
              wishlistId={wishlistId}
              existingCollaboratorIds={existingCollaboratorIds}
            >
              <Button className="w-full rounded-xl" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Collaborator
              </Button>
            </AddCollaboratorDialog>
          )}

          {/* Leave Button (Collaborators only) */}
          {!isPrimaryOwner && (
            <div className="pt-4 border-t border-border/50">
              <Button
                className="w-full rounded-xl"
                variant="outline"
                onClick={handleLeave}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Wishlist
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Items you added will stay in the wishlist
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
