import { Link } from "wouter";
import { LifeBuoy } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useCashAccounts } from "@/hooks/use-cash";
import { useTransactions } from "@/hooks/use-transactions";
import { isInMonthOffset } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Months of history averaged, and the runway the bar treats as "full". */
const LOOKBACK_MONTHS = [-1, -2, -3];
const HEALTHY_MONTHS = 6;

export function CashRunwayWidget() {
  const { data: cashAccounts, isLoading: cashLoading } = useCashAccounts();
  const { data: transactions, isLoading: txLoading } = useTransactions();

  const totalCash = (cashAccounts ?? []).reduce((sum, a) => sum + Number(a.balance), 0);
  const expenses = (transactions ?? []).filter((t) => t.type === "expense");

  // Average the last 3 complete months; the current month is partial, so it
  // would drag the average down. Fall back to it only if that's all there is.
  const monthTotals = LOOKBACK_MONTHS.map((offset) =>
    expenses
      .filter((t) => isInMonthOffset(t.occurredOn, offset))
      .reduce((sum, t) => sum + Number(t.amount), 0),
  ).filter((total) => total > 0);

  const currentMonthTotal = expenses
    .filter((t) => isInMonthOffset(t.occurredOn, 0))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthsAveraged = monthTotals.length > 0 ? monthTotals.length : currentMonthTotal > 0 ? 1 : 0;
  const avgMonthly =
    monthTotals.length > 0
      ? monthTotals.reduce((sum, t) => sum + t, 0) / monthTotals.length
      : currentMonthTotal;

  const runway = avgMonthly > 0 ? totalCash / avgMonthly : undefined;
  const barPct = runway !== undefined ? Math.min((runway / HEALTHY_MONTHS) * 100, 100) : 0;
  const healthy = (runway ?? 0) >= HEALTHY_MONTHS;

  return (
    <Card className="h-full overflow-auto">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-positive/15 text-positive">
          <LifeBuoy className="size-4" />
        </span>
        <p className="text-sm font-medium text-muted-foreground">Cash Runway</p>
      </div>

      {cashLoading || txLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : runway === undefined ? (
        <p className="text-sm text-muted-foreground">
          Log some expenses to see how long your cash would last.
        </p>
      ) : (
        <>
          <div>
            <p className="text-3xl font-semibold tabular-nums">{runway.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">
              month{runway.toFixed(1) === "1.0" ? "" : "s"} of expenses covered by cash
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", healthy ? "bg-positive" : "bg-primary")}
                style={{ width: `${barPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {healthy
                ? `At or above a ${HEALTHY_MONTHS}-month cushion.`
                : `${HEALTHY_MONTHS} months is a common cushion to aim for.`}
            </p>
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Cash on hand</dt>
              <dd className="font-medium tabular-nums">{formatCurrency(totalCash)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">
                Avg monthly spend
                {monthsAveraged > 0 && (
                  <span className="ml-1 text-xs">
                    ({monthsAveraged} mo{monthsAveraged === 1 ? "" : "s"})
                  </span>
                )}
              </dt>
              <dd className="font-medium tabular-nums">{formatCurrency(avgMonthly)}</dd>
            </div>
          </dl>
        </>
      )}

      <Link href="/account" className="text-sm font-medium text-primary hover:underline">
        Manage cash accounts →
      </Link>
    </Card>
  );
}
