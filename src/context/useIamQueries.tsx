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
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
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
