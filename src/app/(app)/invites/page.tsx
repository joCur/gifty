import { getMyInvites } from "@/lib/actions/invites";
import { InvitesList } from "@/components/invites/invites-list";
import { GenerateInviteButton } from "@/components/invites/generate-invite-button";
import { Ticket, Send } from "lucide-react";

export default async function InvitesPage() {
  const invites = await getMyInvites();

  const activeInvites = invites.filter(
    (i) => !i.used_at && new Date(i.expires_at) > new Date()
  );
  const usedInvites = invites.filter((i) => i.used_at);

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-bold">
            Invites
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Invite friends to join Giftify
          </p>
        </div>
        <GenerateInviteButton />
      </div>

      {/* Desktop: Two-column layout / Mobile: Stacked */}
      <div className="grid gap-8 lg:grid-cols-[1fr,380px] xl:grid-cols-[1fr,420px]">
        {/* Main content - Active Invites */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Section header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
                Active Invites
              </h2>
              <p className="text-xs text-muted-foreground">
                {activeInvites.length} invite{activeInvites.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>

          <InvitesList invites={activeInvites} type="active" />
        </div>

        {/* Sidebar - Used Invites */}
        <div className="space-y-6 order-1 lg:order-2">
          {/* Section header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400/20 to-purple-500/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-outfit)] text-lg font-semibold">
                Used Invites
              </h2>
              <p className="text-xs text-muted-foreground">
                {usedInvites.length} friend{usedInvites.length !== 1 ? "s" : ""} joined via your invites
              </p>
            </div>
          </div>

          <InvitesList invites={usedInvites} type="used" />
        </div>
      </div>
    </div>
  );
}
