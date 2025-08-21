import { Area, Subarea } from "@/interface/area";
import { AxiosResponse } from "axios";
import { api } from "./api";

export const getAreas = async (): Promise<Area[]> => {
  const response: AxiosResponse<Area[]> = await api.get("area");
  return response.data;
};

export const getSubareas = async (area_id: number): Promise<Subarea[]> => {
  const response: AxiosResponse<Subarea[]> = await api.get(
    `area/sub/${area_id}`
  );
  return response.data;
};
