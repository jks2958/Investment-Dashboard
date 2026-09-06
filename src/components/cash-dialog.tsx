import * as React from "react";

import { FormDialog, useDialogOpen, useFormReset } from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCashAccount, useUpdateCashAccount } from "@/hooks/use-cash";
import { MoneyInput } from "@/components/money-input";
import type { CashAccount, EntryCurrency } from "@/lib/api";
import { todayIso } from "@/lib/date-range";

export function CashDialog({
  editing,
  open,
  onOpenChange,
}: {
  editing?: CashAccount;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setOpen, controlled] = useDialogOpen(open, onOpenChange);
  const [name, setName] = React.useState("");
  const [balance, setBalance] = React.useState("");
  const [currency, setCurrency] = React.useState<EntryCurrency>("USD");
  const [acquiredOn, setAcquiredOn] = React.useState(todayIso());
  const [error, setError] = React.useState<string | null>(null);

  const create = useCreateCashAccount();
  const update = useUpdateCashAccount();

  useFormReset(isOpen, () => {
    setName(editing?.name ?? "");
    // The figure as typed, not the converted one — reopening a rupee account
    // should show the rupees back.
    setBalance(editing ? String(Number(editing.nativeBalance ?? editing.balance)) : "");
    setCurrency(editing?.currency ?? "USD");
    setAcquiredOn(editing?.acquiredOn ?? todayIso());
    setError(null);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      name,
      balance: Number(balance),
      currency,
      ...(acquiredOn ? { acquiredOn } : {}),
    };
    try {
      if (editing) await update.mutateAsync({ id: editing.id, input });
      else await create.mutateAsync(input);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <FormDialog
      mode={editing ? "edit" : "create"}
      noun="cash account"
      submitLabel="Add account"
      trigger={
        editing || controlled ? undefined : (
          <Button size="sm" variant="outline">
            Add cash account
          </Button>
        )
      }
      open={isOpen}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      pending={create.isPending || update.isPending}
      error={error}
    >
      <div className="space-y-1.5">
        <Label htmlFor="cashName">Name</Label>
        <Input
          id="cashName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Checking"
          required
        />
      </div>
      <MoneyInput
        id="cashBalance"
        label="Balance"
        value={balance}
        onValueChange={setBalance}
        currency={currency}
        onCurrencyChange={setCurrency}
        required
      />
      <div className="space-y-1.5">
        <Label htmlFor="cashAcquiredOn">Opened on</Label>
        <Input
          id="cashAcquiredOn"
          type="date"
          max={todayIso()}
          value={acquiredOn}
          onChange={(e) => setAcquiredOn(e.target.value)}
        />
      </div>
    </FormDialog>
  );
}
