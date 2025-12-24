import { TrendingUp, Gift, Users, ShoppingBag } from "lucide-react";
import type { DashboardStats } from "@/lib/types/feed";

interface QuickStatsProps {
  stats: DashboardStats;
}

export function QuickStats({ stats }: QuickStatsProps) {
  const statCards = [
    {
      label: "My Wishlists",
      value: stats.total_wishlists,
      icon: Gift,
      color: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      label: "Total Items",
      value: stats.total_items,
      icon: TrendingUp,
      color: "from-emerald-400/20 to-emerald-500/5",
      iconColor: "text-emerald-600",
    },
    {
      label: "Friends",
      value: stats.friends_count,
      icon: Users,
      color: "from-rose-400/20 to-pink-500/5",
      iconColor: "text-rose-500",
    },
    {
      label: "Gifts Claimed",
      value: stats.claimed_items_count,
      icon: ShoppingBag,
      color: "from-amber-400/20 to-orange-500/5",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="relative bg-card border border-border/50 rounded-2xl p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold font-[family-name:var(--font-outfit)]">
                {stat.value}
              </p>
            </div>
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
            >
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
