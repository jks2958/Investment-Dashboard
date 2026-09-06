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
import { formatCurrency, nativeAmountNote } from "@/lib/format";
import { cn } from "@/lib/utils";

/** How many rows to reveal at a time. Long enough that most months fit in
 *  one page, short enough that a two-year log doesn't render at once. */
const PAGE_SIZE = 50;

export function TransactionsList({
  rows,
  isFiltered = false,
  onClearFilters,
}: {
  /** Pre-filtered rows. Omit to show everything the query holds. */
  rows?: Transaction[];
  isFiltered?: boolean;
  onClearFilters?: () => void;
}) {
  const { data: allTransactions, isLoading } = useTransactions();
  const deleteTransaction = useDeleteTransaction();
  const [editing, setEditing] = React.useState<Transaction | undefined>();
  const [visible, setVisible] = React.useState(PAGE_SIZE);

  const transactions = rows ?? allTransactions;

  // A new filter should start back at the top rather than keeping a page
  // count from a list that no longer exists.
  const count = transactions?.length ?? 0;
  React.useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [count, isFiltered]);

  if (isLoading) return <ListSkeleton rows={5} />;

  if (!transactions || transactions.length === 0) {
    return isFiltered ? (
      <EmptyState
        icon={Receipt}
        title="Nothing matches those filters"
        description="Try a wider month range, or clear the filters to see everything."
        action={
          onClearFilters && (
            <Button size="sm" variant="outline" onClick={onClearFilters}>
              Clear filters
            </Button>
          )
        }
      />
    ) : (
      <EmptyState
        icon={Receipt}
        title="No transactions yet"
        description="Log what comes in and what goes out — this is what drives net income, the expense breakdown and your cash runway."
        action={<TransactionDialog />}
      />
    );
  }

  const shown = transactions.slice(0, visible);
  const remaining = transactions.length - shown.length;

  return (
    <>
      <ul className="divide-y divide-border">
        {shown.map((t) => {
          const Icon = iconForCategory(t.category);
          return (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.category}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[
                    formatDateShort(t.occurredOn),
                    nativeAmountNote(t.currency, t.nativeAmount),
                    t.note,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
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

      {remaining > 0 && (
        <div className="pt-3 text-center">
          <Button variant="outline" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Show {Math.min(remaining, PAGE_SIZE)} more
          </Button>
          <p className="pt-2 text-xs text-muted-foreground">
            Showing {shown.length} of {transactions.length}
          </p>
        </div>
      )}

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
