import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDeleteTransaction, useTransactions } from "@/hooks/use-transactions";
import { iconForCategory } from "@/lib/category-icons";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function TransactionsList() {
  const { data: transactions, isLoading } = useTransactions();
  const deleteTransaction = useDeleteTransaction();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!transactions || transactions.length === 0) {
    return <p className="text-sm text-muted-foreground">No transactions yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {transactions.map((t) => {
        const Icon = iconForCategory(t.category);
        return (
          <li key={t.id} className="flex items-center gap-3 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{t.category}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(t.occurredOn).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {t.note ? ` · ${t.note}` : ""}
              </p>
            </div>
            <p
              className={cn(
                "font-medium tabular-nums",
                t.type === "income" ? "text-positive" : "text-destructive",
              )}
            >
              {t.type === "income" ? "+" : "-"}
              {formatCurrency(Number(t.amount))}
            </p>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${t.category}`}
              onClick={() => deleteTransaction.mutate(t.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
