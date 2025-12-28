"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AppLogo } from "@/components/ui/app-logo";
import { NotificationBell } from "@/components/notifications/notification-bell";
import type { ProfileWithEmail } from "@/lib/supabase/types.custom";

interface TopHeaderProps {
  profile: ProfileWithEmail | null;
}

export function TopHeader({ profile }: TopHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-40 glass">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <AppLogo size="sm" />
            <span className="font-[family-name:var(--font-outfit)] font-semibold text-lg">
              Gifty
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link href="/profile" className="group">
              <UserAvatar
                avatarUrl={profile?.avatar_url}
                email={profile?.email}
                displayName={profile?.display_name}
                size="sm"
                className="h-9 w-9 ring-2 ring-border ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/50"
                fallbackClassName="bg-secondary text-secondary-foreground"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
