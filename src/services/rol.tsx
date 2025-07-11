import { Rol } from "@/interface/rol";
import { api } from "./api";
import { AxiosResponse } from "axios";

export const getRoles = async (): Promise<Rol[]> => {
  const response: AxiosResponse<Rol[]> = await api.get("/rol");
  return response.data;
};
