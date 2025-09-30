// services/tp/ficha.ts
import { TP_Ficha } from "@/interfaces/tp";
import { api } from "@/services/api"; // tu wrapper con baseURL y auth

export const createFicha = async (data: Partial<TP_Ficha>) => {
  // El controller tiene @Controller('') y @Post() → ajusta la ruta real:
  // Lo usual sería '/tp/ficha'
  const res = await api.post("/tp/ficha", data);
  return res.data;
};
