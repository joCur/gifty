"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getFriendActivityFeed } from "@/lib/actions/feed";
import { getClaimHistory } from "@/lib/actions/claim-history";
import { queryKeys } from "./keys";

export function useFriendActivityFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.feed.friends(),
    queryFn: ({ pageParam }) => getFriendActivityFeed(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
}

export function useClaimHistory(options?: { limit?: number }) {
  return useQuery({
    queryKey: queryKeys.claims.history(options?.limit),
    queryFn: () => getClaimHistory(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
