"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, Sparkles, Users, Heart } from "lucide-react";
import { useFriendActivityFeed } from "@/lib/queries/hooks";
import { FeedCard } from "./feed-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FriendsFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useFriendActivityFeed();

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allItems = data?.pages.flatMap((page) => page.items) || [];

  // Section header component
  const SectionHeader = () => (
    <div className="flex items-center gap-3 p-4 pb-0">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400/20 to-pink-500/10 flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-rose-500" />
      </div>
      <div>
        <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
          Friends&apos; Wishlists
        </h2>
        <p className="text-xs text-muted-foreground">
          Recent items from your friends
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl">
        <SectionHeader />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl">
        <SectionHeader />
        <div className="p-8 pt-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400/20 to-pink-500/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-rose-500" />
          </div>
          <h3 className="font-[family-name:var(--font-outfit)] text-lg font-semibold mb-2">
            No activity yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            When your friends add items to their wishlists, they&apos;ll appear here
          </p>
          <Link href="/friends">
            <Button className="rounded-xl shadow-md shadow-primary/20">
              <Users className="w-4 h-4 mr-2" />
              Find Friends
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <SectionHeader />

      {/* Feed items */}
      <div className="divide-y divide-border/30 mt-4">
        {allItems.map((item, index) => (
          <div
            key={item.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
          >
            <FeedCard item={item} />
          </div>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-6 border-t border-border/30">
          {isFetchingNextPage ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <span className="text-xs text-muted-foreground">Loading more...</span>
          )}
        </div>
      )}

      {/* End of feed indicator */}
      {!hasNextPage && allItems.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-5 border-t border-border/30 bg-muted/30">
          <Heart className="w-4 h-4 text-rose-400" />
          <span className="text-xs text-muted-foreground">
            You&apos;re all caught up
          </span>
        </div>
      )}
    </div>
  );
}
