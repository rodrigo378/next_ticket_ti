import { buscarEstudiante } from "@/services/core";
import { useQuery } from "@tanstack/react-query";

export function useBuscarEstudiante(text: string) {
  return useQuery({
    queryKey: ["estudiantes", text],
    queryFn: () => buscarEstudiante(text),
    enabled: !!text.trim(),
    staleTime: 1000 * 60,
  });
}
