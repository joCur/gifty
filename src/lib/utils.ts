import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate initials from a display name
 * @param displayName - The display name to generate initials from
 * @returns Up to 2 uppercase letters, or "?" if no name provided
 */
export function getInitials(displayName: string | null | undefined): string {
  if (!displayName) return "?";
  return displayName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}

/**
 * Extract item count from Supabase aggregation result
 */
export function extractItemCount(items: unknown): number {
  return (items as { count: number }[])?.[0]?.count || 0;
}
