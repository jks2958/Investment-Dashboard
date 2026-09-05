import { Link } from "wouter";
import { CalendarClock } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useCommitments } from "@/hooks/use-commitments";
import { useTransactions } from "@/hooks/use-transactions";
import { formatDateShort, isInMonthOffset } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";
import { commitmentMath, totalRequiredMonthly } from "@/lib/liabilities";
import { cn } from "@/lib/utils";

const TOP_N = 4;
const LOOKBACK_MONTHS = [-1, -2, -3];

export function CommitmentsWidget() {
  const { data: commitments, isLoading } = useCommitments();
  const { data: transactions } = useTransactions();

  const rows = commitments ?? [];
  const requiredMonthly = totalRequiredMonthly(rows);

  // Actual saving over the last 3 complete months, to compare against what the
  // commitments demand. The current month is partial, so it's left out.
  const monthlyNet = LOOKBACK_MONTHS.map((offset) => {
    const inMonth = (transactions ?? []).filter((t) => isInMonthOffset(t.occurredOn, offset));
    if (inMonth.length === 0) return undefined;
    const income = inMonth
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = inMonth
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return income - expenses;
  }).filter((v): v is number => v !== undefined);

  const actualSaving =
    monthlyNet.length > 0 ? monthlyNet.reduce((a, b) => a + b, 0) / monthlyNet.length : undefined;
  const covered = actualSaving !== undefined && actualSaving >= requiredMonthly;

  const upcoming = [...rows]
    .map((c) => ({ commitment: c, math: commitmentMath(c) }))
    .sort((a, b) => a.commitment.dueOn.localeCompare(b.commitment.dueOn))
    .slice(0, TOP_N);

  return (
    <Card className="h-full overflow-auto">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CalendarClock className="size-4" />
        </span>
        <p className="text-sm font-medium text-muted-foreground">Future Commitments</p>
      </div>

      <div>
        <p className="text-2xl font-semibold tabular-nums">
          {formatCurrency(requiredMonthly)}
          <span className="text-sm font-normal text-muted-foreground">/mo</span>
        </p>
        <p className="text-sm text-muted-foreground">to be ready on time</p>
      </div>

      {actualSaving !== undefined && requiredMonthly > 0 && (
        <p className={cn("text-xs font-medium", covered ? "text-positive" : "text-destructive")}>
          {covered
            ? `Covered — you're saving ${formatCurrency(actualSaving)}/mo`
            : `Short ${formatCurrency(requiredMonthly - actualSaving)}/mo — saving ${formatCurrency(actualSaving)}`}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing planned yet. Add costs you know are coming to see what to set aside.
        </p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map(({ commitment, math }) => (
            <li key={commitment.id} className="flex items-center gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate">{commitment.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDateShort(commitment.dueOn)}
              </span>
              <span
                className={cn(
                  "w-24 shrink-0 text-right tabular-nums",
                  math.remaining <= 0 && "text-positive",
                )}
              >
                {math.remaining <= 0 ? "funded" : formatCurrency(math.totalAmount)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link href="/liabilities" className="text-sm font-medium text-primary hover:underline">
        Manage commitments →
      </Link>
    </Card>
  );
}
