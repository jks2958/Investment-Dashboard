import * as React from "react";
import { LineChart, Pencil } from "lucide-react";

import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/empty-state";
import { HoldingDialog } from "@/components/holding-dialog";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useDeleteHolding, useHoldings } from "@/hooks/use-holdings";
import type { AssetType, Holding } from "@/lib/api";
import { elapsedSince, formatDateShort } from "@/lib/date-range";
import { formatCurrency, formatPercent } from "@/lib/format";
import { priceAge } from "@/lib/price-freshness";
import { cn } from "@/lib/utils";

const ASSET_TYPE_LABEL: Record<string, string> = {
  stock: "Stock",
  fund: "Fund",
  crypto: "Crypto",
};

const EMPTY_COPY: Record<string, string> = {
  stock: "Add the shares you own to see them valued at live prices and tracked over time.",
  fund: "Add your funds and ETFs to see them valued at live prices and tracked over time.",
  crypto: "Add your coins to see them valued at live prices and tracked over time.",
};

export function HoldingsList({ filterType }: { filterType?: AssetType }) {
  const { data: allHoldings, isLoading } = useHoldings();
  const deleteHolding = useDeleteHolding();
  const [editing, setEditing] = React.useState<Holding | undefined>();

  const holdings = filterType
    ? allHoldings?.filter((h) => h.assetType === filterType)
    : allHoldings;

  if (isLoading) return <ListSkeleton rows={4} />;

  if (!holdings || holdings.length === 0) {
    return (
      <EmptyState
        icon={LineChart}
        title="Nothing here yet"
        description={
          filterType
            ? EMPTY_COPY[filterType]
            : "Add a holding to see it valued at live prices and tracked over time."
        }
        action={<HoldingDialog lockType={filterType} />}
      />
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {holdings.map((h) => {
          const quantity = Number(h.quantity);
          const costBasis = quantity * Number(h.avgCostBasis);
          const price = h.lastPrice !== null ? Number(h.lastPrice) : null;
          const value = price !== null ? quantity * price : costBasis;
          const gainPct = costBasis > 0 ? ((value - costBasis) / costBasis) * 100 : 0;
          // Only surfaced when it's a problem: a third line reading "5m ago"
          // on every fresh row is noise, and the Total Assets card already
          // carries the always-on "as of" for the portfolio as a whole.
          const age = price !== null ? priceAge(h.priceFetchedAt) : undefined;
          const staleAge = age?.stale ? age : undefined;
          const held = h.acquiredOn ? elapsedSince(h.acquiredOn) : undefined;

          return (
            <li key={h.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium">{h.symbol.toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">
                  {ASSET_TYPE_LABEL[h.assetType]} · {quantity} units
                  {price === null && " · price unavailable"}
                </p>
                {h.acquiredOn && (
                  <p className="text-xs text-muted-foreground">
                    Bought {formatDateShort(h.acquiredOn)}
                    {held ? ` · held ${held}` : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div className="mr-2 text-right">
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
                  {staleAge && (
                    <p className="text-xs text-warning">stale · {staleAge.label}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${h.symbol}`}
                  onClick={() => setEditing(h)}
                  className="text-muted-foreground"
                >
                  <Pencil className="size-4" />
                </Button>
                <DeleteButton
                  label={h.symbol.toUpperCase()}
                  detail={`${quantity} units at ${formatCurrency(Number(h.avgCostBasis))} each`}
                  onConfirm={() => deleteHolding.mutate(h.id)}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {editing && (
        <HoldingDialog
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
