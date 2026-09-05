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
import { useCreateWishlistItem, useUpdateWishlistItem } from "@/hooks/use-wishlist";
import type { AssetType, WishlistItem } from "@/lib/api";

export function WishlistDialog({
  editing,
  open,
  onOpenChange,
}: {
  editing?: WishlistItem;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setOpen, controlled] = useDialogOpen(open, onOpenChange);
  const [symbol, setSymbol] = React.useState("");
  const [assetType, setAssetType] = React.useState<AssetType>("stock");
  const [targetPrice, setTargetPrice] = React.useState("");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const create = useCreateWishlistItem();
  const update = useUpdateWishlistItem();

  useFormReset(isOpen, () => {
    setSymbol(editing?.symbol ?? "");
    setAssetType(editing?.assetType ?? "stock");
    setTargetPrice(editing?.targetPrice ? String(Number(editing.targetPrice)) : "");
    setNote(editing?.note ?? "");
    setError(null);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      symbol,
      assetType,
      targetPrice: targetPrice ? Number(targetPrice) : undefined,
      note: note || undefined,
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
      noun="to wishlist"
      trigger={editing || controlled ? undefined : <Button size="sm">Add to wishlist</Button>}
      open={isOpen}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      pending={create.isPending || update.isPending}
      error={error}
    >
      <div className="space-y-1.5">
        <Label htmlFor="wlSymbol">
          Symbol{assetType === "crypto" ? " (CoinGecko id, e.g. bitcoin)" : ""}
        </Label>
        <Input
          id="wlSymbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder={assetType === "crypto" ? "bitcoin" : "AAPL"}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="wlAssetType">Type</Label>
        <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)}>
          <SelectTrigger id="wlAssetType">
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
        <Label htmlFor="wlTargetPrice">Target price (optional)</Label>
        <Input
          id="wlTargetPrice"
          type="number"
          step="any"
          min="0"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="wlNote">Note (optional)</Label>
        <Input id="wlNote" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </FormDialog>
  );
}
