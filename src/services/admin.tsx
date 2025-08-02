import { CreateUsuario, UpdateUsuario, Usuario } from "@/interface/usuario";
import { AxiosResponse } from "axios";
import { api } from "./api";
import { Modulo } from "@/interface/modulo";
import { Permiso, PermisoLayout } from "@/interface/permisos";

export const createUsuario = async (data: CreateUsuario) => {
  const token = localStorage.getItem("token");

  const response = await api.post("/admin/usuario/create", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getUsuarios = async (): Promise<Usuario[]> => {
  const token = localStorage.getItem("token");

  const response: AxiosResponse<Usuario[]> = await api.get("/admin/usuario", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUsuario = async (id: string, data: UpdateUsuario) => {
  const token = localStorage.getItem("token");

  const response = await api.put(`/admin/usuario/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getModulos = async (): Promise<Modulo[]> => {
  const token = localStorage.getItem("token");

  const res = await api.get("/admin/modulo", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getPermisosTo = async (
  email: string
): Promise<{ usuario_id: number; permisos: Permiso[] }> => {
  const token = localStorage.getItem("token");

  const res = await api.post(
    "/admin/permisos/to",
    { email },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const getPermisosMe = async (): Promise<PermisoLayout[]> => {
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
  const token = localStorage.getItem("token");

  const res = await api.put(
    `/admin/permisos/${usuario_id}`,
    {
      items_id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
