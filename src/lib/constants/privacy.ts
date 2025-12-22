import { Lock, Users, Globe } from "lucide-react";
import type { WishlistPrivacy } from "@/lib/supabase/types";

export const PRIVACY_OPTIONS: {
  value: WishlistPrivacy;
  label: string;
  description: string;
  icon: typeof Lock;
}[] = [
  {
    value: "friends",
    label: "All Friends",
    description: "Visible to all your friends",
    icon: Users,
  },
  {
    value: "public",
    label: "Public",
    description: "Same as friends (all friends can see)",
    icon: Globe,
  },
  {
    value: "private",
    label: "Private",
    description: "Only visible to you",
    icon: Lock,
  },
];

export const PRIVACY_CONFIG: Record<
  WishlistPrivacy,
  { label: string; icon: typeof Lock }
> = {
  private: { label: "Private", icon: Lock },
  friends: { label: "Friends", icon: Users },
  public: { label: "All friends", icon: Globe },
};
