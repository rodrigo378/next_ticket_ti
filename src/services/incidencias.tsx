import { Categoria, Incidencia } from "@/interface/incidencia";
import { api } from "./api";
import { AxiosResponse } from "axios";

export const getIncidencias = async (
  tipo?: string,
  catalogo_id?: string
): Promise<Incidencia[]> => {
  const params = new URLSearchParams();

  if (tipo) params.append("tipo", tipo);
  if (catalogo_id) params.append("catalogo_id", catalogo_id);

  const response: AxiosResponse<Incidencia[]> = await api.get(
    `/incidencia?${params.toString()}`
  );
  return response.data;
};

export const createIncidencia = async (data: Incidencia) => {
  const response = await api.post("/incidencia", data);
  return response.data;
};

export const createCategoria = async (data: Categoria) => {
  const response = await api.post("/incidencia/categoria", data);
  return response.data;
};

export const updateCategoria = async (id: number, data: Partial<Categoria>) => {
  const response = await api.put(`/incidencia/categoria/${id}`, data);
  return response.data;
};
