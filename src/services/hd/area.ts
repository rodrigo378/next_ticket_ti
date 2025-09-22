import { AxiosResponse } from "axios";
import { api } from "../api";
import { HD_Area, HD_Subarea, HD_HorarioArea } from "@interfaces/hd";

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
