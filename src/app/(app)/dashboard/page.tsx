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
      <div className="animate-fade-up">
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-bold">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your wishlists and friends
        </p>
      </div>

      {/* Quick Stats */}
      <div className="animate-fade-up delay-100">
        <QuickStats stats={stats} />
      </div>

      {/* Two-column responsive layout */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3 animate-fade-up delay-200">
        {/* Main content column - takes 2/3 of space on desktop */}
        <div className="space-y-8 lg:col-span-2">
          {/* Friends' Recent Items Feed */}
          <FriendsFeed />
        </div>

        {/* Sidebar column - takes 1/3 of space on desktop */}
        <div className="space-y-6 lg:col-span-1">
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
