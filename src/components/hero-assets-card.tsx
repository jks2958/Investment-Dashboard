import { CreditCard } from "lucide-react";

import { formatCurrency } from "@/lib/format";

export function HeroAssetsCard({
  totalAssets,
  cashValue,
  investmentsValue,
  otherValue = 0,
}: {
  totalAssets: number;
  cashValue: number;
  investmentsValue: number;
  otherValue?: number;
}) {
  const pct = (value: number) => (totalAssets > 0 ? (value / totalAssets) * 100 : 0);

  const stats = [
    { label: "Cash", value: cashValue },
    { label: "Investments", value: investmentsValue },
    ...(otherValue > 0 ? [{ label: "Other", value: otherValue }] : []),
  ];

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
          <p className="text-sm font-medium opacity-90">Total Assets</p>
          <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
            <CreditCard className="size-4.5" />
          </span>
        </div>

        <p className="text-4xl font-semibold tracking-tight">{formatCurrency(totalAssets)}</p>

        <div className="flex justify-between gap-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-sm opacity-80">{stat.label}</p>
              <p className="text-lg font-semibold">{formatCurrency(stat.value)}</p>
              <p className="text-xs opacity-70">{pct(stat.value).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
