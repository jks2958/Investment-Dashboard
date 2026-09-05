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
import { useCreateOtherAsset } from "@/hooks/use-other-assets";
import { todayIso } from "@/lib/date-range";

export function AddOtherAssetDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [value, setValue] = React.useState("");
  const [acquiredOn, setAcquiredOn] = React.useState(todayIso());
  const [error, setError] = React.useState<string | null>(null);
  const create = useCreateOtherAsset();

  function reset() {
    setName("");
    setValue("");
    setAcquiredOn(todayIso());
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        name,
        value: Number(value),
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
          Add other asset
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add other asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Car, real estate, collectibles…"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              step="any"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assetAcquiredOn">Acquired on</Label>
            <Input
              id="assetAcquiredOn"
              type="date"
              max={todayIso()}
              value={acquiredOn}
              onChange={(e) => setAcquiredOn(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Adding…" : "Add asset"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
