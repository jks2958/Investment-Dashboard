import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type OtherAssetInput } from "@/lib/api";

export function useOtherAssets() {
  return useQuery({ queryKey: ["other-assets"], queryFn: api.otherAssets.list });
}

export function useCreateOtherAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OtherAssetInput) => api.otherAssets.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["other-assets"] }),
  });
}

export function useDeleteOtherAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.otherAssets.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["other-assets"] }),
  });
}
