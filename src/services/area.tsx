import { Area } from "@/interface/area";
import { AxiosResponse } from "axios";
import { api } from "./api";

export const getAreas = async (): Promise<Area[]> => {
  const response: AxiosResponse<Area[]> = await api.get("area");
  return response.data;
};

export const getSubareas = async (): Promise<Area[]> => {
  const response: AxiosResponse<Area[]> = await api.get("area");
  return response.data;
};
