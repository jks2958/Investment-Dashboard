import { Bitcoin, Landmark, Layers, TrendingUp, Wallet } from "lucide-react";
import { Link } from "wouter";

import { AllocationChart, type AllocationSlice } from "@/components/allocation-chart";
import { ExpensesCard } from "@/components/expenses-card";
import { HeroAssetsCard } from "@/components/hero-assets-card";
import { MiniStatCard } from "@/components/mini-stat-card";
import { NetIncomeCard } from "@/components/net-income-card";
import { Card } from "@/components/ui/card";
import { usePortfolioTotals } from "@/hooks/use-portfolio-totals";

const ASSET_TYPE_LABEL: Record<AllocationSlice["key"], string> = {
  stock: "Stocks",
  fund: "Funds",
  crypto: "Crypto",
  cash: "Cash",
};

export function DashboardPage() {
  const { isLoading, totalAssets, totalCash, holdingsValue, valueByType, seriesFor } =
    usePortfolioTotals();

  const allocation: AllocationSlice[] = (
    ["stock", "fund", "crypto", "cash"] as const
  ).map((key) => ({ key, label: ASSET_TYPE_LABEL[key], value: valueByType[key] }));

  function delta(current: number, key: "stock" | "fund" | "crypto" | "cash") {
    const series = seriesFor(key, current);
    const first = series[0];
    if (first === undefined || first <= 0) return undefined;
    return ((current - first) / first) * 100;
  }

  if (isLoading) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <HeroAssetsCard
            totalAssets={totalAssets}
            cashValue={totalCash}
            investmentsValue={holdingsValue}
          />
          <NetIncomeCard />
          <ExpensesCard />
        </div>

        <Card className="lg:row-span-1">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-positive/15 text-positive">
              <Wallet className="size-4" />
            </span>
            <h2 className="text-base font-semibold">Wealth Distribution</h2>
          </div>
          <AllocationChart data={allocation} />
          <Link href="/stocks" className="text-sm font-medium text-primary hover:underline">
            View full breakdown →
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStatCard
          id="cash"
          label="Cash"
          value={valueByType.cash}
          delta={delta(valueByType.cash, "cash")}
          color="var(--trend-cash)"
          icon={Landmark}
          series={seriesFor("cash", valueByType.cash)}
        />
        <MiniStatCard
          id="stocks"
          label="Stocks"
          value={valueByType.stock}
          delta={delta(valueByType.stock, "stock")}
          color="var(--trend-stock)"
          icon={TrendingUp}
          series={seriesFor("stock", valueByType.stock)}
        />
        <MiniStatCard
          id="funds"
          label="Funds"
          value={valueByType.fund}
          delta={delta(valueByType.fund, "fund")}
          color="var(--trend-fund)"
          icon={Layers}
          series={seriesFor("fund", valueByType.fund)}
        />
        <MiniStatCard
          id="crypto"
          label="Crypto"
          value={valueByType.crypto}
          delta={delta(valueByType.crypto, "crypto")}
          color="var(--trend-crypto)"
          icon={Bitcoin}
          series={seriesFor("crypto", valueByType.crypto)}
        />
      </div>
    </div>
  );
}
