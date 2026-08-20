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
import { useCreateWishlistItem } from "@/hooks/use-wishlist";
import type { AssetType } from "@/lib/api";

export function AddWishlistDialog() {
  const [open, setOpen] = React.useState(false);
  const [symbol, setSymbol] = React.useState("");
  const [assetType, setAssetType] = React.useState<AssetType>("stock");
  const [targetPrice, setTargetPrice] = React.useState("");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const create = useCreateWishlistItem();

  function reset() {
    setSymbol("");
    setAssetType("stock");
    setTargetPrice("");
    setNote("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        symbol,
        assetType,
        targetPrice: targetPrice ? Number(targetPrice) : undefined,
        note: note || undefined,
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
        <Button size="sm">Add to wishlist</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to wishlist</DialogTitle>
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
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="fund">Fund / ETF</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetPrice">Target price (optional)</Label>
            <Input
              id="targetPrice"
              type="number"
              step="any"
              min="0"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Adding…" : "Add to wishlist"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
