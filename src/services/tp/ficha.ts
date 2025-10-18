// services/tp/ficha.ts
import { TP_Ficha } from "@/interfaces/tp";
import { api } from "@/services/api";

export const createFicha = async (data: Partial<TP_Ficha>) => {
  const res = await api.post("/tp/ficha", data);
  return res.data;
};

export const getInfoEstudiante = async () => {
  const res = await api.get("/tp/ficha/info/estudiante");
  return res.data;
};

export const fichaExiste = async () => {
  const res = await api.get("/tp/ficha/existe");
  return res.data;
};
