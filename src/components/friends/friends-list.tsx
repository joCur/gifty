"use client";

import Link from "next/link";
import { Users, Gift, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isAfter, isBefore, addDays } from "date-fns";

interface Friend {
  friendshipId: string;
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  birthday: string | null;
}

export function FriendsList({ friends }: { friends: Friend[] }) {
  if (friends.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No friends yet</h3>
          <p className="text-muted-foreground text-sm">
            Add friends to see their wishlists and coordinate gifts.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort friends: upcoming birthdays first, then alphabetically
  const sortedFriends = [...friends].sort((a, b) => {
    const today = new Date();
    const soon = addDays(today, 30);

    const aHasUpcomingBirthday =
      a.birthday &&
      (() => {
        const bd = new Date(a.birthday);
        bd.setFullYear(today.getFullYear());
        if (isBefore(bd, today)) bd.setFullYear(today.getFullYear() + 1);
        return isBefore(bd, soon);
      })();

    const bHasUpcomingBirthday =
      b.birthday &&
      (() => {
        const bd = new Date(b.birthday);
        bd.setFullYear(today.getFullYear());
        if (isBefore(bd, today)) bd.setFullYear(today.getFullYear() + 1);
        return isBefore(bd, soon);
      })();

    if (aHasUpcomingBirthday && !bHasUpcomingBirthday) return -1;
    if (!aHasUpcomingBirthday && bHasUpcomingBirthday) return 1;

    return (a.display_name || "").localeCompare(b.display_name || "");
  });

  return (
    <div className="space-y-2">
      {sortedFriends.map((friend) => {
        const initials = friend.display_name
          ? friend.display_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "?";

        const hasUpcomingBirthday =
          friend.birthday &&
          (() => {
            const today = new Date();
            const soon = addDays(today, 30);
            const bd = new Date(friend.birthday);
            bd.setFullYear(today.getFullYear());
            if (isBefore(bd, today)) bd.setFullYear(today.getFullYear() + 1);
            return isAfter(bd, today) && isBefore(bd, soon);
          })();

        return (
          <Link key={friend.id} href={`/friends/${friend.id}`}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={friend.avatar_url || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {friend.display_name || "Unknown"}
                    </span>
                    {hasUpcomingBirthday && (
                      <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        <Calendar className="w-3 h-3" />
                        Birthday soon!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Gift className="w-3 h-3" />
                    <span>View wishlists</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
