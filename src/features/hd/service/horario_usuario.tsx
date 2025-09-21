import { HD_HorarioUsuario, HD_HorarioArea } from "@interfaces/hd";
import { api } from "../../../services/api";

export const createHorarioUsuario = async (
  data: Partial<HD_HorarioUsuario>
) => {
  const response = await api.post(`/hd/horario/horario`, data);
  return response.data;
};

export const updateHorarioUsuario = async (
  horario_id: number,
  data: Partial<HD_HorarioArea>
) => {
  const response = await api.put(`/hd/horario/horario/${horario_id}`, data);
  return response.data;
};
