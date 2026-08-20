import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDeleteOtherAsset, useOtherAssets } from "@/hooks/use-other-assets";
import { formatCurrency } from "@/lib/format";

export function OtherAssetsList() {
  const { data: assets, isLoading } = useOtherAssets();
  const deleteAsset = useDeleteOtherAsset();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!assets || assets.length === 0) {
    return <p className="text-sm text-muted-foreground">No other assets yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {assets.map((a) => (
        <li key={a.id} className="flex items-center justify-between gap-3 py-3">
          <p className="font-medium">{a.name}</p>
          <div className="flex items-center gap-3">
            <p className="font-medium tabular-nums">{formatCurrency(Number(a.value))}</p>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${a.name}`}
              onClick={() => deleteAsset.mutate(a.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
