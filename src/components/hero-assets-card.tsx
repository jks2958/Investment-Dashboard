import { CreditCard } from "lucide-react";

import { CARD_SKINS, type CardSkin } from "@/lib/card-skins";
import {
  convertFromUsd,
  formatCompactCurrency,
  formatCurrency,
  formatInCurrency,
  getMoneyConfig,
} from "@/lib/format";
import type { PriceAge } from "@/lib/price-freshness";
import { cn } from "@/lib/utils";

export function HeroAssetsCard({
  totalAssets,
  cashValue,
  investmentsValue,
  otherValue = 0,
  skin = "gold",
  priceAge,
}: {
  totalAssets: number;
  cashValue: number;
  investmentsValue: number;
  otherValue?: number;
  skin?: CardSkin;
  /** How old the oldest market price behind this figure is. */
  priceAge?: PriceAge;
}) {
  const pct = (value: number) => (totalAssets > 0 ? (value / totalAssets) * 100 : 0);
  const def = CARD_SKINS[skin];
  // Always show the total in both currencies — whichever isn't the active one
  // goes underneath as the equivalent.
  const money = getMoneyConfig();
  const secondaryCurrency = money.currency === "PKR" ? "USD" : "PKR";

  // Three columns of a seven-figure number overflow the card — PKR amounts are
  // ~280x their USD equivalent — so anything past a million goes compact.
  const statText = (value: number) =>
    Math.abs(convertFromUsd(value, money.currency, money.usdPkrRate)) >= 1_000_000
      ? formatCompactCurrency(value)
      : formatCurrency(value);

  const stats = [
    { label: "Cash", value: cashValue },
    { label: "Investments", value: investmentsValue },
    { label: "Other", value: otherValue },
  ];

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[28px] p-6 shadow-lg",
        def.textClass,
      )}
      style={{ background: def.gradient }}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">Total Assets</p>
            {/* Whether this number is four minutes or four days old changes
                what you'd do with it, so it says which. */}
            {priceAge && (
              <p className="text-xs opacity-70">
                {priceAge.stale ? "prices stale · " : "prices "}
                {priceAge.label}
              </p>
            )}
          </div>
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-full",
              def.badgeClass,
            )}
          >
            <CreditCard className="size-4.5" />
          </span>
        </div>

        <div>
          <p className="text-4xl font-semibold tracking-tight">{formatCurrency(totalAssets)}</p>
          <p className="mt-1 text-sm opacity-75">{formatInCurrency(totalAssets, secondaryCurrency)}</p>
        </div>

        <div className="flex justify-between gap-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-sm opacity-80">{stat.label}</p>
              <p className="text-lg font-semibold">{statText(stat.value)}</p>
              <p className="text-xs opacity-70">{pct(stat.value).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
