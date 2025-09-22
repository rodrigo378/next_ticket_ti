import { AxiosResponse } from "axios";
import { api } from "../api";
import { Core_Usuario } from "@interfaces/core";

export const getUsuario = async (email: string): Promise<Core_Usuario> => {
  const response: AxiosResponse = await api.get<Core_Usuario>(
    `adm/admin/usuario/${email}`
  );

  return response.data;
};
