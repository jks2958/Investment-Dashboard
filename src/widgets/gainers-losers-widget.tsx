import { TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useHoldings } from "@/hooks/use-holdings";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const TOP_N = 3;

type Row = {
  id: number;
  symbol: string;
  value: number;
  pl: number;
  plPct: number;
};

function PlRow({ row }: { row: Row }) {
  const up = row.pl >= 0;
  return (
    <li className="flex items-center gap-3 text-sm">
      <span className="w-20 shrink-0 truncate font-medium">{row.symbol.toUpperCase()}</span>
      <span className="flex-1 truncate text-xs text-muted-foreground tabular-nums">
        {formatCurrency(row.value)}
      </span>
      <span
        className={cn(
          "shrink-0 text-right tabular-nums",
          up ? "text-positive" : "text-destructive",
        )}
      >
        {up ? "+" : "−"}
        {formatCurrency(Math.abs(row.pl))}
      </span>
      <span
        className={cn(
          "w-16 shrink-0 text-right text-xs font-medium tabular-nums",
          up ? "text-positive" : "text-destructive",
        )}
      >
        {formatPercent(row.plPct)}
      </span>
    </li>
  );
}

export function GainersLosersWidget() {
  const { data: holdings, isLoading } = useHoldings();

  const all = holdings ?? [];
  // A holding with no cached price would show a meaningless 0% move, so it's
  // counted separately rather than ranked.
  const priced: Row[] = all
    .filter((h) => h.lastPrice !== null && Number(h.avgCostBasis) > 0)
    .map((h) => {
      const quantity = Number(h.quantity);
      const cost = quantity * Number(h.avgCostBasis);
      const value = quantity * Number(h.lastPrice);
      return {
        id: h.id,
        symbol: h.symbol,
        value,
        pl: value - cost,
        plPct: ((value - cost) / cost) * 100,
      };
    });

  const unpriced = all.length - priced.length;
  const totalPl = priced.reduce((sum, r) => sum + r.pl, 0);
  const totalCost = priced.reduce((sum, r) => sum + (r.value - r.pl), 0);
  const totalPlPct = totalCost > 0 ? (totalPl / totalCost) * 100 : undefined;
  const totalUp = totalPl >= 0;

  const sorted = [...priced].sort((a, b) => b.plPct - a.plPct);
  const gainers = sorted.filter((r) => r.pl > 0).slice(0, TOP_N);
  const losers = sorted
    .filter((r) => r.pl < 0)
    .slice(-TOP_N)
    .reverse();

  return (
    <Card className="h-full overflow-auto">
      <p className="text-sm font-medium text-muted-foreground">Unrealized P/L</p>

      <div className="flex items-baseline gap-3">
        <p
          className={cn(
            "text-2xl font-semibold tabular-nums",
            totalUp ? "text-positive" : "text-destructive",
          )}
        >
          {totalUp ? "+" : "−"}
          {formatCurrency(Math.abs(totalPl))}
        </p>
        {totalPlPct !== undefined && (
          <span className={cn("text-xs font-medium", totalUp ? "text-positive" : "text-destructive")}>
            {formatPercent(totalPlPct)}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : priced.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {all.length === 0
            ? "Add holdings to track what's making and losing you money."
            : "No live prices yet — check that your market data API key is set."}
        </p>
      ) : (
        <div className="space-y-4">
          {gainers.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <TrendingUp className="size-3.5 text-positive" /> Gainers
              </p>
              <ul className="space-y-2">
                {gainers.map((row) => (
                  <PlRow key={row.id} row={row} />
                ))}
              </ul>
            </div>
          )}

          {losers.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <TrendingDown className="size-3.5 text-destructive" /> Losers
              </p>
              <ul className="space-y-2">
                {losers.map((row) => (
                  <PlRow key={row.id} row={row} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {unpriced > 0 && (
        <p className="text-xs text-muted-foreground">
          {unpriced} holding{unpriced === 1 ? "" : "s"} awaiting a price.
        </p>
      )}
    </Card>
  );
}
