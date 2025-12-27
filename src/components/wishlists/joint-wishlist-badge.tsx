import { Users } from "lucide-react";

interface JointWishlistBadgeProps {
  collaboratorCount?: number;
  className?: string;
}

export function JointWishlistBadge({ collaboratorCount, className }: JointWishlistBadgeProps) {
  const totalOwners = collaboratorCount !== undefined ? 1 + collaboratorCount : undefined;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-violet-500/10 text-violet-600 ${className || ""}`}
    >
      <Users className="w-3 h-3" />
      {totalOwners ? `Joint (${totalOwners})` : "Joint"}
    </span>
  );
}
