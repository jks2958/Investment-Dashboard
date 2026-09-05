import * as React from "react";
import { Boxes, Pencil } from "lucide-react";

import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/empty-state";
import { OtherAssetDialog } from "@/components/other-asset-dialog";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useDeleteOtherAsset, useOtherAssets } from "@/hooks/use-other-assets";
import type { OtherAsset } from "@/lib/api";
import { formatDateShort } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";

export function OtherAssetsList() {
  const { data: assets, isLoading } = useOtherAssets();
  const deleteAsset = useDeleteOtherAsset();
  const [editing, setEditing] = React.useState<OtherAsset | undefined>();

  if (isLoading) return <ListSkeleton rows={2} />;

  if (!assets || assets.length === 0) {
    return (
      <EmptyState
        icon={Boxes}
        title="No other assets yet"
        description="A car, property, or anything else of value. It counts towards net worth but isn't priced automatically."
        action={<OtherAssetDialog />}
      />
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {assets.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="font-medium">{a.name}</p>
              {a.acquiredOn && (
                <p className="text-xs text-muted-foreground">
                  Acquired {formatDateShort(a.acquiredOn)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <p className="mr-2 font-medium tabular-nums">{formatCurrency(Number(a.value))}</p>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${a.name}`}
                onClick={() => setEditing(a)}
                className="text-muted-foreground"
              >
                <Pencil className="size-4" />
              </Button>
              <DeleteButton
                label={a.name}
                detail={`Valued at ${formatCurrency(Number(a.value))}`}
                onConfirm={() => deleteAsset.mutate(a.id)}
              />
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <OtherAssetDialog
          editing={editing}
          open
          onOpenChange={(next) => {
            if (!next) setEditing(undefined);
          }}
        />
      )}
    </>
  );
}
