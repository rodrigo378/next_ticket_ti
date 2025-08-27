import { api } from "../api";

export const getFullMenu = async () => {
  const token = localStorage.getItem("token");
  const response = await api.get("/core/iam/menu", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
