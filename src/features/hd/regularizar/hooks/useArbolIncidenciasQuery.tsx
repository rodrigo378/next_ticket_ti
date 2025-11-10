// features/helpdesk/hooks/useArbolIncidenciasQuery.ts
import { useQuery } from "@tanstack/react-query";
import { getArbol } from "@services/hd";
import type { TreeNode } from "@interfaces/hd";

type ArbolRespuesta = Array<{
  id: number;
  nombre: string;
  area: { id: number; nombre: string } | null;
  incidencias: Array<{
    id: number;
    nombre: string;
    tipo: "incidencia" | "requerimiento";
    categorias: Array<{ id: number; nombre: string }>;
  }>;
}>;

function buildTreeData(cats: ArbolRespuesta): TreeNode[] {
  return (cats ?? []).map((c) => ({
    title: c.nombre,
    value: `CAT-${c.id}`,
    selectable: false,
    children: (c.incidencias ?? []).map((i) => ({
      title: `${i.nombre} (${i.tipo === "requerimiento" ? "REQ" : "INC"})`,
      value: `INC-${i.id}`,
      selectable: false,
      children: (i.categorias ?? []).map((k) => ({
        title: k.nombre,
        value: k.id,
        selectable: true,
      })),
    })),
  }));
}

export function useArbolIncidenciasQuery(areaId?: number) {
  return useQuery<TreeNode[]>({
    queryKey: ["arbol", areaId],
    queryFn: async () => {
      const raw = await getArbol(areaId!);
      return buildTreeData(raw as ArbolRespuesta);
    },
    enabled: !!areaId,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
