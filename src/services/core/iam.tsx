import { api } from "../api";

export const getFullMenu = async () => {
  const response = await api.get("/core/iam/menu");
  return response.data;
};
