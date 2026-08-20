import { CreditCard } from "lucide-react";

import { CARD_SKINS, type CardSkin } from "@/lib/card-skins";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function HeroAssetsCard({
  totalAssets,
  cashValue,
  investmentsValue,
  otherValue = 0,
  skin = "gold",
}: {
  totalAssets: number;
  cashValue: number;
  investmentsValue: number;
  otherValue?: number;
  skin?: CardSkin;
}) {
  const pct = (value: number) => (totalAssets > 0 ? (value / totalAssets) * 100 : 0);
  const def = CARD_SKINS[skin];

  const stats = [
    { label: "Cash", value: cashValue },
    { label: "Investments", value: investmentsValue },
    { label: "Other", value: otherValue },
  ];

  return (
    <div
      className={cn(
        "relative aspect-[1.586/1] w-full max-w-sm overflow-hidden rounded-[28px] p-6 shadow-lg",
        def.textClass,
      )}
      style={{ background: def.gradient }}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium opacity-90">Total Assets</p>
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-full",
              def.badgeClass,
            )}
          >
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
