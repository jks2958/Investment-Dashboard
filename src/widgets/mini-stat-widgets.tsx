import { Bitcoin, Landmark, Layers, TrendingUp } from "lucide-react";

import { MiniStatCard } from "@/components/mini-stat-card";
import { usePortfolioTotals } from "@/hooks/use-portfolio-totals";

export function MiniCashWidget() {
  const { valueByType, deltaFor, seriesFor } = usePortfolioTotals();
  return (
    <MiniStatCard
      id="cash"
      label="Cash"
      value={valueByType.cash}
      delta={deltaFor("cash", valueByType.cash)}
      color="var(--trend-cash)"
      icon={Landmark}
      series={seriesFor("cash", valueByType.cash)}
    />
  );
}

export function MiniStocksWidget() {
  const { valueByType, deltaFor, seriesFor } = usePortfolioTotals();
  return (
    <MiniStatCard
      id="stocks"
      label="Stocks"
      value={valueByType.stock}
      delta={deltaFor("stock", valueByType.stock)}
      color="var(--trend-stock)"
      icon={TrendingUp}
      series={seriesFor("stock", valueByType.stock)}
    />
  );
}

export function MiniFundsWidget() {
  const { valueByType, deltaFor, seriesFor } = usePortfolioTotals();
  return (
    <MiniStatCard
      id="funds"
      label="Funds"
      value={valueByType.fund}
      delta={deltaFor("fund", valueByType.fund)}
      color="var(--trend-fund)"
      icon={Layers}
      series={seriesFor("fund", valueByType.fund)}
    />
  );
}

export function MiniCryptoWidget() {
  const { valueByType, deltaFor, seriesFor } = usePortfolioTotals();
  return (
    <MiniStatCard
      id="crypto"
      label="Crypto"
      value={valueByType.crypto}
      delta={deltaFor("crypto", valueByType.crypto)}
      color="var(--trend-crypto)"
      icon={Bitcoin}
      series={seriesFor("crypto", valueByType.crypto)}
    />
  );
}
