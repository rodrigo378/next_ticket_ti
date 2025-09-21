import { Core_Usuario } from "@interfaces/core";
import { api } from "../api";

export const getMe = async (): Promise<Core_Usuario> => {
  const response = await api.get<Core_Usuario>(`/core/usuario/me`);
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

// http://localhost:4000/core/usuario/2/modulos/config
export const getUsuarioModuloConfig = async (usuario_id: number) => {
  const response = await api.get(`/core/usuario/${usuario_id}/modulo/config`);
  return response.data;
};

// http://localhost:4000/core/usuario/1/modulo/HD
export const upsertUsuarioModulo = async (
  usuario_id: number,
  codigo: string, // ej. "HD" | "ADM"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
): Promise<unknown> => {
  const { data } = await api.put(
    `/core/usuario/${usuario_id}/modulo/${codigo}`,
    payload
  );
  return data;
};
