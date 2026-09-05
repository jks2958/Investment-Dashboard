import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCashAccounts, useDeleteCashAccount } from "@/hooks/use-cash";
import { formatDateShort } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";

export function CashList() {
  const { data: accounts, isLoading } = useCashAccounts();
  const deleteAccount = useDeleteCashAccount();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!accounts || accounts.length === 0) {
    return <p className="text-sm text-muted-foreground">No cash accounts yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {accounts.map((a) => (
        <li key={a.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="font-medium">{a.name}</p>
            {a.acquiredOn && (
              <p className="text-xs text-muted-foreground">
                Opened {formatDateShort(a.acquiredOn)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="font-medium tabular-nums">{formatCurrency(Number(a.balance))}</p>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${a.name}`}
              onClick={() => deleteAccount.mutate(a.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
