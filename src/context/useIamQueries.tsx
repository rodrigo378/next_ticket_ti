// src/context/useIamQueries.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getIamContext } from "@/services/core/iam";
import { logout as apiLogout } from "@/services/core/auth";
import type { IamCtx } from "./user.types";

// ===================================================================================
export function useIamContextQuery(userKey?: number | string) {
  return useQuery<IamCtx>({
    queryKey: ["iam-context", userKey ?? "anon"],
    queryFn: getIamContext,
    staleTime: 4 * 60 * 60_000, // 15 min “fresh” (ajústalo a tu gusto)
    gcTime: 30 * 60_000,
    retry: 1,

    // 👇 clave para que no dispare refetch cuando regresas a la pestaña
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false, // si ya hay cache, no revalida al montar
    // keepPreviousData: true,     // opcional si cambias userKey dinámicamente
  });
}

// ===================================================================================
export function useLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["logout"],
    mutationFn: apiLogout,
    onSettled: async () => {
      await qc.invalidateQueries();
      qc.clear();
    },
  });
}
