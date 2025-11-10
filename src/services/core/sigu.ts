import { api } from "../api";

export const buscarEstudiante = async (text: string) => {
  const response = await api.get(`core/sigu/estudiantes?text=${text}`);
  return response.data;
};
