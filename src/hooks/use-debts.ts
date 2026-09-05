import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type DebtInput } from "@/lib/api";

export function useDebts() {
  return useQuery({ queryKey: ["debts"], queryFn: api.debts.list });
}

/** Debts move net worth, so anything that reads it has to be refreshed too. */
function invalidateDebtDependents(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["debts"] });
  queryClient.invalidateQueries({ queryKey: ["snapshots"] });
}

export function useCreateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DebtInput) => api.debts.create(input),
    onSuccess: () => invalidateDebtDependents(queryClient),
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<DebtInput> }) =>
      api.debts.update(id, input),
    onSuccess: () => invalidateDebtDependents(queryClient),
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.debts.remove(id),
    onSuccess: () => invalidateDebtDependents(queryClient),
  });
}
