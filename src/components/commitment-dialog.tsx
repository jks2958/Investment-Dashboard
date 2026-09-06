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
import { useCreateCommitment, useUpdateCommitment } from "@/hooks/use-commitments";
import { MoneyInput } from "@/components/money-input";
import type {
  Commitment,
  CommitmentCategory,
  CommitmentCertainty,
  EntryCurrency,
} from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import {
  CERTAINTIES,
  CERTAINTY_LABEL,
  COMMITMENT_CATEGORIES,
  COMMITMENT_CATEGORY_LABEL,
} from "@/lib/liabilities";

export function CommitmentDialog({
  editing,
  open,
  onOpenChange,
}: {
  editing?: Commitment;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setOpen, controlled] = useDialogOpen(open, onOpenChange);
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState<CommitmentCategory>("education");
  const [amount, setAmount] = React.useState("");
  const [currency, setCurrency] = React.useState<EntryCurrency>("USD");
  const [dueOn, setDueOn] = React.useState("");
  const [recurringYears, setRecurringYears] = React.useState("1");
  const [certainty, setCertainty] = React.useState<CommitmentCertainty>("confirmed");
  const [fundedAmount, setFundedAmount] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const create = useCreateCommitment();
  const update = useUpdateCommitment();

  const years = Math.max(Number(recurringYears) || 1, 1);
  const perYear = Number(amount) || 0;
  const total = perYear * years;

  useFormReset(isOpen, () => {
    setName(editing?.name ?? "");
    setCategory(editing?.category ?? "education");
    setAmount(editing ? String(Number(editing.nativeAmount ?? editing.amount)) : "");
    setCurrency(editing?.currency ?? "USD");
    setDueOn(editing?.dueOn ?? "");
    setRecurringYears(String(editing?.recurringYears ?? 1));
    setCertainty(editing?.certainty ?? "confirmed");
    // A zero funded amount is the default, so show it as an empty field
    // rather than a "0" the user has to clear before typing.
    const funded = Number(editing?.nativeFundedAmount ?? editing?.fundedAmount ?? 0);
    setFundedAmount(editing && funded > 0 ? String(funded) : "");
    setError(null);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      name,
      category,
      amount: Number(amount),
      currency,
      dueOn,
      recurringYears: years,
      certainty,
      fundedAmount: fundedAmount ? Number(fundedAmount) : 0,
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
      noun="commitment"
      trigger={editing || controlled ? undefined : <Button size="sm">Add commitment</Button>}
      open={isOpen}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      pending={create.isPending || update.isPending}
      error={error}
    >
      <div className="space-y-1.5">
        <Label htmlFor="commitName">Name</Label>
        <Input
          id="commitName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="University fees"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="commitCategory">Category</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as CommitmentCategory)}
          >
            <SelectTrigger id="commitCategory">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMITMENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {COMMITMENT_CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="commitCertainty">How certain?</Label>
          <Select
            value={certainty}
            onValueChange={(v) => setCertainty(v as CommitmentCertainty)}
          >
            <SelectTrigger id="commitCertainty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CERTAINTIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CERTAINTY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <MoneyInput
        id="commitAmount"
        label="Amount"
        value={amount}
        onValueChange={setAmount}
        currency={currency}
        onCurrencyChange={setCurrency}
        required
        hint="“Saved so far” is read in the same currency."
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="commitYears">× years</Label>
          <Input
            id="commitYears"
            type="number"
            min="1"
            max="50"
            value={recurringYears}
            onChange={(e) => setRecurringYears(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="commitFunded">Saved so far</Label>
          <Input
            id="commitFunded"
            type="number"
            step="any"
            min="0"
            value={fundedAmount}
            onChange={(e) => setFundedAmount(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      {years > 1 && perYear > 0 && (
        <p className="text-xs text-muted-foreground">
          {formatCurrency(perYear)} a year for {years} years —{" "}
          <span className="font-medium text-foreground">{formatCurrency(total)}</span> in total.
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="commitDue">First payment due</Label>
        <Input
          id="commitDue"
          type="date"
          value={dueOn}
          onChange={(e) => setDueOn(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Future costs don't count against your net worth — they set the monthly saving needed
          to be ready in time.
        </p>
      </div>
    </FormDialog>
  );
}
