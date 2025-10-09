// src/features/auth/hooks/useLogout.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { logout } from "@/services/core/auth";

// ===================================================================================
export function useLogout() {
  return useMutation({
    mutationKey: ["logout"],
    mutationFn: logout,
    retry: 0,
  });
}
