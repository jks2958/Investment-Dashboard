import * as React from "react";
import { Merge, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/skeleton";
import { findDuplicateGroups, useCategories, useMergeCategories } from "@/hooks/use-categories";

/**
 * Cleans up categories that differ only by case or spacing.
 *
 * New entries are folded automatically, but rows written before that existed
 * keep whatever was typed — so this offers to fold them onto the spelling most
 * of them already use, largest count winning.
 */
export function CategoryCleanupCard() {
  const { data: categories, isLoading } = useCategories();
  const merge = useMergeCategories();
  const [done, setDone] = React.useState<number | null>(null);

  const groups = React.useMemo(() => findDuplicateGroups(categories), [categories]);

  async function mergeGroup(variants: { category: string; count: number }[]) {
    const [keep, ...rest] = variants;
    let moved = 0;
    for (const variant of rest) {
      const result = await merge.mutateAsync({ from: variant.category, into: keep.category });
      moved += result.moved;
    }
    setDone(moved);
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-base font-semibold">Tidy up categories</h2>
          <p className="text-xs text-muted-foreground">
            Spellings that differ only by capitalisation split your expense breakdown in two.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <ListSkeleton rows={2} />
        ) : groups.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Nothing to merge"
            description="Every category has one spelling. New entries are matched to an existing category automatically."
          />
        ) : (
          <ul className="divide-y divide-border">
            {groups.map((group) => {
              const [keep, ...rest] = group.variants;
              return (
                <li
                  key={group.key}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {keep.category}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({keep.count} {keep.count === 1 ? "entry" : "entries"})
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      also spelled {rest.map((v) => `“${v.category}” (${v.count})`).join(", ")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={merge.isPending}
                    onClick={() => mergeGroup(group.variants)}
                  >
                    <Merge className="size-4" /> Merge into “{keep.category}”
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        {done !== null && (
          <p className="text-sm text-positive">
            {done} {done === 1 ? "entry" : "entries"} moved.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
