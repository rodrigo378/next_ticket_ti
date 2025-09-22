import { AxiosResponse } from "axios";
import { api } from "../api";

export const getListPermisos = async () => {
  const response = await api.get("/core/permiso");
  return response.data;
};

export const getPermisosUser = async (email: string) => {
  const response = await api.get(`/core/permiso/${email}`);
  return response.data;
};

export const updatePermisos = async (data: {
  usuario_id: number;
  item_ids: number[];
  desactivarRestantes?: boolean;
}) => {
  const response: AxiosResponse = await api.put(`core/permiso`, data);
  return response.data;
};
