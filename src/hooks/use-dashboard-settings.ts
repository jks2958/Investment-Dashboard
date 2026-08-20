import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type DashboardSettingsUpdate } from "@/lib/api";

export function useDashboardSettings() {
  return useQuery({ queryKey: ["dashboard-settings"], queryFn: api.dashboardSettings.get });
}

export function useUpdateDashboardSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DashboardSettingsUpdate) => api.dashboardSettings.update(input),
    onSuccess: (data) => queryClient.setQueryData(["dashboard-settings"], data),
  });
}
