"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArchiveRestore, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { unarchiveWishlist } from "@/lib/actions/wishlists";
import { toast } from "sonner";

interface UnarchiveButtonProps {
  wishlistId: string;
  wishlistName: string;
}

export function UnarchiveButton({ wishlistId, wishlistName }: UnarchiveButtonProps) {
  const [isUnarchiving, setIsUnarchiving] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleUnarchive() {
    setIsUnarchiving(true);

    try {
      const result = await unarchiveWishlist(wishlistId);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Wishlist unarchived successfully");
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to unarchive wishlist");
      console.error("Error unarchiving wishlist:", error);
    } finally {
      setIsUnarchiving(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg shadow-sm bg-background/95 backdrop-blur"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ArchiveRestore className="w-3.5 h-3.5 mr-1.5" />
          Unarchive
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Unarchive wishlist?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to unarchive <strong>{wishlistName}</strong>?
            </p>
            <p>
              This will make the wishlist visible to friends again based on your privacy settings. You'll also be able to edit items.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUnarchiving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleUnarchive();
            }}
            disabled={isUnarchiving}
            className="bg-primary hover:bg-primary/90"
          >
            {isUnarchiving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Unarchiving...
              </>
            ) : (
              <>
                <ArchiveRestore className="w-4 h-4 mr-2" />
                Unarchive
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
