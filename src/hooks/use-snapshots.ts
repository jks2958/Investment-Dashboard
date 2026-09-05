import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type SnapshotEntry } from "@/lib/api";

export function useSnapshots() {
  return useQuery({ queryKey: ["snapshots"], queryFn: () => api.snapshots.list() });
}

/** Separate query key from useSnapshots so the default 30-day window (which
 *  powers the "vs last month" deltas and sparklines) isn't widened by the
 *  trend chart's own range selection. */
export function useSnapshotRange(days: number) {
  return useQuery({
    queryKey: ["snapshots", days],
    queryFn: () => api.snapshots.list(days),
  });
}

export function useAllSnapshots() {
  return useQuery({ queryKey: ["snapshots", "all"], queryFn: api.snapshots.listAll });
}

/** Backfilling changes every chart that reads history, so drop the lot. */
function invalidateSnapshots(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["snapshots"] });
}

export function useSaveSnapshots() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entries: SnapshotEntry[]) => api.snapshots.save(entries),
    onSuccess: () => invalidateSnapshots(queryClient),
  });
}

export function useDeleteSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => api.snapshots.remove(date),
    onSuccess: () => invalidateSnapshots(queryClient),
  });
}
