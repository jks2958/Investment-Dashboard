import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: api.profile.get });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.profile.update(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}
