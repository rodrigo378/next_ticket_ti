import { HD_SLA } from "@/interface/hd/hd_sla";
import { api } from "../../../services/api";
import { AxiosResponse } from "axios";

export const getSla = async (): Promise<HD_SLA[]> => {
  const response: AxiosResponse<HD_SLA[]> = await api.get("/hd/sla");
  return response.data;
};

export const updateSla = async (id_sla: number, data: Partial<HD_SLA>) => {
  const response = await api.put(`/hd/sla/${id_sla}`, data);
  return response.data;
};
