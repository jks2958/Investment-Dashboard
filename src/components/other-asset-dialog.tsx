import * as React from "react";

import { FormDialog, useDialogOpen, useFormReset } from "@/components/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateOtherAsset, useUpdateOtherAsset } from "@/hooks/use-other-assets";
import type { OtherAsset } from "@/lib/api";
import { todayIso } from "@/lib/date-range";

export function OtherAssetDialog({
  editing,
  open,
  onOpenChange,
}: {
  editing?: OtherAsset;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setOpen, controlled] = useDialogOpen(open, onOpenChange);
  const [name, setName] = React.useState("");
  const [value, setValue] = React.useState("");
  const [acquiredOn, setAcquiredOn] = React.useState(todayIso());
  const [error, setError] = React.useState<string | null>(null);

  const create = useCreateOtherAsset();
  const update = useUpdateOtherAsset();

  useFormReset(isOpen, () => {
    setName(editing?.name ?? "");
    setValue(editing ? String(Number(editing.value)) : "");
    setAcquiredOn(editing?.acquiredOn ?? todayIso());
    setError(null);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = { name, value: Number(value), ...(acquiredOn ? { acquiredOn } : {}) };
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
      noun="other asset"
      submitLabel="Add asset"
      trigger={
        editing || controlled ? undefined : (
          <Button size="sm" variant="outline">
            Add other asset
          </Button>
        )
      }
      open={isOpen}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      pending={create.isPending || update.isPending}
      error={error}
    >
      <div className="space-y-1.5">
        <Label htmlFor="assetName">Name</Label>
        <Input
          id="assetName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Car, real estate, collectibles…"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="assetValue">Value</Label>
        <Input
          id="assetValue"
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
    </FormDialog>
  );
}
