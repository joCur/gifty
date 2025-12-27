"use client";

import { Calendar, Package, Loader2 } from "lucide-react";
import { ClaimHistoryItemCard } from "./claim-history-item";
import { useClaimHistory } from "@/lib/queries/hooks";
import type { ClaimHistoryResponse, ClaimHistoryPeriod } from "@/lib/types/claims";

function PeriodSection({ period }: { period: ClaimHistoryPeriod }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Calendar className="w-4 h-4" />
        {period.label}
        <span className="text-xs">({period.claims.length} items)</span>
      </div>
      <div className="space-y-2">
        {period.claims.map((claim) => (
          <ClaimHistoryItemCard key={claim.id} claim={claim} />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
        <Package className="w-6 h-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm text-muted-foreground">
        No claims yet. Browse your friends&apos; wishlists to claim gifts!
      </p>
    </div>
  );
}

interface ClaimHistoryListProps {
  initialData?: ClaimHistoryResponse;
}

export function ClaimHistoryList({ initialData }: ClaimHistoryListProps) {
  const { data, isLoading, error } = useClaimHistory();

  const history = data || initialData;

  if (isLoading && !history) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load claim history
      </div>
    );
  }

  if (!history || history.periods.length === 0) {
    return <EmptyState />;
  }

  const totalClaims = history.totalActive + history.totalCancelled + history.totalFulfilled;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalClaims} {totalClaims === 1 ? "claim" : "claims"} total
        </p>
      </div>

      <div className="space-y-6">
        {history.periods.map((period) => (
          <PeriodSection key={`${period.year}-${period.month}`} period={period} />
        ))}
      </div>
    </div>
  );
}
