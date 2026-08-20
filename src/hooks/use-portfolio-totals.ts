import { useCashAccounts } from "@/hooks/use-cash";
import { useHoldings } from "@/hooks/use-holdings";
import { useSnapshots } from "@/hooks/use-snapshots";
import type { AssetType } from "@/lib/api";

export type AssetTypeKey = AssetType | "cash";

function percentDelta(current: number, previous: number): number | undefined {
  if (previous <= 0) return undefined;
  return ((current - previous) / previous) * 100;
}

export function usePortfolioTotals() {
  const { data: holdings, isLoading: holdingsLoading } = useHoldings();
  const { data: cashAccounts, isLoading: cashLoading } = useCashAccounts();
  const { data: snapshots } = useSnapshots();

  const totalCash = (cashAccounts ?? []).reduce((sum, a) => sum + Number(a.balance), 0);

  const valueByType: Record<AssetTypeKey, number> = {
    stock: 0,
    fund: 0,
    crypto: 0,
    cash: totalCash,
  };
  for (const h of holdings ?? []) {
    const quantity = Number(h.quantity);
    const price = h.lastPrice !== null ? Number(h.lastPrice) : Number(h.avgCostBasis);
    valueByType[h.assetType] += quantity * price;
  }

  const holdingsValue = valueByType.stock + valueByType.fund + valueByType.crypto;
  const totalInvested = (holdings ?? []).reduce(
    (sum, h) => sum + Number(h.quantity) * Number(h.avgCostBasis),
    0,
  );
  const totalAssets = holdingsValue + totalCash;
  const gainPct = totalInvested > 0 ? ((holdingsValue - totalInvested) / totalInvested) * 100 : undefined;

  const oldestSnapshot = snapshots?.[0];
  const netWorthDeltaPct = oldestSnapshot
    ? percentDelta(
        totalAssets,
        Number(oldestSnapshot.cashValue) +
          Number(oldestSnapshot.stockValue) +
          Number(oldestSnapshot.fundValue) +
          Number(oldestSnapshot.cryptoValue),
      )
    : undefined;

  function seriesFor(key: AssetTypeKey, currentValue: number): number[] {
    const history = (snapshots ?? []).map((s) => {
      switch (key) {
        case "stock":
          return Number(s.stockValue);
        case "fund":
          return Number(s.fundValue);
        case "crypto":
          return Number(s.cryptoValue);
        case "cash":
          return Number(s.cashValue);
      }
    });
    return [...history, currentValue];
  }

  return {
    isLoading: holdingsLoading || cashLoading,
    totalAssets,
    totalInvested,
    totalCash,
    holdingsValue,
    gainPct,
    netWorthDeltaPct,
    valueByType,
    seriesFor,
  };
}
