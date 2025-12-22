import Link from "next/link";
import { Plus, Lock, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyWishlists } from "@/lib/actions/wishlists";
import { CreateWishlistDialog } from "@/components/wishlists/create-wishlist-dialog";
import type { WishlistPrivacy } from "@/lib/supabase/types";

const privacyIcons: Record<WishlistPrivacy, React.ReactNode> = {
  private: <Lock className="w-3 h-3" />,
  friends: <Users className="w-3 h-3" />,
  public: <Globe className="w-3 h-3" />,
};

const privacyLabels: Record<WishlistPrivacy, string> = {
  private: "Private",
  friends: "Friends",
  public: "All friends",
};

export default async function DashboardPage() {
  const wishlists = await getMyWishlists();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Wishlists</h1>
        <CreateWishlistDialog>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </CreateWishlistDialog>
      </div>

      {wishlists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No wishlists yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first wishlist to start adding items you&apos;d love to
              receive.
            </p>
            <CreateWishlistDialog>
              <Button>Create your first wishlist</Button>
            </CreateWishlistDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {wishlists.map((wishlist) => {
            const itemCount =
              (wishlist.items as unknown as { count: number }[])?.[0]?.count || 0;
            return (
              <Link key={wishlist.id} href={`/wishlists/${wishlist.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{wishlist.name}</CardTitle>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {privacyIcons[wishlist.privacy]}
                        {privacyLabels[wishlist.privacy]}
                      </Badge>
                    </div>
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
  );
}
