import * as React from "react";
import { Link } from "wouter";

import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/hooks/use-transactions";
import { iconForCategory } from "@/lib/category-icons";
import { isInMonthOffset } from "@/lib/date-range";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const TOP_CATEGORIES = 3;

export function ExpensesCard() {
  const { data: transactions } = useTransactions();
  const [period, setPeriod] = React.useState<"0" | "-1">("0");
  const offset = Number(period);

  const rows = transactions ?? [];
  const expensesThisPeriod = rows.filter(
    (t) => t.type === "expense" && isInMonthOffset(t.occurredOn, offset),
  );
  const expensesPrevPeriod = rows.filter(
    (t) => t.type === "expense" && isInMonthOffset(t.occurredOn, offset - 1),
  );
  const incomeThisPeriod = rows.filter(
    (t) => t.type === "income" && isInMonthOffset(t.occurredOn, offset),
  );

  const total = expensesThisPeriod.reduce((sum, t) => sum + Number(t.amount), 0);
  const prevTotal = expensesPrevPeriod.reduce((sum, t) => sum + Number(t.amount), 0);
  const income = incomeThisPeriod.reduce((sum, t) => sum + Number(t.amount), 0);

  const deltaPct = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : undefined;
  const spendRate = income > 0 ? Math.min((total / income) * 100, 100) : undefined;

  const byCategory = new Map<string, number>();
  for (const t of expensesThisPeriod) {
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + Number(t.amount));
  }
  const sorted = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, TOP_CATEGORIES);
  const othersTotal = sorted.slice(TOP_CATEGORIES).reduce((sum, [, v]) => sum + v, 0);
  const rows2 = othersTotal > 0 ? [...top, ["Others", othersTotal] as const] : top;

  return (
    <Card className="h-full overflow-auto">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Expenses</p>
        <Select value={period} onValueChange={(v) => setPeriod(v as "0" | "-1")}>
          <SelectTrigger className="h-7 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">This Month</SelectItem>
            <SelectItem value="-1">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-semibold tabular-nums">{formatCurrency(total)}</p>
        {deltaPct !== undefined && (
          <span
            className={cn(
              "text-xs font-medium",
              deltaPct <= 0 ? "text-positive" : "text-destructive",
            )}
          >
            {formatPercent(deltaPct)} vs last month
          </span>
        )}
      </div>

      {spendRate !== undefined && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", spendRate > 80 ? "bg-destructive" : "bg-positive")}
            style={{ width: `${spendRate}%` }}
          />
        </div>
      )}

      {rows2.length === 0 ? (
        <p className="text-sm text-muted-foreground">No expenses this period.</p>
      ) : (
        <ul className="space-y-3">
          {rows2.map(([category, amount]) => {
            const Icon = category === "Others" ? undefined : iconForCategory(category);
            const pct = total > 0 ? (amount / total) * 100 : 0;
            return (
              <li key={category} className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
                  {Icon ? <Icon className="size-4" /> : <span className="text-xs">···</span>}
                </span>
                <span className="w-24 shrink-0 truncate text-sm">{category}</span>
                <span className="w-16 shrink-0 text-sm tabular-nums">{formatCurrency(amount)}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                  {pct.toFixed(0)}%
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <Link href="/income-expense" className="text-sm font-medium text-primary hover:underline">
        View all expenses →
      </Link>
    </Card>
  );
}
