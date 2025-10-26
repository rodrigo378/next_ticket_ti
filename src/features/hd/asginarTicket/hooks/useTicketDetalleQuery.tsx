// features/helpdesk/hooks/useTicketDetalleQuery.ts
import { useQuery } from "@tanstack/react-query";
import { getTicket } from "@services/hd";
import type { HD_Ticket } from "@interfaces/hd";

export function useTicketDetalleQuery(id?: number) {
  return useQuery<HD_Ticket>({
    queryKey: ["ticket", id],
    queryFn: () => getTicket(id!),
    enabled: !!id,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
