"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getFriendActivityFeed, getMyClaimedItems } from "@/lib/actions/feed";
import { getClaimHistoryGrouped } from "@/lib/actions/claim-history";
import { queryKeys } from "./keys";
import type { ClaimHistoryFilters } from "@/lib/types/claims";

export function useFriendActivityFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.feed.friends(),
    queryFn: ({ pageParam }) => getFriendActivityFeed(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
}

export function useMyClaimedItems() {
  return useQuery({
    queryKey: queryKeys.claims.my(),
    queryFn: () => getMyClaimedItems(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useClaimHistory(filters?: ClaimHistoryFilters) {
  return useQuery({
    queryKey: queryKeys.claims.history(filters),
    queryFn: () => getClaimHistoryGrouped(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
