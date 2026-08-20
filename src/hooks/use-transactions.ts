import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type TransactionInput } from "@/lib/api";

export function useTransactions() {
  return useQuery({ queryKey: ["transactions"], queryFn: api.transactions.list });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInput) => api.transactions.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.transactions.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}
