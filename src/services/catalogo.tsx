import { AxiosResponse } from "axios";
import { api } from "./api";
import { Catalogo } from "@/interface/catalogo";

export const getCatalogo = async (area_id?: string): Promise<Catalogo[]> => {
  const params = new URLSearchParams();

  if (params) params.append("area_id", area_id);

  const response: AxiosResponse<Catalogo[]> = await api.get(
    `catalogo?${params}`
  );
  return response.data;
};
