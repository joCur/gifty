// Query key factory for type-safe TanStack Query cache management
export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all, "stats"] as const,
    birthdays: () => [...queryKeys.dashboard.all, "birthdays"] as const,
  },
  feed: {
    all: ["feed"] as const,
    friends: () => [...queryKeys.feed.all, "friends"] as const,
  },
  claims: {
    all: ["claims"] as const,
    my: () => [...queryKeys.claims.all, "my"] as const,
  },
} as const;
