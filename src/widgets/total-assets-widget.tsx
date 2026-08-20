import { HeroAssetsCard } from "@/components/hero-assets-card";
import { usePortfolioTotals } from "@/hooks/use-portfolio-totals";

export function TotalAssetsWidget() {
  const { totalAssets, totalCash, totalOther, holdingsValue } = usePortfolioTotals();

  return (
    <HeroAssetsCard
      totalAssets={totalAssets}
      cashValue={totalCash}
      investmentsValue={holdingsValue}
      otherValue={totalOther}
    />
  );
}
