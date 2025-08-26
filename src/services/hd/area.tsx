import { AxiosResponse } from "axios";
import { HD_Area } from "@/interface/hd/hd_area";
import { api } from "../api";
import { HD_Subarea } from "@/interface/hd/hd_subarea";

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
