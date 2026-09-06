import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type BudgetInput } from "@/lib/api";

export function useBudgets() {
  return useQuery({ queryKey: ["budgets"], queryFn: api.budgets.list });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["budgets"] });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BudgetInput) => api.budgets.create(input),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<BudgetInput> }) =>
      api.budgets.update(id, input),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.budgets.remove(id),
    onSuccess: () => invalidate(queryClient),
  });
}
