import { HeroAssetsCard } from "@/components/hero-assets-card";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { useHoldings } from "@/hooks/use-holdings";
import { usePortfolioTotals } from "@/hooks/use-portfolio-totals";
import { oldestPriceAge } from "@/lib/price-freshness";

export function TotalAssetsWidget() {
  const { totalAssets, totalCash, totalOther, holdingsValue } = usePortfolioTotals();
  const { data: settings } = useDashboardSettings();
  const { data: holdings } = useHoldings();

  return (
    <HeroAssetsCard
      totalAssets={totalAssets}
      cashValue={totalCash}
      investmentsValue={holdingsValue}
      otherValue={totalOther}
      skin={settings?.cardSkin}
      priceAge={oldestPriceAge(holdings ?? [])}
    />
  );
}
