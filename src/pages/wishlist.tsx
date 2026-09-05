import * as React from "react";
import { Bookmark, Pencil } from "lucide-react";

import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/empty-state";
import { WishlistDialog } from "@/components/wishlist-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useDeleteWishlistItem, useWishlist } from "@/hooks/use-wishlist";
import type { WishlistItem } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const ASSET_TYPE_LABEL: Record<string, string> = {
  stock: "Stock",
  fund: "Fund",
  crypto: "Crypto",
};

export function WishlistPage() {
  const { data: items, isLoading } = useWishlist();
  const deleteItem = useDeleteWishlistItem();
  const [editing, setEditing] = React.useState<WishlistItem | undefined>();

  return (
    <Card className="h-full overflow-auto">
      <CardHeader>
        <h2 className="text-base font-semibold">Wishlist</h2>
        <WishlistDialog />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ListSkeleton rows={3} />
        ) : !items || items.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Nothing on your wishlist"
            description="Add a stock, fund or coin you're watching, with a target buy price, and the Wishlist Targets widget will tell you how far off it is."
            action={<WishlistDialog />}
          />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.symbol.toUpperCase()}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ASSET_TYPE_LABEL[item.assetType]}
                    {item.targetPrice ? ` · target ${formatCurrency(Number(item.targetPrice))}` : ""}
                    {item.note ? ` · ${item.note}` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${item.symbol}`}
                  onClick={() => setEditing(item)}
                  className="text-muted-foreground"
                >
                  <Pencil className="size-4" />
                </Button>
                <DeleteButton
                  label={item.symbol.toUpperCase()}
                  detail={
                    item.targetPrice
                      ? `Target ${formatCurrency(Number(item.targetPrice))}`
                      : undefined
                  }
                  onConfirm={() => deleteItem.mutate(item.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {editing && (
        <WishlistDialog
          editing={editing}
          open
          onOpenChange={(next) => {
            if (!next) setEditing(undefined);
          }}
        />
      )}
    </Card>
  );
}
