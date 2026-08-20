import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type HoldingInput } from "@/lib/api";

export function useHoldings() {
  return useQuery({ queryKey: ["holdings"], queryFn: api.holdings.list });
}

export function useCreateHolding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: HoldingInput) => api.holdings.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["holdings"] }),
  });
}

export function useDeleteHolding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.holdings.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["holdings"] }),
  });
}
