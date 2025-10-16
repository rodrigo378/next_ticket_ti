import { getTickets } from "@/services/hd";
import { useQuery } from "@tanstack/react-query";

// ===================================================================================
type FiltrosTickets = {
  me?: string;
  estados_id?: string[];
};

// ===================================================================================
export default function useTickets(filtros: FiltrosTickets) {
  // ===================================================================================
  return useQuery({
    queryKey: ["tickets", filtros],
    queryFn: () => getTickets(filtros),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
