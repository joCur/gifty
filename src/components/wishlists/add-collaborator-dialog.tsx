"use client";

import { useState, useEffect, useTransition } from "react";
import { UserPlus, Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { getAvailableFriendsForCollaboration, addCollaborator } from "@/lib/actions/collaborators";
import { toast } from "sonner";

interface AddCollaboratorDialogProps {
  wishlistId: string;
  existingCollaboratorIds: string[];
  children: React.ReactNode;
}

interface Friend {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function AddCollaboratorDialog({
  wishlistId,
  existingCollaboratorIds,
  children,
}: AddCollaboratorDialogProps) {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [addingId, setAddingId] = useState<string | null>(null);

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
    }
  }, [open, wishlistId]);

  const filteredFriends = friends.filter(
    (f) =>
      !existingCollaboratorIds.includes(f.id) &&
      (f.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery === "")
  );

  const handleAdd = async (friendId: string) => {
    setAddingId(friendId);

    startTransition(async () => {
      const result = await addCollaborator(wishlistId, friendId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Collaborator added!");
        // Remove the friend from the local list
        setFriends((prev) => prev.filter((f) => f.id !== friendId));
      }

      setAddingId(null);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-outfit)]">
            Add Collaborator
          </DialogTitle>
          <DialogDescription>
            Choose a friend to add as a co-owner. They can add and edit items.
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
                {searchQuery
                  ? "No friends found"
                  : friends.length === 0
                  ? "You don't have any friends who can be added"
                  : "All your friends are already collaborators"}
              </p>
            ) : (
              filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors"
                >
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
                  <Button
                    size="sm"
                    onClick={() => handleAdd(friend.id)}
                    disabled={isPending || addingId === friend.id}
                    className="rounded-lg shrink-0"
                  >
                    {addingId === friend.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
