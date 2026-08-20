import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type CashInput } from "@/lib/api";

export function useCashAccounts() {
  return useQuery({ queryKey: ["cash"], queryFn: api.cash.list });
}

export function useCreateCashAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CashInput) => api.cash.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cash"] }),
  });
}

export function useDeleteCashAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.cash.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cash"] }),
  });
}
