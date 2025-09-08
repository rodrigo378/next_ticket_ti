import { HD_Incidencia } from "@/interface/hd/hd_incidencia";
import { api } from "../../../services/api";
import { AxiosResponse } from "axios";
import { HD_Categoria } from "@/interface/hd/hd_categoria";

export const getIncidencias = async (
  tipo?: string,
  catalogo_id?: string
): Promise<HD_Incidencia[]> => {
  const params = new URLSearchParams();

  if (tipo) params.append("tipo", tipo);
  if (catalogo_id) params.append("catalogo_id", catalogo_id);

  const response: AxiosResponse<HD_Incidencia[]> = await api.get(
    `/hd/incidencia?${params.toString()}`
  );
  return response.data;
};

export const createIncidencia = async (data: HD_Incidencia) => {
  const response = await api.post("/hd/incidencia", data);
  return response.data;
};

export const createCategoria = async (data: HD_Categoria) => {
  const response = await api.post("/hd/incidencia/categoria", data);
  return response.data;
};

export const updateCategoria = async (
  id: number,
  data: Partial<HD_Categoria>
) => {
  const response = await api.put(`/hd/incidencia/categoria/${id}`, data);
  return response.data;
};

export const getArbol = async (area_id: number) => {
  const response = await api.get(`/hd/incidencia/arbol/${area_id}`);
  return response.data;
};
