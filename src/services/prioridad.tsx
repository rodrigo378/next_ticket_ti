import { PrioridadTicket } from "@/interface/prioridad";
import { api } from "./api";
import { AxiosResponse } from "axios";

export const getPrioridades = async (): Promise<PrioridadTicket[]> => {
  const response: AxiosResponse<PrioridadTicket[]> = await api.get(
    "/prioridad"
  );
  return response.data;
};
