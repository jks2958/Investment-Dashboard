import * as React from "react";
import { Landmark, Pencil } from "lucide-react";

import { DebtDialog } from "@/components/debt-dialog";
import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useDebts, useDeleteDebt } from "@/hooks/use-debts";
import type { Debt } from "@/lib/api";
import { formatDateShort } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";
import { DEBT_KIND_LABEL } from "@/lib/liabilities";

export function DebtsList() {
  const { data: debts, isLoading } = useDebts();
  const deleteDebt = useDeleteDebt();
  const [editing, setEditing] = React.useState<Debt | undefined>();

  if (isLoading) return <ListSkeleton rows={3} />;

  if (!debts || debts.length === 0) {
    return (
      <EmptyState
        icon={Landmark}
        title="Nothing owed"
        description="Add a mortgage, loan or card balance. Debts are subtracted from your net worth, so the sidebar figure stays honest."
        action={<DebtDialog />}
      />
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {debts.map((debt) => {
          const rate = debt.interestRate !== null ? Number(debt.interestRate) : null;
          const payment = debt.monthlyPayment !== null ? Number(debt.monthlyPayment) : null;

          const meta = [
            DEBT_KIND_LABEL[debt.kind],
            debt.lender,
            rate !== null ? `${rate}% APR` : null,
            payment !== null ? `${formatCurrency(payment)}/mo` : null,
            debt.payoffTargetOn ? `target ${formatDateShort(debt.payoffTargetOn)}` : null,
          ].filter(Boolean);

          return (
            <li key={debt.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium">{debt.name}</p>
                <p className="truncate text-xs text-muted-foreground">{meta.join(" · ")}</p>
              </div>
              <div className="flex items-center gap-1">
                <p className="mr-2 font-medium tabular-nums text-destructive">
                  −{formatCurrency(Number(debt.balance))}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${debt.name}`}
                  onClick={() => setEditing(debt)}
                  className="text-muted-foreground"
                >
                  <Pencil className="size-4" />
                </Button>
                <DeleteButton
                  label={debt.name}
                  detail={`${formatCurrency(Number(debt.balance))} owed`}
                  onConfirm={() => deleteDebt.mutate(debt.id)}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {editing && (
        <DebtDialog
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
