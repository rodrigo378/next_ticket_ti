import { AxiosResponse } from "axios";
import { api } from "./api";
import { CatalogoServicio } from "@/interface/catalogo";

export const getCatalogo = async (
  area_id?: string
): Promise<CatalogoServicio[]> => {
  const params = new URLSearchParams();

  if (area_id) params.append("area_id", area_id);

  const response: AxiosResponse<CatalogoServicio[]> = await api.get(
    `catalogo?${params}`
  );
  return response.data;
};

export const createCatalogo = async (data: CatalogoServicio) => {
  const response = await api.post("/catalogo", data);

  return response.data;
};
