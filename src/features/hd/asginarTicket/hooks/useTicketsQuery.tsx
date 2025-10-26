// useTicketsQuery.ts
import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@services/hd";
import type { HD_Ticket } from "@interfaces/hd";

export function useTicketsQuery(estados_id: string[]) {
  return useQuery<HD_Ticket[]>({
    queryKey: ["tickets", { estados_id }],
    queryFn: () => getTickets({ me: undefined, estados_id }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
