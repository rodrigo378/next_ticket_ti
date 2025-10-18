import { Core_Rol } from "@interfaces/core/core_rol";
import { api } from "../api";
import { AxiosResponse } from "axios";

export const getRoles = async (): Promise<Core_Rol[]> => {
  const response: AxiosResponse<Core_Rol[]> = await api.get("/core/rol");
  return response.data;
};

export const getUbigeoTree = async () => {
  const response = await api.get("core/rol/ubigeo/tree");
  return response.data;
};

export const getUbigeoSearch = async (search: string) => {
  const q = search?.trim();
  if (!q || q.length < 2) return [];

  try {
    const response = await api.get(
      `/core/rol/ubigeo/search?q=${encodeURIComponent(q)}`
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error al buscar ubigeo:", error);
    return [];
  }
};

export const getUbigeoResolve = async (ubigeo: string) => {
  if (!ubigeo) return null;

  try {
    const response = await api.get(`/core/rol/ubigeo/resolve/${ubigeo}`);
    return response.data;
  } catch (error) {
    console.error("Error al resolver ubigeo:", error);
    return null;
  }
};
