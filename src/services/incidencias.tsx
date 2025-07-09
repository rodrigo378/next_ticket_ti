import { IncidenciaArea } from "@/interface/incidencia";
import { api } from "./api";
import { AxiosResponse } from "axios";

export const getIncidencias = async (): Promise<IncidenciaArea[]> => {
  const response: AxiosResponse<IncidenciaArea[]> = await api.get(
    "/incidencia"
  );
  return response.data;
};
