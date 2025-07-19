import { Estado } from "@/interface/estado";
import { api } from "./api";
import { AxiosResponse } from "axios";

export const getEstados = async (): Promise<Estado[]> => {
  const response: AxiosResponse<Estado[]> = await api.get("/estado");
  return response.data;
};
