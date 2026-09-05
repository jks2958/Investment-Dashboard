import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

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
