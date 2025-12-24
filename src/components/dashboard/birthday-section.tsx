import Link from "next/link";
import { Cake, ChevronRight } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { BirthdayEvent } from "@/lib/types/feed";

interface BirthdaySectionProps {
  birthdays: BirthdayEvent[];
}

export function BirthdaySection({ birthdays }: BirthdaySectionProps) {
  if (birthdays.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-500/10 flex items-center justify-center">
            <Cake className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
            Upcoming Birthdays
          </h2>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No upcoming birthdays in the next 30 days
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400/20 to-pink-500/10 flex items-center justify-center">
          <Cake className="w-5 h-5 text-purple-500" />
        </div>
        <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
          Upcoming Birthdays
        </h2>
      </div>

      <div className="space-y-2">
        {birthdays.map((birthday) => (
          <Link
            key={birthday.id}
            href={`/friends/${birthday.friend.id}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <UserAvatar
              avatarUrl={birthday.friend.avatar_url}
              displayName={birthday.friend.display_name}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {birthday.friend.display_name || "Friend"}
              </p>
              <p className="text-sm text-muted-foreground">
                {birthday.days_until === 0
                  ? "Today!"
                  : birthday.days_until === 1
                    ? "Tomorrow!"
                    : `In ${birthday.days_until} days`}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                birthday.days_until <= 3
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {birthday.days_until === 0
                ? "Today!"
                : birthday.days_until === 1
                  ? "Tomorrow!"
                  : `${birthday.days_until}d`}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
