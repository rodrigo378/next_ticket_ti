import { Core_Usuario } from "@/interface/core/core_usuario";
import { api } from "../api";

export const getUsuario = async (usuario_id: number): Promise<Core_Usuario> => {
  const response = await api.get<Core_Usuario>(`/core/usuario/${usuario_id}`);
  return response.data;
};

export const getUsuarios = async (filtros: {
  roles_id?: number[];
}): Promise<Core_Usuario[]> => {
  const response = await api.get<Core_Usuario[]>(`/core/usuario`, {
    params: filtros,
    paramsSerializer: {
      indexes: null,
    },
  });
  return response.data;
};

export const createUsuario = async (data: Partial<Core_Usuario>) => {
  const response = await api.post("/core/usuario", data);
  return response.data;
};
