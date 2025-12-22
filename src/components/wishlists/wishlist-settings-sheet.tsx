"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWishlist, deleteWishlist } from "@/lib/actions/wishlists";
import { toast } from "sonner";
import { Loader2, Trash2, Lock, Users, Globe, Settings, AlertTriangle } from "lucide-react";
import type { Wishlist, WishlistPrivacy } from "@/lib/supabase/types";

const privacyOptions: {
  value: WishlistPrivacy;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "friends",
    label: "Friends",
    description: "Visible to your friends",
    icon: <Users className="w-4 h-4" />,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  },
  {
    value: "public",
    label: "Public",
    description: "Anyone can view",
    icon: <Globe className="w-4 h-4" />,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  },
  {
    value: "private",
    label: "Private",
    description: "Only you can see",
    icon: <Lock className="w-4 h-4" />,
    color: "bg-muted text-muted-foreground border-border",
  },
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="px-6">
          <DialogTitle className="font-[family-name:var(--font-outfit)] flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Wishlist Settings
          </DialogTitle>
          <DialogDescription>Update your wishlist details and privacy.</DialogDescription>
        </DialogHeader>

        <form action={handleUpdate} className="px-6 pb-6 space-y-5">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={wishlist.name}
              required
              disabled={isUpdating}
              className="h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
            />
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="description"
              name="description"
              defaultValue={wishlist.description || ""}
              placeholder="What's this wishlist for?"
              disabled={isUpdating}
              className="h-11 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
            />
          </div>

          {/* Privacy options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Privacy</Label>
            <div className="grid grid-cols-3 gap-2">
              {privacyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPrivacy(option.value)}
                  disabled={isUpdating}
                  className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    privacy === option.value
                      ? option.color
                      : "border-border/50 hover:border-border"
                  }`}
                >
                  {option.icon}
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {privacyOptions.find((o) => o.value === privacy)?.description}
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isUpdating}
              className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Danger zone */}
        <div className="px-6 pb-6 pt-2 border-t border-border/50">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-destructive text-sm">Delete Wishlist</h4>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                This will permanently remove all items.
              </p>
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded-lg"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
