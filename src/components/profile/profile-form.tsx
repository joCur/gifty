"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/profile";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    const result = await updateProfile(formData);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated");
    }
    setIsLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={profile?.display_name || ""}
          placeholder="Your display name"
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthday">Birthday</Label>
        <Input
          id="birthday"
          name="birthday"
          type="date"
          defaultValue={profile?.birthday || ""}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Your birthday will be shown to your friends.
        </p>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
