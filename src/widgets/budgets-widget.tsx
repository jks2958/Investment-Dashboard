import * as React from "react";
import { Link } from "wouter";
import { PiggyBank } from "lucide-react";

import { BudgetDialog } from "@/components/budget-dialog";
import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { StatSkeleton } from "@/components/ui/skeleton";
import { useBudgets, useDeleteBudget } from "@/hooks/use-budgets";
import { useTransactions } from "@/hooks/use-transactions";
import type { Budget } from "@/lib/api";
import { budgetStatuses, budgetTotals } from "@/lib/budgets";
import { currentMonthLabel } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function BudgetsWidget({ manage = false }: { manage?: boolean }) {
  const { data: budgets, isLoading } = useBudgets();
  const { data: transactions } = useTransactions();
  const remove = useDeleteBudget();
  const [editing, setEditing] = React.useState<Budget | undefined>();

  const statuses = budgetStatuses(budgets, transactions);
  const totals = budgetTotals(statuses);

  return (
    <Card className="h-full overflow-auto">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <PiggyBank className="size-4" />
          </span>
          <p className="text-sm font-medium text-muted-foreground">Budgets</p>
        </div>
        {manage && <BudgetDialog />}
      </div>

      {isLoading ? (
        <StatSkeleton chart={false} />
      ) : statuses.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets set"
          description="Cap a category and this tracks the month against it, warning you at 80% rather than after you've blown it."
          action={<BudgetDialog />}
          className="py-4"
        />
      ) : (
        <>
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(totals.spent)}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                of {formatCurrency(totals.limit)}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              {currentMonthLabel()}
              {totals.overCount > 0 && (
                <span className="text-destructive">
                  {" · "}
                  {totals.overCount} over
                </span>
              )}
            </p>
          </div>

          <ul className="space-y-2.5">
            {statuses.map((status) => (
              <li key={status.budget.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{status.budget.category}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    <span
                      className={cn(
                        "tabular-nums",
                        status.over
                          ? "text-destructive"
                          : status.nearLimit
                            ? "text-warning"
                            : "text-muted-foreground",
                      )}
                    >
                      {formatCurrency(status.spent)} / {formatCurrency(status.limit)}
                    </span>
                    {manage && (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditing(status.budget)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <DeleteButton
                          label={`the ${status.budget.category} budget`}
                          detail={`Cap of ${formatCurrency(status.limit)}/month. Your transactions are kept`}
                          onConfirm={() => remove.mutate(status.budget.id)}
                        />
                      </>
                    )}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      status.over
                        ? "bg-destructive"
                        : status.nearLimit
                          ? "bg-warning"
                          : "bg-positive",
                    )}
                    style={{ width: `${status.percent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {status.over
                    ? `${formatCurrency(-status.remaining)} over`
                    : `${formatCurrency(status.remaining)} left`}
                </p>
              </li>
            ))}
          </ul>

          {!manage && (
            <Link
              href="/income-expense"
              className="mt-auto text-xs font-medium text-primary hover:underline"
            >
              Manage budgets →
            </Link>
          )}
        </>
      )}

      {editing && (
        <BudgetDialog
          editing={editing}
          open
          onOpenChange={(next) => {
            if (!next) setEditing(undefined);
          }}
        />
      )}
    </Card>
  );
}
