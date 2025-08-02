import { Usuario } from "@/interface/usuario";
import { AxiosResponse } from "axios";
import { api } from "./api";

export const getUsuarios = async (): Promise<Usuario[]> => {
  const token = localStorage.getItem("token");

  const response: AxiosResponse<Usuario[]> = await api.get(`/usuario`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
