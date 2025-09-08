import { AxiosResponse } from "axios";
import { HD_Area } from "@/interface/hd/hd_area";
import { api } from "../../../services/api";
import { HD_Subarea } from "@/interface/hd/hd_subarea";
import { HD_HorarioArea } from "@/interface/hd/hd_horarioArea";

export const getArea = async (area_id: number): Promise<HD_Area> => {
  const response: AxiosResponse<HD_Area> = await api.get(`/hd/area/${area_id}`);
  return response.data;
};

export const getAreas = async (): Promise<HD_Area[]> => {
  const response: AxiosResponse<HD_Area[]> = await api.get("/hd/area");
  return response.data;
};

export const getSubareas = async (area_id: number): Promise<HD_Subarea[]> => {
  const response: AxiosResponse<HD_Subarea[]> = await api.get(
    `/hd/area/sub/${area_id}`
  );
  return response.data;
};

export const createHorario = async (data: Partial<HD_HorarioArea>) => {
  const response = await api.post(`/hd/area/horario`, data);
  return response.data;
};

export const updateHorario = async (
  horario_id: number,
  data: Partial<HD_HorarioArea>
) => {
  const response = await api.put(`/hd/area/horario/${horario_id}`, data);
  return response.data;
};
