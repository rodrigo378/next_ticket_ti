// src/features/layout/hooks/useIamMenu.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getFullMenu } from "@/services/core/iam";
import type { IamMenuModule } from "@interfaces/core/layout";

// ===================================================================================
const byOrder = <T extends { order?: number }>(a: T, b: T) =>
  (a.order ?? 99999) - (b.order ?? 99999);

// ===================================================================================
export function useIamMenu(userKey?: string | number) {
  return useQuery<IamMenuModule[]>({
    queryKey: ["iam-menu", userKey ?? "anon"],
    queryFn: getFullMenu,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
    select: (mods) => [...mods].sort(byOrder),
  });
}
