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

export const getSoporte = async () => {
  const token = localStorage.getItem("token");
  const response = await api.get("/admin/usuario/soporte", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getUsuarios = async (filtros?: {
  roles_id?: number[];
}): Promise<Usuario[]> => {
  const token = localStorage.getItem("token");

  const response: AxiosResponse<Usuario[]> = await api.get("/admin/usuario", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: filtros,
    paramsSerializer: {
      indexes: null,
    },
  });
  return response.data;
};

export const getUsuario = async (usuario_id: number): Promise<Usuario> => {
  const token = localStorage.getItem("token");

  const response: AxiosResponse<Usuario> = await api.get(
    `/admin/usuario/${usuario_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const updateUsuario = async (id: number, data: UpdateUsuario) => {
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
