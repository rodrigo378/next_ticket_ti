import { UpdateUsuario, Usuario } from "@/interface/usuario";
import { AxiosResponse } from "axios";
import { api } from "./api";
import { Modulo } from "@/interface/modulo";
import { Permiso } from "@/interface/permisos";

export const getUsuarios = async (): Promise<Usuario[]> => {
  const response: AxiosResponse<Usuario[]> = await api.get("/admin/usuario");
  return response.data;
};

export const updateUsuario = async (id: number, data: UpdateUsuario) => {
  const response = await api.put(`/admin/usuario/${id}`, data);
  return response.data;
};

export const getModulos = async (): Promise<Modulo[]> => {
  const res = await api.get("/admin/modulo");
  return res.data;
};

export const getPermisosTo = async (
  email: string
): Promise<{ usuario_id: number; permisos: Permiso[] }> => {
  const res = await api.post("/admin/permisos/to", { email });
  return res.data;
};

export const getPermisosMe = async () => {
  const token = localStorage.getItem("token");

  const response = await api.get("/admin/permisos/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updatePermisos = async (
  usuario_id: number,
  items_id: number[]
) => {
  const res = await api.put(`/admin/permisos/${usuario_id}`, {
    items_id,
  });
  return res.data;
};
