import { Link } from "wouter";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTransactions } from "@/hooks/use-transactions";
import { iconForCategory } from "@/lib/category-icons";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const PREVIEW_COUNT = 5;

export function TransactionsWidget() {
  const { data: transactions, isLoading } = useTransactions();
  const rows = (transactions ?? []).slice(0, PREVIEW_COUNT);

  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <h2 className="text-base font-semibold">Recent transactions</h2>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((t) => {
              const Icon = iconForCategory(t.category);
              return (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{t.category}</span>
                  <span
                    className={cn(
                      "text-sm font-medium tabular-nums",
                      t.type === "income" ? "text-positive" : "text-destructive",
                    )}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(Number(t.amount))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <Link
          href="/income-expense"
          className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
        >
          View all →
        </Link>
      </CardContent>
    </Card>
  );
}
