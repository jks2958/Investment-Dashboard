import * as React from "react";
import { Pencil, Receipt } from "lucide-react";

import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/empty-state";
import { TransactionDialog } from "@/components/transaction-dialog";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useDeleteTransaction, useTransactions } from "@/hooks/use-transactions";
import type { Transaction } from "@/lib/api";
import { iconForCategory } from "@/lib/category-icons";
import { formatDateShort } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function TransactionsList() {
  const { data: transactions, isLoading } = useTransactions();
  const deleteTransaction = useDeleteTransaction();
  const [editing, setEditing] = React.useState<Transaction | undefined>();

  if (isLoading) return <ListSkeleton rows={5} />;

  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No transactions yet"
        description="Log what comes in and what goes out — this is what drives net income, the expense breakdown and your cash runway."
        action={<TransactionDialog />}
      />
    );
  }

  return (
    <>
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
                <p className="truncate text-xs text-muted-foreground">
                  {formatDateShort(t.occurredOn)}
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
                aria-label={`Edit ${t.category}`}
                onClick={() => setEditing(t)}
                className="text-muted-foreground"
              >
                <Pencil className="size-4" />
              </Button>
              <DeleteButton
                label={t.category}
                detail={`${t.type === "income" ? "Income" : "Expense"} of ${formatCurrency(
                  Number(t.amount),
                )} on ${formatDateShort(t.occurredOn)}`}
                onConfirm={() => deleteTransaction.mutate(t.id)}
              />
            </li>
          );
        })}
      </ul>

      {editing && (
        <TransactionDialog
          editing={editing}
          open
          onOpenChange={(next) => {
            if (!next) setEditing(undefined);
          }}
        />
      )}
    </>
  );
}
