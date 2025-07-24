import { Usuario } from "@/interface/usuario";
import { AxiosResponse } from "axios";
import { api } from "./api";

export const getUsuarios = async (soporte?: string): Promise<Usuario[]> => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();

  if (soporte) params.append("soporte", soporte);

  const response: AxiosResponse<Usuario[]> = await api.get(
    `/usuario?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
