import { TP_Ubicacion } from "@interfaces/tp";
import { api } from "../api";

export const createUbicacion = async (data: Partial<TP_Ubicacion>) => {
  const response = await api.post(`/tp/ubicacion`, data);
  return response.data;
};

export const getUbicaciones = async () => {
  const response = await api.get(`/tp/ubicacion`);
  return response.data;
};
