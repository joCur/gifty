"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, Sparkles, Users } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (allItems.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-[family-name:var(--font-outfit)] text-xl font-semibold mb-2">
          No activity yet
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          When your friends add items to their wishlists, they&apos;ll appear here.
          Add some friends to get started!
        </p>
        <Link href="/friends">
          <Button className="rounded-xl">
            <Users className="w-4 h-4 mr-2" />
            Find Friends
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {allItems.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          )}
        </div>
      )}

      {/* End of feed indicator */}
      {!hasNextPage && allItems.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          You&apos;ve seen all recent items
        </p>
      )}
    </div>
  );
}
