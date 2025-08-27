import { HD_EstadoTicket } from "@/interface/hd/hd_estadoTicket";
import { api } from "../api";
import { AxiosResponse } from "axios";

export const getEstados = async (): Promise<HD_EstadoTicket[]> => {
  const response: AxiosResponse<HD_EstadoTicket[]> = await api.get(
    "/hd/estado"
  );
  return response.data;
};
