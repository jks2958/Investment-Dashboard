import { Trash2 } from "lucide-react";

import { AddWishlistDialog } from "@/components/add-wishlist-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDeleteWishlistItem, useWishlist } from "@/hooks/use-wishlist";
import { formatCurrency } from "@/lib/format";

const ASSET_TYPE_LABEL: Record<string, string> = {
  stock: "Stock",
  fund: "Fund",
  crypto: "Crypto",
};

export function WishlistPage() {
  const { data: items, isLoading } = useWishlist();
  const deleteItem = useDeleteWishlistItem();

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">Wishlist</h2>
        <AddWishlistDialog />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !items || items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing on your wishlist yet. Add a stock, fund, or crypto you're watching.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.symbol.toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    {ASSET_TYPE_LABEL[item.assetType]}
                    {item.targetPrice ? ` · target ${formatCurrency(Number(item.targetPrice))}` : ""}
                    {item.note ? ` · ${item.note}` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${item.symbol}`}
                  onClick={() => deleteItem.mutate(item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
