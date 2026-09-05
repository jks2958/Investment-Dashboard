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
import { useCreateCashAccount } from "@/hooks/use-cash";
import { todayIso } from "@/lib/date-range";

export function AddCashDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [balance, setBalance] = React.useState("");
  const [acquiredOn, setAcquiredOn] = React.useState(todayIso());
  const [error, setError] = React.useState<string | null>(null);
  const create = useCreateCashAccount();

  function reset() {
    setName("");
    setBalance("");
    setAcquiredOn(todayIso());
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        name,
        balance: Number(balance),
        ...(acquiredOn ? { acquiredOn } : {}),
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
        <Button size="sm" variant="outline">
          Add cash account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add cash account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Checking"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="balance">Balance</Label>
            <Input
              id="balance"
              type="number"
              step="any"
              min="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
            />
          </div>
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Adding…" : "Add account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
