import { Core_Usuario } from "@/interface/core/core_usuario";
import { api } from "../api";

export const getMe = async (): Promise<Core_Usuario> => {
  const token = localStorage.getItem("token");
  const response = await api.get<Core_Usuario>(`/core/usuario/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

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

export const updateUsuario = async (
  usuario_id: number,
  data: Partial<Core_Usuario>
) => {
  const response = await api.put(`/core/usuario/${usuario_id}`, data);
  return response.data;
};

export const getUsuarioModulo = async (usuario_id: number) => {
  const response = await api.get(`/core/usuario/modulo/${usuario_id}`);
  return response.data;
};

export const upsertUsuarioModulo = async (
  usuario_id: number,
  codigo: string, // ej. "HD" | "ADM"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
): Promise<unknown> => {
  const { data } = await api.put(
    `/core/usuario/${usuario_id}/modulos/${codigo}`,
    payload
  );
  return data;
};
