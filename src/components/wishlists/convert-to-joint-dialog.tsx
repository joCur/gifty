"use client";

import { useState, useEffect, useTransition } from "react";
import { Users, Search, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { getInitials } from "@/lib/utils";
import { getAvailableFriendsForCollaboration, convertToJointWishlist } from "@/lib/actions/collaborators";
import { toast } from "sonner";

interface ConvertToJointDialogProps {
  wishlistId: string;
  wishlistName: string;
  children?: React.ReactNode;
}

interface Friend {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function ConvertToJointDialog({
  wishlistId,
  wishlistName,
  children,
}: ConvertToJointDialogProps) {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      getAvailableFriendsForCollaboration(wishlistId).then((result) => {
        if ("data" in result) {
          setFriends(result.data || []);
        }
        setIsLoading(false);
      });
    } else {
      setSearchQuery("");
      setSelectedIds([]);
    }
  }, [open, wishlistId]);

  const filteredFriends = friends.filter(
    (f) =>
      f.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery === ""
  );

  const handleToggle = (friendId: string) => {
    setSelectedIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleConvert = () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one friend");
      return;
    }

    startTransition(async () => {
      const result = await convertToJointWishlist(wishlistId, selectedIds);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Wishlist converted to joint!");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="rounded-xl">
            <Users className="w-4 h-4 mr-2" />
            Make Joint
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-outfit)]">
            Convert to Joint Wishlist
          </DialogTitle>
          <DialogDescription>
            Add friends as co-owners of &quot;{wishlistName}&quot;. They can add and
            edit items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFriends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchQuery ? "No friends found" : "You don't have any friends yet"}
              </p>
            ) : (
              filteredFriends.map((friend) => {
                const isSelected = selectedIds.includes(friend.id);
                return (
                  <div
                    key={friend.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-border bg-card"
                    }`}
                    onClick={() => handleToggle(friend.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(friend.id)}
                      className="pointer-events-none"
                    />
                    <Avatar>
                      <AvatarImage src={friend.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(friend.display_name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {friend.display_name || "Unknown"}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConvert}
            disabled={isPending || selectedIds.length === 0}
            className="rounded-xl"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Add {selectedIds.length} Co-owner{selectedIds.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
