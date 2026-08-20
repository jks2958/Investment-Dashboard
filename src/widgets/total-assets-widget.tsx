import { HeroAssetsCard } from "@/components/hero-assets-card";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { usePortfolioTotals } from "@/hooks/use-portfolio-totals";

export function TotalAssetsWidget() {
  const { totalAssets, totalCash, totalOther, holdingsValue } = usePortfolioTotals();
  const { data: settings } = useDashboardSettings();

  return (
    <HeroAssetsCard
      totalAssets={totalAssets}
      cashValue={totalCash}
      investmentsValue={holdingsValue}
      otherValue={totalOther}
      skin={settings?.cardSkin}
    />
  );
}
