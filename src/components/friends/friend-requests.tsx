"use client";

import { useState } from "react";
import { Check, X, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
} from "@/lib/actions/friends";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface IncomingRequest {
  id: string;
  from: Profile;
  created_at: string;
}

interface OutgoingRequest {
  id: string;
  to: Profile;
  created_at: string;
}

export function FriendRequests({
  incoming,
  outgoing,
}: {
  incoming: IncomingRequest[];
  outgoing: OutgoingRequest[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAccept(id: string) {
    setLoadingId(id);
    const result = await acceptFriendRequest(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Friend request accepted!");
    }
    setLoadingId(null);
  }

  async function handleDecline(id: string) {
    setLoadingId(id);
    const result = await declineFriendRequest(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Friend request declined");
    }
    setLoadingId(null);
  }

  async function handleCancel(id: string) {
    setLoadingId(id);
    const result = await cancelFriendRequest(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Friend request cancelled");
    }
    setLoadingId(null);
  }

  if (incoming.length === 0 && outgoing.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No pending requests</h3>
          <p className="text-muted-foreground text-sm">
            Friend requests you send or receive will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {incoming.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Incoming Requests
          </h3>
          {incoming.map((request) => {
            const initials = request.from.display_name
              ? request.from.display_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "?";

            return (
              <Card key={request.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.from.avatar_url || undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {request.from.display_name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(request.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDecline(request.id)}
                      disabled={loadingId === request.id}
                    >
                      {loadingId === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => handleAccept(request.id)}
                      disabled={loadingId === request.id}
                    >
                      {loadingId === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {outgoing.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Sent Requests
          </h3>
          {outgoing.map((request) => {
            const initials = request.to.display_name
              ? request.to.display_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "?";

            return (
              <Card key={request.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.to.avatar_url || undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {request.to.display_name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pending -{" "}
                      {formatDistanceToNow(new Date(request.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(request.id)}
                    disabled={loadingId === request.id}
                  >
                    {loadingId === request.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Cancel"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
