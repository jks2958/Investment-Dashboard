import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDeleteHolding, useHoldings } from "@/hooks/use-holdings";
import type { AssetType } from "@/lib/api";
import { elapsedSince, formatDateShort } from "@/lib/date-range";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const ASSET_TYPE_LABEL: Record<string, string> = {
  stock: "Stock",
  fund: "Fund",
  crypto: "Crypto",
};

export function HoldingsList({ filterType }: { filterType?: AssetType }) {
  const { data: allHoldings, isLoading } = useHoldings();
  const deleteHolding = useDeleteHolding();

  const holdings = filterType
    ? allHoldings?.filter((h) => h.assetType === filterType)
    : allHoldings;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!holdings || holdings.length === 0) {
    return <p className="text-sm text-muted-foreground">No holdings yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {holdings.map((h) => {
        const quantity = Number(h.quantity);
        const costBasis = quantity * Number(h.avgCostBasis);
        const price = h.lastPrice !== null ? Number(h.lastPrice) : null;
        const value = price !== null ? quantity * price : costBasis;
        const gainPct = costBasis > 0 ? ((value - costBasis) / costBasis) * 100 : 0;

        return (
          <li key={h.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium">{h.symbol.toUpperCase()}</p>
              <p className="text-xs text-muted-foreground">
                {ASSET_TYPE_LABEL[h.assetType]} · {quantity} units
                {price === null && " · price unavailable"}
              </p>
              {h.acquiredOn && (
                <p className="text-xs text-muted-foreground">
                  Bought {formatDateShort(h.acquiredOn)}
                  {(() => {
                    const held = elapsedSince(h.acquiredOn);
                    return held ? ` · held ${held}` : "";
                  })()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium tabular-nums">{formatCurrency(value)}</p>
                {price !== null && (
                  <p
                    className={cn(
                      "text-xs tabular-nums",
                      gainPct >= 0 ? "text-positive" : "text-destructive",
                    )}
                  >
                    {formatPercent(gainPct)}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${h.symbol}`}
                onClick={() => deleteHolding.mutate(h.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
