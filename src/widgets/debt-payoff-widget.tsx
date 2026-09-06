import * as React from "react";
import { Link } from "wouter";
import { Flame } from "lucide-react";

import { DebtDialog } from "@/components/debt-dialog";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatSkeleton } from "@/components/ui/skeleton";
import { useDebts } from "@/hooks/use-debts";
import {
  STRATEGY_LABEL,
  formatMonths,
  projectDebt,
  simulateStrategy,
  type Strategy,
} from "@/lib/debt-payoff";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

function monthLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  if (!y || !m) return yyyyMm;
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function DebtPayoffWidget() {
  const { data: debts, isLoading } = useDebts();
  const [extra, setExtra] = React.useState("");

  const rows = debts ?? [];
  const extraMonthly = Number(extra) || 0;

  const projections = rows.map((d) => projectDebt(d));
  const projectable = projections.filter((p) => p.projection && !p.projection.neverPaysOff);
  const underwater = projections.filter((p) => p.projection?.neverPaysOff);
  const unprojectable = projections.filter((p) => !p.projection);

  const avalanche = simulateStrategy(rows, "avalanche", extraMonthly);
  const snowball = simulateStrategy(rows, "snowball", extraMonthly);
  const savingByStrategy =
    avalanche && snowball ? snowball.totalInterest - avalanche.totalInterest : undefined;

  const best: Strategy = "avalanche";

  return (
    <Card className="h-full overflow-auto">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
          <Flame className="size-4" />
        </span>
        <p className="text-sm font-medium text-muted-foreground">Debt Payoff Plan</p>
      </div>

      {isLoading ? (
        <StatSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="No debts to plan"
          description="Add a debt with its interest rate and monthly payment and this works out when it clears and what it costs."
          action={<DebtDialog />}
          className="py-4"
        />
      ) : (
        <>
          {avalanche && (
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {formatMonths(avalanche.months)}
              </p>
              <p className="text-sm text-muted-foreground">
                until debt-free · {formatCurrency(avalanche.totalInterest)} interest
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="extraPayment" className="text-xs">
              Extra per month
            </Label>
            <Input
              id="extraPayment"
              type="number"
              step="any"
              min="0"
              inputMode="decimal"
              placeholder="0"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              className="h-8"
            />
          </div>

          {avalanche && snowball && (
            <div className="space-y-1 rounded-lg bg-accent/60 p-3 text-xs">
              {[
                { key: "avalanche" as Strategy, result: avalanche },
                { key: "snowball" as Strategy, result: snowball },
              ].map(({ key, result }) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className={cn(key === best && "font-medium")}>
                    {STRATEGY_LABEL[key]}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {formatMonths(result.months)} · {formatCurrency(result.totalInterest)}
                  </span>
                </div>
              ))}
              <p className="pt-1 text-muted-foreground">
                {savingByStrategy !== undefined && savingByStrategy > 0.5
                  ? `Avalanche saves ${formatCurrency(savingByStrategy)} in interest.`
                  : extraMonthly > 0
                    ? "Both plans come out the same here — the order doesn't change the total."
                    : "Add an amount above: with nothing spare to direct, both plans are identical."}
              </p>
            </div>
          )}

          {projectable.length > 0 && (
            <>
              {/* These are standalone projections — each debt paying only its
                  own amount. The plan above is faster because a cleared debt's
                  payment rolls into the next one. */}
              <p className="text-xs font-medium text-muted-foreground">
                Each on its own, without rollover
              </p>
              <ul className="space-y-2">
              {projectable.map(({ debt, projection, extraPaymentSaving }) => (
                <li key={debt.id} className="text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{debt.name}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      clear {monthLabel(projection!.payoffOn)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatMonths(projection!.months)} · {formatCurrency(projection!.totalInterest)}{" "}
                    interest
                    {extraPaymentSaving && extraPaymentSaving.monthsSaved > 0 && (
                      <>
                        {" · +"}
                        {formatCurrency(extraPaymentSaving.extra)}/mo saves{" "}
                        {formatMonths(extraPaymentSaving.monthsSaved)}
                      </>
                    )}
                  </p>
                </li>
                ))}
              </ul>
            </>
          )}

          {underwater.length > 0 && (
            <p className="text-xs font-medium text-destructive">
              {underwater.map((p) => p.debt.name).join(", ")}: the monthly payment doesn't cover
              the interest, so the balance grows. This never clears.
            </p>
          )}

          {unprojectable.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {unprojectable.length} debt{unprojectable.length === 1 ? "" : "s"} can't be projected
              — add an interest rate and monthly payment.
            </p>
          )}

          <Link
            href="/liabilities"
            className="mt-auto text-xs font-medium text-primary hover:underline"
          >
            Manage debts →
          </Link>
        </>
      )}
    </Card>
  );
}
