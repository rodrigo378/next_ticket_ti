import { EstadoTicket } from "@/interface/estado";
import { api } from "./api";
import { AxiosResponse } from "axios";

export const getEstados = async (): Promise<EstadoTicket[]> => {
  const response: AxiosResponse<EstadoTicket[]> = await api.get("/estado");
  return response.data;
};
