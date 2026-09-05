import { Link } from "wouter";
import { Scale } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { usePortfolioTotals, type AssetTypeKey } from "@/hooks/use-portfolio-totals";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const KEYS: AssetTypeKey[] = ["stock", "fund", "crypto", "cash", "other"];

const LABEL: Record<AssetTypeKey, string> = {
  stock: "Stocks",
  fund: "Funds",
  crypto: "Crypto",
  cash: "Cash",
  other: "Other Assets",
};

const COLOR_VAR: Record<AssetTypeKey, string> = {
  stock: "var(--trend-stock)",
  fund: "var(--trend-fund)",
  crypto: "var(--trend-crypto)",
  cash: "var(--trend-cash)",
  other: "var(--trend-other)",
};

/** Drift below this is treated as on-target rather than actionable. */
const TOLERANCE_PCT = 1;

export function AllocationDriftWidget() {
  const { valueByType, totalAssets } = usePortfolioTotals();
  const { data: settings } = useDashboardSettings();

  const targets = settings?.targets;
  const targetSum = targets ? KEYS.reduce((sum, k) => sum + (targets[k] ?? 0), 0) : 0;
  const configured = targetSum > 0;

  const rows = KEYS.map((key) => {
    const actualPct = totalAssets > 0 ? (valueByType[key] / totalAssets) * 100 : 0;
    const targetPct = targets?.[key] ?? 0;
    const drift = actualPct - targetPct;
    return {
      key,
      actualPct,
      targetPct,
      drift,
      // Positive = buy this much to reach target, negative = trim.
      amount: ((targetPct - actualPct) / 100) * totalAssets,
    };
  })
    .filter((r) => r.targetPct > 0 || r.actualPct > 0)
    .sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));

  return (
    <Card className="h-full overflow-auto">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Scale className="size-4" />
        </span>
        <p className="text-sm font-medium text-muted-foreground">Allocation Drift</p>
      </div>

      {!configured ? (
        <p className="text-sm text-muted-foreground">
          Set a target mix in Settings to see how far your portfolio has drifted from it.
        </p>
      ) : totalAssets === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add holdings or a cash balance to compare against your targets.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const onTarget = Math.abs(row.drift) < TOLERANCE_PCT;
            const over = row.drift > 0;
            return (
              <li key={row.key} className="space-y-1.5">
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: COLOR_VAR[row.key] }}
                    />
                    <span className="truncate">{LABEL[row.key]}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {row.actualPct.toFixed(1)}% / {row.targetPct.toFixed(0)}%
                  </span>
                  <span
                    className={cn(
                      "w-24 shrink-0 text-right text-xs font-medium tabular-nums",
                      onTarget
                        ? "text-muted-foreground"
                        : over
                          ? "text-destructive"
                          : "text-positive",
                    )}
                  >
                    {onTarget
                      ? "on target"
                      : `${over ? "trim" : "add"} ${formatCurrency(Math.abs(row.amount))}`}
                  </span>
                </div>

                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(row.actualPct, 100)}%`,
                      backgroundColor: COLOR_VAR[row.key],
                    }}
                  />
                  {row.targetPct > 0 && (
                    <span
                      className="absolute top-0 h-full w-0.5 bg-foreground/50"
                      style={{ left: `${Math.min(row.targetPct, 100)}%` }}
                      aria-hidden
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Link href="/settings" className="text-sm font-medium text-primary hover:underline">
        {configured ? "Edit target mix →" : "Set target mix →"}
      </Link>
    </Card>
  );
}
