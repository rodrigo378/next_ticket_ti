import { HD_PrioridadTicket } from "@/interface/hd/hd_prioridadTicket";
import { api } from "../../../services/api";
import { AxiosResponse } from "axios";

export const getPrioridades = async (): Promise<HD_PrioridadTicket[]> => {
  const response: AxiosResponse<HD_PrioridadTicket[]> = await api.get(
    "/hd/prioridad"
  );
  return response.data;
};
