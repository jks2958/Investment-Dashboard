import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type CommitmentInput } from "@/lib/api";

export function useCommitments() {
  return useQuery({ queryKey: ["commitments"], queryFn: api.commitments.list });
}

export function useCreateCommitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CommitmentInput) => api.commitments.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["commitments"] }),
  });
}

export function useUpdateCommitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CommitmentInput> }) =>
      api.commitments.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["commitments"] }),
  });
}

export function useDeleteCommitment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.commitments.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["commitments"] }),
  });
}
