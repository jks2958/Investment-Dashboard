import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function usePrices() {
  return useQuery({ queryKey: ["prices"], queryFn: api.prices.list });
}
