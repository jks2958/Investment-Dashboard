import * as React from "react";

import { FormDialog, useDialogOpen, useFormReset } from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import type { Transaction, TransactionType } from "@/lib/api";
import { todayIso } from "@/lib/date-range";

export function TransactionDialog({
  editing,
  open,
  onOpenChange,
}: {
  editing?: Transaction;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setOpen, controlled] = useDialogOpen(open, onOpenChange);
  const [type, setType] = React.useState<TransactionType>("expense");
  const [category, setCategory] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [occurredOn, setOccurredOn] = React.useState(todayIso());
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const create = useCreateTransaction();
  const update = useUpdateTransaction();

  useFormReset(isOpen, () => {
    setType(editing?.type ?? "expense");
    setCategory(editing?.category ?? "");
    setAmount(editing ? String(Number(editing.amount)) : "");
    setOccurredOn(editing?.occurredOn ?? todayIso());
    setNote(editing?.note ?? "");
    setError(null);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      type,
      category,
      amount: Number(amount),
      occurredOn,
      ...(note ? { note } : {}),
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
      noun="transaction"
      trigger={editing || controlled ? undefined : <Button size="sm">Add transaction</Button>}
      open={isOpen}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      pending={create.isPending || update.isPending}
      error={error}
    >
      <div className="space-y-1.5">
        <Label htmlFor="txType">Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
          <SelectTrigger id="txType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="txCategory">Category</Label>
        <Input
          id="txCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={type === "expense" ? "Groceries" : "Salary"}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="txAmount">Amount</Label>
          <Input
            id="txAmount"
            type="number"
            step="any"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="txOccurredOn">Date</Label>
          <Input
            id="txOccurredOn"
            type="date"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="txNote">Note (optional)</Label>
        <Input id="txNote" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </FormDialog>
  );
}
