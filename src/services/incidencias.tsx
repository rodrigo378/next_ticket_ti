import { Incidencia } from "@/interface/incidencia";
import { api } from "./api";
import { AxiosResponse } from "axios";

export const getIncidencias = async (tipo?: string): Promise<Incidencia[]> => {
  const params = new URLSearchParams();

  if (tipo) params.append("tipo", tipo);

  const response: AxiosResponse<Incidencia[]> = await api.get(
    `/incidencia?${params.toString()}`
  );
  return response.data;
};
