import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type WishlistInput } from "@/lib/api";

export function useWishlist() {
  return useQuery({ queryKey: ["wishlist"], queryFn: api.wishlist.list });
}

export function useCreateWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WishlistInput) => api.wishlist.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.wishlist.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}
