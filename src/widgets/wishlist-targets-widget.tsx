import { Link } from "wouter";
import { Target } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { WishlistDialog } from "@/components/wishlist-dialog";
import { Card } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/skeleton";
import { usePrices } from "@/hooks/use-prices";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function WishlistTargetsWidget() {
  const { data: items, isLoading: wishlistLoading } = useWishlist();
  const { data: prices, isLoading: pricesLoading } = usePrices();

  const priceBySymbol = new Map((prices ?? []).map((p) => [p.symbol, Number(p.lastPrice)]));

  const withTarget = (items ?? []).filter((i) => i.targetPrice !== null);
  const withoutTarget = (items ?? []).length - withTarget.length;

  // A wishlist target is a buy price, so "reached" means the market has come
  // down to it. Closest to target first; anything unpriced sinks to the end.
  const rows = withTarget
    .map((item) => {
      const target = Number(item.targetPrice);
      const price = priceBySymbol.get(item.symbol);
      const gapPct = price !== undefined ? ((price - target) / target) * 100 : undefined;
      return { item, target, price, gapPct, reached: price !== undefined && price <= target };
    })
    .sort((a, b) => {
      if (a.gapPct === undefined) return 1;
      if (b.gapPct === undefined) return -1;
      return Math.abs(a.gapPct) - Math.abs(b.gapPct);
    });

  const reachedCount = rows.filter((r) => r.reached).length;

  return (
    <Card className="h-full overflow-auto">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Target className="size-4" />
        </span>
        <p className="text-sm font-medium text-muted-foreground">Wishlist Targets</p>
      </div>

      {reachedCount > 0 && (
        <p className="text-sm font-medium text-positive">
          {reachedCount} at or below target
        </p>
      )}

      {wishlistLoading || pricesLoading ? (
        <ListSkeleton rows={3} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No targets set"
          description="Give a wishlist item a target buy price and this tracks how far the market is from it."
          action={<WishlistDialog />}
          className="py-4"
        />
      ) : (
        <ul className="space-y-3">
          {rows.map(({ item, target, price, gapPct, reached }) => (
            <li key={item.id} className="space-y-1.5">
              <div className="flex items-center gap-3 text-sm">
                <span className="w-16 shrink-0 truncate font-medium">
                  {item.symbol.toUpperCase()}
                </span>
                <span className="flex-1 truncate text-xs text-muted-foreground tabular-nums">
                  {price !== undefined ? formatCurrency(price) : "no price"} → {formatCurrency(target)}
                </span>
                {gapPct === undefined ? (
                  <span className="shrink-0 text-xs text-muted-foreground">—</span>
                ) : reached ? (
                  <span className="shrink-0 rounded-full bg-positive/15 px-2 py-0.5 text-xs font-medium text-positive">
                    At target
                  </span>
                ) : (
                  <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    {gapPct.toFixed(1)}% above
                  </span>
                )}
              </div>
              {gapPct !== undefined && (
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", reached ? "bg-positive" : "bg-primary")}
                    style={{
                      width: `${Math.max(0, Math.min(100, 100 - Math.min(Math.abs(gapPct), 100)))}%`,
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {withoutTarget > 0 && (
        <p className="text-xs text-muted-foreground">
          {withoutTarget} wishlist item{withoutTarget === 1 ? "" : "s"} without a target price.
        </p>
      )}

      <Link href="/wishlist" className="text-sm font-medium text-primary hover:underline">
        Manage wishlist →
      </Link>
    </Card>
  );
}
