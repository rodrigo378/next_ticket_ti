import { api } from "./api";
import { AxiosResponse } from "axios";
import { Sla, UpdateSla } from "@/interface/sla";

export const getSla = async (): Promise<Sla[]> => {
  const response: AxiosResponse<Sla[]> = await api.get("/sla");
  return response.data;
};

export const updateSla = async (id_sla: number, data: UpdateSla) => {
  const response = await api.put(`/sla/${id_sla}`, data);
  return response.data;
};
