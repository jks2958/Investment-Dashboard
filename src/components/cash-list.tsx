import * as React from "react";
import { Landmark, Pencil } from "lucide-react";

import { CashDialog } from "@/components/cash-dialog";
import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useCashAccounts, useDeleteCashAccount } from "@/hooks/use-cash";
import type { CashAccount } from "@/lib/api";
import { formatDateShort } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";

export function CashList() {
  const { data: accounts, isLoading } = useCashAccounts();
  const deleteAccount = useDeleteCashAccount();
  const [editing, setEditing] = React.useState<CashAccount | undefined>();

  if (isLoading) return <ListSkeleton rows={2} />;

  if (!accounts || accounts.length === 0) {
    return (
      <EmptyState
        icon={Landmark}
        title="No cash accounts yet"
        description="Add your current and savings accounts — cash counts towards net worth and drives the runway figure."
        action={<CashDialog />}
      />
    );
  }

  return (
    <>
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
            <div className="flex items-center gap-1">
              <p className="mr-2 font-medium tabular-nums">{formatCurrency(Number(a.balance))}</p>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${a.name}`}
                onClick={() => setEditing(a)}
                className="text-muted-foreground"
              >
                <Pencil className="size-4" />
              </Button>
              <DeleteButton
                label={a.name}
                detail={`Balance ${formatCurrency(Number(a.balance))}`}
                onConfirm={() => deleteAccount.mutate(a.id)}
              />
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <CashDialog
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
