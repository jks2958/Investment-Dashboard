import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: api.categories.list });
}

export function useMergeCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ from, into }: { from: string; into: string }) =>
      api.categories.merge(from, into),
    // A merge rewrites transactions, recurring templates and budgets, so
    // everything downstream of a category has to be refetched.
    onSuccess: () => {
      for (const key of [["categories"], ["transactions"], ["recurring"], ["budgets"]]) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}

/**
 * Categories that differ only by case or spacing — the duplicates worth
 * offering to merge. Grouped by their normalised form, largest first, so the
 * established spelling is the obvious one to keep.
 */
export function findDuplicateGroups(
  rows: { category: string; count: number }[] | undefined,
): { key: string; variants: { category: string; count: number }[] }[] {
  const groups = new Map<string, { category: string; count: number }[]>();
  for (const row of rows ?? []) {
    const key = row.category.trim().toLowerCase();
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...groups.entries()]
    .filter(([, variants]) => variants.length > 1)
    .map(([key, variants]) => ({
      key,
      variants: [...variants].sort((a, b) => b.count - a.count),
    }));
}
