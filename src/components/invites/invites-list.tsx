"use client";

import { useState } from "react";
import { formatDistanceToNow, format, isPast } from "date-fns";
import { Ticket, Copy, Check, Clock, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { GenerateInviteButton } from "./generate-invite-button";
import type { InviteCode } from "@/lib/actions/invites";

interface InvitesListProps {
  invites: InviteCode[];
  type: "active" | "used";
}

function InviteCard({ invite, type }: { invite: InviteCode; type: "active" | "used" }) {
  const [copied, setCopied] = useState(false);
  const isExpired = isPast(new Date(invite.expires_at));

  function getInviteUrl(code: string) {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/signup?invite=${code}`;
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(getInviteUrl(invite.code));
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }

  if (type === "used" && invite.invitee) {
    const initials = invite.invitee.display_name
      ? invite.invitee.display_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

    return (
      <div className="bg-card border border-border/50 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400/20 to-purple-500/10 flex items-center justify-center">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={invite.invitee.avatar_url || undefined} className="rounded-lg" />
              <AvatarFallback className="rounded-lg bg-transparent text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {invite.invitee.display_name || "Unknown"}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserCheck className="w-3 h-3" />
              <span>
                Joined {invite.used_at && formatDistanceToNow(new Date(invite.used_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active invite card
  return (
    <div className={`bg-card border rounded-2xl p-4 ${isExpired ? "border-destructive/30 opacity-60" : "border-border/50"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-mono font-semibold">{invite.code}</p>
            {isExpired && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive/10 text-destructive">
                <AlertCircle className="w-3 h-3" />
                Expired
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {isExpired ? (
              <span>Expired {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}</span>
            ) : (
              <span>Expires {format(new Date(invite.expires_at), "MMM d, yyyy")}</span>
            )}
          </div>
        </div>

        {!isExpired && (
          <Button
            size="sm"
            variant="ghost"
            onClick={copyToClipboard}
            className="rounded-lg shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export function InvitesList({ invites, type }: InvitesListProps) {
  if (invites.length === 0) {
    if (type === "active") {
      return (
        <div className="bg-card border border-border/50 rounded-3xl p-8 md:p-12">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 flex items-center justify-center mb-6">
              <Ticket className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="font-[family-name:var(--font-outfit)] text-xl sm:text-2xl font-semibold mb-3">
              No active invites
            </h3>
            <p className="text-muted-foreground mb-8">
              Generate an invite to share with friends. Each invite can be used once and expires after 7 days.
            </p>
            <GenerateInviteButton />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-card/50 border border-dashed border-border/50 rounded-2xl p-6">
        <div className="flex flex-col items-center text-center">
          <UserCheck className="w-8 h-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            No one has joined yet via your invites
          </p>
        </div>
      </div>
    );
  }

  if (type === "used") {
    return (
      <div className="space-y-3">
        {invites.map((invite) => (
          <InviteCard key={invite.code} invite={invite} type={type} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {invites.map((invite) => (
        <InviteCard key={invite.code} invite={invite} type={type} />
      ))}

      {/* Add new invite card */}
      <div className="flex items-center justify-center min-h-[100px] bg-card/50 border-2 border-dashed border-border/50 rounded-2xl p-4">
        <GenerateInviteButton />
      </div>
    </div>
  );
}
