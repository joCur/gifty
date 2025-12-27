import { getDashboardStats } from "@/lib/actions/stats";
import { getUpcomingBirthdays, getMyWishlistsPreview } from "@/lib/actions/dashboard";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { BirthdaySection } from "@/components/dashboard/birthday-section";
import { MyWishlistsPreview } from "@/components/dashboard/my-wishlists-preview";
import { FriendsFeed } from "@/components/dashboard/friends-feed";
import { RecentClaimsSection } from "@/components/dashboard/recent-claims-section";

export default async function DashboardPage() {
  // Parallel SSR data fetching
  const [stats, birthdays, wishlistsPreview] = await Promise.all([
    getDashboardStats(),
    getUpcomingBirthdays(),
    getMyWishlistsPreview(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-bold">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your wishlists and friends
        </p>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr,380px] xl:grid-cols-[1fr,420px]">
        {/* Main content column */}
        <div className="space-y-8 order-2 lg:order-1">
          {/* Friends' Recent Items Feed */}
          <FriendsFeed />
        </div>

        {/* Sidebar column */}
        <div className="space-y-6 order-1 lg:order-2">
          {/* Upcoming Birthdays */}
          <BirthdaySection birthdays={birthdays} />

          {/* My Wishlists Preview */}
          <MyWishlistsPreview wishlists={wishlistsPreview} />

          {/* Recent Claims */}
          <RecentClaimsSection />
        </div>
      </div>
    </div>
  );
}
