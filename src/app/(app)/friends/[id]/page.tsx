import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gift, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFriendProfile, getFriendWishlists } from "@/lib/actions/friends";
import { format } from "date-fns";

export default async function FriendPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile, wishlists] = await Promise.all([
    getFriendProfile(id),
    getFriendWishlists(id),
  ]);

  if (!profile) {
    notFound();
  }

  const initials = profile.display_name
    ? profile.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/friends">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">
              {profile.display_name || "Unknown"}
            </h1>
            {profile.birthday && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Birthday: {format(new Date(profile.birthday), "MMMM d")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Wishlists</h2>

        {wishlists.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Gift className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No wishlists</h3>
              <p className="text-muted-foreground text-sm">
                {profile.display_name || "This user"} hasn&apos;t created any
                public wishlists yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {wishlists.map((wishlist) => {
              const itemCount =
                (wishlist.items as unknown as { count: number }[])?.[0]?.count || 0;
              return (
                <Link
                  key={wishlist.id}
                  href={`/friends/${id}/wishlists/${wishlist.id}`}
                >
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{wishlist.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {wishlist.description && (
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                          {wishlist.description}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
