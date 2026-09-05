import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCommitments, useDeleteCommitment } from "@/hooks/use-commitments";
import { formatDateShort } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";
import {
  CERTAINTY_LABEL,
  COMMITMENT_CATEGORY_LABEL,
  commitmentMath,
} from "@/lib/liabilities";
import { cn } from "@/lib/utils";

export function CommitmentsList() {
  const { data: commitments, isLoading } = useCommitments();
  const deleteCommitment = useDeleteCommitment();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!commitments || commitments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing planned yet. Add costs you know are coming — tuition, a wedding, a car
        replacement — to see what to set aside each month.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {commitments.map((commitment) => {
        const math = commitmentMath(commitment);
        const progress = math.totalAmount > 0 ? (math.funded / math.totalAmount) * 100 : 0;
        const fullyFunded = math.remaining <= 0;

        const meta = [
          COMMITMENT_CATEGORY_LABEL[commitment.category],
          commitment.recurringYears > 1
            ? `${formatCurrency(Number(commitment.amount))} × ${commitment.recurringYears} yrs`
            : null,
          `due ${formatDateShort(commitment.dueOn)}`,
          commitment.certainty !== "confirmed" ? CERTAINTY_LABEL[commitment.certainty] : null,
        ].filter(Boolean);

        return (
          <li key={commitment.id} className="space-y-2 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{commitment.name}</p>
                <p className="truncate text-xs text-muted-foreground">{meta.join(" · ")}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-medium tabular-nums">
                    {formatCurrency(math.totalAmount)}
                  </p>
                  <p
                    className={cn(
                      "text-xs tabular-nums",
                      fullyFunded
                        ? "text-positive"
                        : math.isOverdue
                          ? "text-destructive"
                          : "text-muted-foreground",
                    )}
                  >
                    {fullyFunded
                      ? "fully funded"
                      : math.isOverdue
                        ? `${formatCurrency(math.remaining)} short, overdue`
                        : `${formatCurrency(math.requiredMonthly)}/mo needed`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${commitment.name}`}
                  onClick={() => deleteCommitment.mutate(commitment.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    fullyFunded ? "bg-positive" : "bg-primary",
                  )}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="w-28 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {formatCurrency(math.funded)} saved
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
