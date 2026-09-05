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
import { useCreateHolding, useUpdateHolding } from "@/hooks/use-holdings";
import type { AssetType, Holding } from "@/lib/api";
import { todayIso } from "@/lib/date-range";

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "fund", label: "Fund / ETF" },
  { value: "crypto", label: "Crypto" },
];

export function HoldingDialog({
  lockType,
  editing,
  open,
  onOpenChange,
}: {
  lockType?: AssetType;
  /** Present = edit mode. The list passes open/onOpenChange with it. */
  editing?: Holding;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setOpen, controlled] = useDialogOpen(open, onOpenChange);
  const [symbol, setSymbol] = React.useState("");
  const [assetType, setAssetType] = React.useState<AssetType>(lockType ?? "stock");
  const [quantity, setQuantity] = React.useState("");
  const [avgCostBasis, setAvgCostBasis] = React.useState("");
  const [acquiredOn, setAcquiredOn] = React.useState(todayIso());
  const [error, setError] = React.useState<string | null>(null);

  const create = useCreateHolding();
  const update = useUpdateHolding();
  const mode = editing ? "edit" : "create";

  useFormReset(isOpen, () => {
    setSymbol(editing?.symbol ?? "");
    setAssetType(editing?.assetType ?? lockType ?? "stock");
    setQuantity(editing ? String(Number(editing.quantity)) : "");
    setAvgCostBasis(editing ? String(Number(editing.avgCostBasis)) : "");
    setAcquiredOn(editing?.acquiredOn ?? todayIso());
    setError(null);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      symbol,
      assetType,
      quantity: Number(quantity),
      avgCostBasis: Number(avgCostBasis),
      ...(acquiredOn ? { acquiredOn } : {}),
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
      mode={mode}
      noun="holding"
      trigger={editing || controlled ? undefined : <Button size="sm">Add holding</Button>}
      open={isOpen}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      pending={create.isPending || update.isPending}
      error={error}
    >
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
      {!lockType && (
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
      )}
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
      <div className="space-y-1.5">
        <Label htmlFor="acquiredOn">Purchase date</Label>
        <Input
          id="acquiredOn"
          type="date"
          max={todayIso()}
          value={acquiredOn}
          onChange={(e) => setAcquiredOn(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Set an earlier date to record something you bought in the past.
        </p>
      </div>
    </FormDialog>
  );
}
