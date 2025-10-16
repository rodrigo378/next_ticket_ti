import { useUsuario } from "@/context/UserContext";
import { HdModule } from "@/interfaces/hd";
import { upsertConfig } from "@/services/core";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

// ===================================================================================
export function useHdConfig() {
  // ===================================================================================
  const { usuario, modulesByCode } = useUsuario();
  const hdModule = modulesByCode["HD"] as HdModule | undefined;

  // ===================================================================================
  return useMemo(
    () => ({
      usuario,
      hdModule,
      hdRole: hdModule?.role ?? null,
      hdConfig: hdModule?.perfil ?? null,
    }),
    [usuario, hdModule]
  );
}

// ===================================================================================
export function useHdSaveConfig() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      tabKey,
      config,
    }: {
      tabKey: string;
      config: Record<string, unknown>;
    }) =>
      upsertConfig({
        modulo: "HD",
        tabKey,
        config,
      }),
  });

  return { saveConfig: mutateAsync, isPending };
}
