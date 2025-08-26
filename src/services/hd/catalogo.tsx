import { AxiosResponse } from "axios";
import { api } from "../api";
import { HD_CatalogoServicio } from "@/interface/hd/hd_catalogoServicio";

export const getCatalogo = async (
  area_id?: string
): Promise<HD_CatalogoServicio[]> => {
  const params = new URLSearchParams();

  if (area_id) params.append("area_id", area_id);

  const response: AxiosResponse<HD_CatalogoServicio[]> = await api.get(
    `/hd/catalogo?${params}`
  );
  return response.data;
};

export const createCatalogo = async (data: HD_CatalogoServicio) => {
  const response = await api.post("//hd/catalogo", data);

  return response.data;
};
