import { HD_EstadoTicket } from "@interfaces/hd";
import { AxiosResponse } from "axios";
import { api } from "../api";

export const getEstados = async (): Promise<HD_EstadoTicket[]> => {
  const response: AxiosResponse<HD_EstadoTicket[]> = await api.get(
    "/hd/estado"
  );
  return response.data;
};
