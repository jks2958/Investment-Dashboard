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
import { useCreateHolding } from "@/hooks/use-holdings";
import type { AssetType } from "@/lib/api";

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "fund", label: "Fund / ETF" },
  { value: "crypto", label: "Crypto" },
];

export function AddHoldingDialog() {
  const [open, setOpen] = React.useState(false);
  const [symbol, setSymbol] = React.useState("");
  const [assetType, setAssetType] = React.useState<AssetType>("stock");
  const [quantity, setQuantity] = React.useState("");
  const [avgCostBasis, setAvgCostBasis] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const create = useCreateHolding();

  function reset() {
    setSymbol("");
    setAssetType("stock");
    setQuantity("");
    setAvgCostBasis("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        symbol,
        assetType,
        quantity: Number(quantity),
        avgCostBasis: Number(avgCostBasis),
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
        <Button size="sm">Add holding</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add holding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="symbol">
              Symbol{assetType === "crypto" ? " (CoinGecko id, e.g. bitcoin)" : ""}
            </Label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder={assetType === "crypto" ? "bitcoin" : "AAPL"}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assetType">Type</Label>
            <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)}>
              <SelectTrigger id="assetType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avgCostBasis">Avg. cost / unit</Label>
              <Input
                id="avgCostBasis"
                type="number"
                step="any"
                min="0"
                value={avgCostBasis}
                onChange={(e) => setAvgCostBasis(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Adding…" : "Add holding"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
