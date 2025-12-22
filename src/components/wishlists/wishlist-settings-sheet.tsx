"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateWishlist, deleteWishlist } from "@/lib/actions/wishlists";
import { toast } from "sonner";
import { Loader2, Trash2, Lock, Users, Globe } from "lucide-react";
import type { Wishlist, WishlistPrivacy } from "@/lib/supabase/types";

const privacyOptions: {
  value: WishlistPrivacy;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "friends", label: "All Friends", icon: <Users className="w-4 h-4" /> },
  { value: "public", label: "Public", icon: <Globe className="w-4 h-4" /> },
  { value: "private", label: "Private", icon: <Lock className="w-4 h-4" /> },
];

export function WishlistSettingsSheet({
  wishlist,
  children,
}: {
  wishlist: Wishlist;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [privacy, setPrivacy] = useState<WishlistPrivacy>(wishlist.privacy);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  async function handleUpdate(formData: FormData) {
    setIsUpdating(true);
    formData.set("privacy", privacy);

    const result = await updateWishlist(wishlist.id, formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Wishlist updated");
      setOpen(false);
    }
    setIsUpdating(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteWishlist(wishlist.id);

    if (result.error) {
      toast.error(result.error);
      setIsDeleting(false);
    } else {
      toast.success("Wishlist deleted");
      router.push("/dashboard");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] sm:h-auto">
        <SheetHeader>
          <SheetTitle>Wishlist Settings</SheetTitle>
          <SheetDescription>Update your wishlist details.</SheetDescription>
        </SheetHeader>

        <form action={handleUpdate} className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={wishlist.name}
              required
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              defaultValue={wishlist.description || ""}
              placeholder="Optional description"
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label>Privacy</Label>
            <div className="flex gap-2">
              {privacyOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={privacy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPrivacy(option.value)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <SheetFooter>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </SheetFooter>
        </form>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting this wishlist will remove all items permanently.
            </p>
            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Wishlist
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Yes, Delete"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
