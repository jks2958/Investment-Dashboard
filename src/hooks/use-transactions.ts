import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type TransactionInput } from "@/lib/api";

/** The shared window every widget reads: wide enough for month-over-month
 *  comparisons and the Income/Expense page's own filtering, without pulling
 *  a whole financial history down on every load. */
const DEFAULT_MONTHS = 24;

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: () => api.transactions.list(DEFAULT_MONTHS),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInput) => api.transactions.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<TransactionInput> }) =>
      api.transactions.update(id, input),
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
