import { TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/sparkline";
import { useTransactions } from "@/hooks/use-transactions";
import { isInMonthOffset } from "@/lib/date-range";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

function netFor(
  transactions: { type: "income" | "expense"; amount: string; occurredOn: string }[],
  offsetMonths: number,
): number {
  return transactions
    .filter((t) => isInMonthOffset(t.occurredOn, offsetMonths))
    .reduce((sum, t) => sum + (t.type === "income" ? Number(t.amount) : -Number(t.amount)), 0);
}

export function NetIncomeCard() {
  const { data: transactions } = useTransactions();
  const rows = transactions ?? [];

  const thisMonth = netFor(rows, 0);
  const lastMonth = netFor(rows, -1);
  const deltaPct = lastMonth !== 0 ? ((thisMonth - lastMonth) / Math.abs(lastMonth)) * 100 : undefined;

  const daily = new Map<string, number>();
  for (const t of rows.filter((t) => isInMonthOffset(t.occurredOn, 0))) {
    const signed = t.type === "income" ? Number(t.amount) : -Number(t.amount);
    daily.set(t.occurredOn, (daily.get(t.occurredOn) ?? 0) + signed);
  }
  const sortedDays = [...daily.keys()].sort();
  let running = 0;
  const series = sortedDays.map((day) => {
    running += daily.get(day) ?? 0;
    return running;
  });

  return (
    <Card className="h-full justify-between gap-3">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">Net Income / month</p>
        <span className="flex size-8 items-center justify-center rounded-full bg-accent text-muted-foreground">
          <TrendingUp className="size-4" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p
            className={cn(
              "text-2xl font-semibold tabular-nums",
              thisMonth >= 0 ? "text-positive" : "text-destructive",
            )}
          >
            {thisMonth >= 0 ? "+" : ""}
            {formatCurrency(thisMonth)}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>vs last month</span>
            {deltaPct !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-medium",
                  deltaPct >= 0 ? "bg-positive/15 text-positive" : "bg-destructive/15 text-destructive",
                )}
              >
                {formatPercent(deltaPct)}
              </span>
            )}
          </div>
        </div>
        <div className="w-24 flex-1 sm:w-auto">
          <Sparkline data={series} color="var(--positive)" id="net-income" />
        </div>
      </div>
    </Card>
  );
}
