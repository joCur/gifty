import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gift, Calendar, ChevronRight, Sparkles, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  // Generate a consistent gradient based on friend's name
  const gradients = [
    "from-rose-400/20 to-pink-500/10",
    "from-amber-400/20 to-orange-500/10",
    "from-emerald-400/20 to-teal-500/10",
    "from-blue-400/20 to-indigo-500/10",
    "from-purple-400/20 to-violet-500/10",
    "from-cyan-400/20 to-sky-500/10",
  ];
  const gradientIndex = (profile.display_name || "").charCodeAt(0) % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-6">
        {/* Back button */}
        <Link
          href="/friends"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to friends
        </Link>

        {/* Profile card */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Avatar with gradient background */}
          <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center p-1 shrink-0`}>
            <Avatar className="h-full w-full rounded-xl">
              <AvatarImage src={profile.avatar_url || undefined} className="rounded-xl" />
              <AvatarFallback className="rounded-xl bg-transparent text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name and info */}
          <div className="min-w-0 flex-1">
            <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-bold">
              {profile.display_name || "Unknown"}
            </h1>
            {profile.birthday && (
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm">Birthday: {format(new Date(profile.birthday), "MMMM d")}</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {wishlists.length} {wishlists.length === 1 ? "wishlist" : "wishlists"} shared
            </p>
          </div>
        </div>
      </div>

      {/* Wishlists Section */}
      <div className="space-y-6">
        {/* Section header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
              Wishlists
            </h2>
            <p className="text-xs text-muted-foreground">
              Browse and claim items
            </p>
          </div>
        </div>

        {wishlists.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12 lg:p-16">
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                <Gift className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-[family-name:var(--font-outfit)] text-xl sm:text-2xl font-semibold mb-3">
                No wishlists yet
              </h3>
              <p className="text-muted-foreground">
                {profile.display_name || "This user"} hasn&apos;t shared any wishlists yet. Check back later!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlists.map((wishlist) => {
              const itemCount =
                (wishlist.items as unknown as { count: number }[])?.[0]?.count || 0;
              const isCoOwner = (wishlist as { isCurrentUserCollaborator?: boolean }).isCurrentUserCollaborator;
              // If co-owner, link to owner view; otherwise link to friend view
              const href = isCoOwner
                ? `/wishlists/${wishlist.id}`
                : `/friends/${id}/wishlists/${wishlist.id}`;

              return (
                <Link
                  key={wishlist.id}
                  href={href}
                >
                  <div className="group relative h-full bg-card border border-border/50 rounded-2xl p-5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-200 hover:-translate-y-1">
                    {/* Hover gradient overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative flex flex-col h-full">
                      {/* Top row: Icon and co-owner badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Gift className="w-5 h-5 text-primary" />
                        </div>
                        {isCoOwner && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-violet-500/10 text-violet-600">
                            <Users className="w-3 h-3" />
                            Co-owner
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {wishlist.name}
                        </h3>
                        {wishlist.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {wishlist.description}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                        <p className="text-sm text-muted-foreground">
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
