import { AddCashDialog } from "@/components/add-cash-dialog";
import { AddHoldingDialog } from "@/components/add-holding-dialog";
import { AllocationChart, type AllocationSlice } from "@/components/allocation-chart";
import { CashList } from "@/components/cash-list";
import { HoldingsList } from "@/components/holdings-list";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCashAccounts } from "@/hooks/use-cash";
import { useHoldings } from "@/hooks/use-holdings";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";

const ASSET_TYPE_LABEL: Record<AllocationSlice["key"], string> = {
  stock: "Stocks",
  fund: "Funds",
  crypto: "Crypto",
  cash: "Cash",
};

export function DashboardPage() {
  const { logout } = useAuth();
  const { data: holdings } = useHoldings();
  const { data: cashAccounts } = useCashAccounts();

  const totalCash = (cashAccounts ?? []).reduce((sum, a) => sum + Number(a.balance), 0);

  const holdingsValue = (holdings ?? []).reduce((sum, h) => {
    const quantity = Number(h.quantity);
    const price = h.lastPrice !== null ? Number(h.lastPrice) : Number(h.avgCostBasis);
    return sum + quantity * price;
  }, 0);

  const totalInvested = (holdings ?? []).reduce(
    (sum, h) => sum + Number(h.quantity) * Number(h.avgCostBasis),
    0,
  );

  const totalAssets = holdingsValue + totalCash;
  const gainPct = totalInvested > 0 ? ((holdingsValue - totalInvested) / totalInvested) * 100 : 0;

  const valueByType: Record<AllocationSlice["key"], number> = {
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
  const allocation: AllocationSlice[] = (
    ["stock", "fund", "crypto", "cash"] as const
  ).map((key) => ({ key, label: ASSET_TYPE_LABEL[key], value: valueByType[key] }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Portfolio</h1>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total assets" value={formatCurrency(totalAssets)} />
        <StatCard label="Total invested" value={formatCurrency(totalInvested)} />
        <StatCard label="Cash balance" value={formatCurrency(totalCash)} />
        <StatCard
          label="Unrealized gain/loss"
          value={formatCurrency(holdingsValue - totalInvested)}
          delta={totalInvested > 0 ? gainPct : undefined}
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold">Portfolio allocation</h2>
        </CardHeader>
        <CardContent>
          <AllocationChart data={allocation} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold">Holdings</h2>
            <AddHoldingDialog />
          </CardHeader>
          <CardContent>
            <HoldingsList />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold">Cash accounts</h2>
            <AddCashDialog />
          </CardHeader>
          <CardContent>
            <CashList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
