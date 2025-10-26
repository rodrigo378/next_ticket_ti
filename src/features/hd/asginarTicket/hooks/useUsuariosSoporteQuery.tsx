// features/helpdesk/hooks/useUsuariosSoporteQuery.ts
import { useQuery } from "@tanstack/react-query";
import { getSoporte } from "@services/hd";
import type { Core_Usuario } from "@interfaces/core";

export function useUsuariosSoporteQuery(areaId = 1) {
  return useQuery<Core_Usuario[]>({
    queryKey: ["soporte", areaId],
    queryFn: () => getSoporte(areaId),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
