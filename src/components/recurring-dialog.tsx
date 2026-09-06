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
import { useCreateRecurring, useUpdateRecurring } from "@/hooks/use-recurring";
import { MoneyInput } from "@/components/money-input";
import type {
  EntryCurrency,
  Recurrence,
  RecurringTransaction,
  TransactionType,
} from "@/lib/api";
import { todayIso } from "@/lib/date-range";
import { useCategories } from "@/hooks/use-categories";

const RECURRENCE_LABEL: Record<Recurrence, string> = {
  monthly: "Every month",
  quarterly: "Every 3 months",
  yearly: "Every year",
};

export function RecurringDialog({
  editing,
  open,
  onOpenChange,
}: {
  editing?: RecurringTransaction;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setOpen, controlled] = useDialogOpen(open, onOpenChange);
  const [type, setType] = React.useState<TransactionType>("expense");
  const [category, setCategory] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [currency, setCurrency] = React.useState<EntryCurrency>("USD");
  const [recurrence, setRecurrence] = React.useState<Recurrence>("monthly");
  const [startsOn, setStartsOn] = React.useState(todayIso());
  const [endsOn, setEndsOn] = React.useState("");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const { data: knownCategories } = useCategories();

  const create = useCreateRecurring();
  const update = useUpdateRecurring();

  useFormReset(isOpen, () => {
    setType(editing?.type ?? "expense");
    setCategory(editing?.category ?? "");
    setAmount(editing ? String(Number(editing.nativeAmount ?? editing.amount)) : "");
    setCurrency(editing?.currency ?? "USD");
    setRecurrence(editing?.recurrence ?? "monthly");
    setStartsOn(editing?.startsOn ?? todayIso());
    setEndsOn(editing?.endsOn ?? "");
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
      currency,
      recurrence,
      startsOn,
      ...(endsOn ? { endsOn } : {}),
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
      noun="recurring entry"
      trigger={
        editing || controlled ? undefined : (
          <Button size="sm" variant="outline">
            Add recurring
          </Button>
        )
      }
      open={isOpen}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      pending={create.isPending || update.isPending}
      error={error}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="recType">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
            <SelectTrigger id="recType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="recRepeat">Repeats</Label>
          <Select value={recurrence} onValueChange={(v) => setRecurrence(v as Recurrence)}>
            <SelectTrigger id="recRepeat">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(RECURRENCE_LABEL) as Recurrence[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {RECURRENCE_LABEL[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recCategory">Category</Label>
        <Input
          id="recCategory"
          list="known-categories"
          autoCapitalize="none"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={type === "expense" ? "Rent" : "Salary"}
          required
        />
        {/* Native datalist rather than a custom combobox: it autocompletes on
            iOS without extra state, and the server folds case differences
            anyway, so picking from the list is a convenience not a guard. */}
        <datalist id="known-categories">
          {(knownCategories ?? []).map((c) => (
            <option key={c.category} value={c.category} />
          ))}
        </datalist>
      </div>

      <MoneyInput
        id="recAmount"
        label="Amount"
        value={amount}
        onValueChange={setAmount}
        currency={currency}
        onCurrencyChange={setCurrency}
        required
      />
      <div className="space-y-1.5">
        <Label htmlFor="recStarts">First due</Label>
        <Input
          id="recStarts"
          type="date"
          value={startsOn}
          onChange={(e) => setStartsOn(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recEnds">Ends on (optional)</Label>
        <Input
          id="recEnds"
          type="date"
          value={endsOn}
          onChange={(e) => setEndsOn(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Nothing is written to your log automatically — due entries wait for you to confirm them.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="recNote">Note (optional)</Label>
        <Input id="recNote" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </FormDialog>
  );
}
