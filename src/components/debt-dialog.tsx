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
import { useCreateDebt, useUpdateDebt } from "@/hooks/use-debts";
import { MoneyInput } from "@/components/money-input";
import type { Debt, DebtKind, EntryCurrency } from "@/lib/api";
import { todayIso } from "@/lib/date-range";
import { DEBT_KINDS, DEBT_KIND_LABEL } from "@/lib/liabilities";

export function DebtDialog({
  editing,
  open,
  onOpenChange,
}: {
  editing?: Debt;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setOpen, controlled] = useDialogOpen(open, onOpenChange);
  const [name, setName] = React.useState("");
  const [kind, setKind] = React.useState<DebtKind>("credit_card");
  const [lender, setLender] = React.useState("");
  const [balance, setBalance] = React.useState("");
  const [currency, setCurrency] = React.useState<EntryCurrency>("USD");
  const [interestRate, setInterestRate] = React.useState("");
  const [monthlyPayment, setMonthlyPayment] = React.useState("");
  const [startedOn, setStartedOn] = React.useState("");
  const [payoffTargetOn, setPayoffTargetOn] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const create = useCreateDebt();
  const update = useUpdateDebt();

  /** Optional numerics come back as strings or null; "" is the empty field. */
  const num = (v: string | null | undefined) => (v === null || v === undefined ? "" : String(Number(v)));

  useFormReset(isOpen, () => {
    setName(editing?.name ?? "");
    setKind(editing?.kind ?? "credit_card");
    setLender(editing?.lender ?? "");
    setBalance(num(editing?.nativeBalance ?? editing?.balance));
    setCurrency(editing?.currency ?? "USD");
    setInterestRate(num(editing?.interestRate));
    setMonthlyPayment(num(editing?.nativeMonthlyPayment ?? editing?.monthlyPayment));
    setStartedOn(editing?.startedOn ?? "");
    setPayoffTargetOn(editing?.payoffTargetOn ?? "");
    setError(null);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      name,
      kind,
      balance: Number(balance),
      currency,
      ...(lender ? { lender } : {}),
      ...(interestRate ? { interestRate: Number(interestRate) } : {}),
      ...(monthlyPayment ? { monthlyPayment: Number(monthlyPayment) } : {}),
      ...(startedOn ? { startedOn } : {}),
      ...(payoffTargetOn ? { payoffTargetOn } : {}),
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
      noun="debt"
      trigger={editing || controlled ? undefined : <Button size="sm">Add debt</Button>}
      open={isOpen}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      pending={create.isPending || update.isPending}
      error={error}
    >
      <div className="space-y-1.5">
        <Label htmlFor="debtName">Name</Label>
        <Input
          id="debtName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Home mortgage"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="debtKind">Type</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as DebtKind)}>
            <SelectTrigger id="debtKind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEBT_KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {DEBT_KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="debtLender">Lender</Label>
          <Input
            id="debtLender"
            value={lender}
            onChange={(e) => setLender(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <MoneyInput
        id="debtBalance"
        label="Balance owed"
        value={balance}
        onValueChange={setBalance}
        currency={currency}
        onCurrencyChange={setCurrency}
        required
        hint="Rate and monthly payment are read in this same currency."
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="debtRate">Rate %</Label>
          <Input
            id="debtRate"
            type="number"
            step="any"
            min="0"
            max="200"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="APR"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="debtPayment">Monthly</Label>
          <Input
            id="debtPayment"
            type="number"
            step="any"
            min="0"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
            placeholder="Payment"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="debtStarted">Started on</Label>
          <Input
            id="debtStarted"
            type="date"
            value={startedOn}
            onChange={(e) => setStartedOn(e.target.value)}
            max={todayIso()}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="debtPayoff">Target payoff</Label>
          <Input
            id="debtPayoff"
            type="date"
            value={payoffTargetOn}
            onChange={(e) => setPayoffTargetOn(e.target.value)}
          />
        </div>
      </div>
    </FormDialog>
  );
}
