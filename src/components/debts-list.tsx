import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDebts, useDeleteDebt } from "@/hooks/use-debts";
import { formatDateShort } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";
import { DEBT_KIND_LABEL } from "@/lib/liabilities";

export function DebtsList() {
  const { data: debts, isLoading } = useDebts();
  const deleteDebt = useDeleteDebt();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!debts || debts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No debts recorded. Anything you add here is subtracted from your net worth.
      </p>
    );
  }

  return (
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
            <div className="flex items-center gap-3">
              <p className="font-medium tabular-nums text-destructive">
                −{formatCurrency(Number(debt.balance))}
              </p>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${debt.name}`}
                onClick={() => deleteDebt.mutate(debt.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
