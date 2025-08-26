import { AxiosResponse } from "axios";
import { api } from "../api";
import { Core_Usuario } from "@/interface/core/core_usuario";

export const getUsuario = async (email: string): Promise<Core_Usuario> => {
  const response: AxiosResponse = await api.get<Core_Usuario>(
    `adm/admin/usuario/${email}`
  );

  return response.data;
};
