import { Link } from "wouter";
import { Landmark } from "lucide-react";

import { DebtDialog } from "@/components/debt-dialog";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { StatSkeleton } from "@/components/ui/skeleton";
import { useDebts } from "@/hooks/use-debts";
import { usePortfolioTotals } from "@/hooks/use-portfolio-totals";
import { formatCurrency } from "@/lib/format";
import { DEBT_KIND_LABEL, summarizeDebts } from "@/lib/liabilities";

const TOP_N = 4;

export function DebtsWidget() {
  const { data: debts, isLoading } = useDebts();
  const { totalAssets } = usePortfolioTotals();

  const rows = debts ?? [];
  const summary = summarizeDebts(rows);
  const largest = [...rows]
    .sort((a, b) => Number(b.balance) - Number(a.balance))
    .slice(0, TOP_N);

  // Debt as a share of what you own — a quick read on how leveraged you are.
  const debtRatio = totalAssets > 0 ? (summary.totalOwed / totalAssets) * 100 : undefined;

  return (
    <Card className="h-full overflow-auto">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <Landmark className="size-4" />
        </span>
        <p className="text-sm font-medium text-muted-foreground">Debts</p>
      </div>

      {summary.totalOwed > 0 && (
        <div className="flex items-baseline gap-3">
          <p className="text-2xl font-semibold tabular-nums text-destructive">
            {formatCurrency(summary.totalOwed)}
          </p>
          {debtRatio !== undefined && (
            <span className="text-xs text-muted-foreground">
              {debtRatio.toFixed(0)}% of assets
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <StatSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="Nothing owed"
          description="Add a mortgage, loan or card balance to see it subtracted from your net worth."
          action={<DebtDialog />}
          className="py-4"
        />
      ) : (
        <>
          <ul className="space-y-2">
            {largest.map((debt) => (
              <li key={debt.id} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">{debt.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {debt.interestRate !== null
                    ? `${Number(debt.interestRate)}%`
                    : DEBT_KIND_LABEL[debt.kind]}
                </span>
                <span className="w-24 shrink-0 text-right tabular-nums">
                  {formatCurrency(Number(debt.balance))}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 text-sm">
            {summary.monthlyPayments > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Monthly payments</dt>
                <dd className="font-medium tabular-nums">
                  {formatCurrency(summary.monthlyPayments)}
                </dd>
              </div>
            )}
            {summary.highestRate && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Costliest</dt>
                <dd className="font-medium">
                  {summary.highestRate.name} · {summary.highestRate.rate}%
                </dd>
              </div>
            )}
          </dl>
        </>
      )}

      <Link href="/liabilities" className="text-sm font-medium text-primary hover:underline">
        Manage debts →
      </Link>
    </Card>
  );
}
