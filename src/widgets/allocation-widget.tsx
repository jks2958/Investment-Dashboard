import { Wallet } from "lucide-react";
import { Link } from "wouter";

import { AllocationChart, type AllocationSlice } from "@/components/allocation-chart";
import { Card } from "@/components/ui/card";
import { usePortfolioTotals } from "@/hooks/use-portfolio-totals";

const ASSET_TYPE_LABEL: Record<AllocationSlice["key"], string> = {
  stock: "Stocks",
  fund: "Funds",
  crypto: "Crypto",
  cash: "Cash",
  other: "Other Assets",
};

export function AllocationWidget() {
  const { valueByType } = usePortfolioTotals();

  const allocation: AllocationSlice[] = (
    ["stock", "fund", "crypto", "cash", "other"] as const
  ).map((key) => ({ key, label: ASSET_TYPE_LABEL[key], value: valueByType[key] }));

  return (
    <Card className="h-full overflow-auto">
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
  );
}
