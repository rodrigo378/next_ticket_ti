import { Core_Rol } from "@/interface/core/core_rol";
import { api } from "../api";
import { AxiosResponse } from "axios";

export const getRoles = async (): Promise<Core_Rol[]> => {
  const response: AxiosResponse<Core_Rol[]> = await api.get("/core/rol");
  return response.data;
};
