import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateDebt } from "@/hooks/use-debts";
import type { DebtKind } from "@/lib/api";
import { todayIso } from "@/lib/date-range";
import { DEBT_KINDS, DEBT_KIND_LABEL } from "@/lib/liabilities";

export function AddDebtDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [kind, setKind] = React.useState<DebtKind>("credit_card");
  const [lender, setLender] = React.useState("");
  const [balance, setBalance] = React.useState("");
  const [interestRate, setInterestRate] = React.useState("");
  const [monthlyPayment, setMonthlyPayment] = React.useState("");
  const [startedOn, setStartedOn] = React.useState("");
  const [payoffTargetOn, setPayoffTargetOn] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const create = useCreateDebt();

  function reset() {
    setName("");
    setKind("credit_card");
    setLender("");
    setBalance("");
    setInterestRate("");
    setMonthlyPayment("");
    setStartedOn("");
    setPayoffTargetOn("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        name,
        kind,
        balance: Number(balance),
        ...(lender ? { lender } : {}),
        ...(interestRate ? { interestRate: Number(interestRate) } : {}),
        ...(monthlyPayment ? { monthlyPayment: Number(monthlyPayment) } : {}),
        ...(startedOn ? { startedOn } : {}),
        ...(payoffTargetOn ? { payoffTargetOn } : {}),
      });
      reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">Add debt</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add debt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="debtBalance">Balance owed</Label>
              <Input
                id="debtBalance"
                type="number"
                step="any"
                min="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
            </div>
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

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Adding…" : "Add debt"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
