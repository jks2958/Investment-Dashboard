import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type RecurringInput } from "@/lib/api";

export function useRecurring() {
  return useQuery({ queryKey: ["recurring"], queryFn: api.recurring.list });
}

/** Posting a template writes real transactions, so anything reading those has
 *  to be refreshed alongside the templates themselves. */
function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["recurring"] });
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecurringInput) => api.recurring.create(input),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<RecurringInput> }) =>
      api.recurring.update(id, input),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.recurring.remove(id),
    onSuccess: () => invalidate(queryClient),
  });
}

export function usePostRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.recurring.post(id),
    onSuccess: () => invalidate(queryClient),
  });
}
