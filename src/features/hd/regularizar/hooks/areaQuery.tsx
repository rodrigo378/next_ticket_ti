import { getAreas } from "@/services/hd";
import { useQuery } from "@tanstack/react-query";

export function useGetAreas() {
  return useQuery({
    queryKey: ["areas"],
    queryFn: () => getAreas(),
  });
}
