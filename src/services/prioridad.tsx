import { Prioridad } from "@/interface/prioridad";
import { api } from "./api";
import { AxiosResponse } from "axios";

export const getPrioridad = async (): Promise<Prioridad[]> => {
  const response: AxiosResponse<Prioridad[]> = await api.get("/prioridad");
  return response.data;
};
