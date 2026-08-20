import { CreditCard } from "lucide-react";

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
    <div
      className="relative aspect-[1.586/1] w-full max-w-sm overflow-hidden rounded-[28px] p-6 text-white shadow-lg [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
      style={{
        background:
          "linear-gradient(135deg, var(--gold-from) 0%, var(--gold-via) 45%, var(--gold-to) 100%)",
      }}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="h-8 w-11 rounded-md bg-gradient-to-br from-white/70 to-white/30 shadow-inner ring-1 ring-black/10">
            <div className="grid h-full grid-cols-3 gap-px p-1 opacity-60">
              <div className="rounded-[1px] bg-black/20" />
              <div className="rounded-[1px] bg-black/20" />
              <div className="rounded-[1px] bg-black/20" />
              <div className="rounded-[1px] bg-black/20" />
              <div className="rounded-[1px] bg-black/20" />
              <div className="rounded-[1px] bg-black/20" />
            </div>
          </div>
          <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
            <CreditCard className="size-4.5" />
          </span>
        </div>

        <div>
          <p className="text-sm font-medium opacity-90">Total Assets</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">
            {formatCurrency(totalAssets)}
          </p>
        </div>

        <div className="flex gap-10">
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
    </div>
  );
}
