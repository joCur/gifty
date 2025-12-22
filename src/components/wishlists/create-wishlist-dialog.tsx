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
import { createWishlist } from "@/lib/actions/wishlists";
import { toast } from "sonner";
import { Loader2, Lock, Users, Globe } from "lucide-react";
import type { WishlistPrivacy } from "@/lib/supabase/types";

const privacyOptions: {
  value: WishlistPrivacy;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "friends",
    label: "All Friends",
    description: "Visible to all your friends",
    icon: <Users className="w-4 h-4" />,
  },
  {
    value: "public",
    label: "Public",
    description: "Same as friends (all friends can see)",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    value: "private",
    label: "Private",
    description: "Only visible to you",
    icon: <Lock className="w-4 h-4" />,
  },
];

export function CreateWishlistDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [privacy, setPrivacy] = useState<WishlistPrivacy>("friends");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    formData.set("privacy", privacy);

    const result = await createWishlist(formData);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success("Wishlist created!");
    setOpen(false);
    setIsLoading(false);

    if (result.data) {
      router.push(`/wishlists/${result.data.id}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Wishlist</DialogTitle>
            <DialogDescription>
              Create a new wishlist to organize the things you want.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Birthday 2024"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                name="description"
                placeholder="Things I'd love for my birthday"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Privacy</Label>
              <div className="grid gap-2">
                {privacyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPrivacy(option.value)}
                    disabled={isLoading}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      privacy === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`${
                        privacy === option.value
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
