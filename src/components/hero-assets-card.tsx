import { Zap } from "lucide-react";

import { formatCurrency } from "@/lib/format";

export function HeroAssetsCard({
  totalAssets,
  cashValue,
  investmentsValue,
}: {
  totalAssets: number;
  cashValue: number;
  investmentsValue: number;
}) {
  const cashPct = totalAssets > 0 ? (cashValue / totalAssets) * 100 : 0;
  const investmentsPct = totalAssets > 0 ? (investmentsValue / totalAssets) * 100 : 0;

  return (
    <div className="rounded-xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium opacity-90">Total Assets</p>
        <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
          <Zap className="size-4.5" />
        </span>
      </div>
      <p className="mt-2 text-4xl font-semibold tracking-tight">{formatCurrency(totalAssets)}</p>

      <div className="mt-6 flex gap-10">
        <div>
          <p className="text-sm opacity-80">Cash</p>
          <p className="text-lg font-semibold">{formatCurrency(cashValue)}</p>
          <p className="text-xs opacity-70">{cashPct.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-sm opacity-80">Investments</p>
          <p className="text-lg font-semibold">{formatCurrency(investmentsValue)}</p>
          <p className="text-xs opacity-70">{investmentsPct.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}
