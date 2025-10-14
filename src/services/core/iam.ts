import { api } from "../api";

export const getFullMenu = async () => {
  const response = await api.get("/core/iam/menu");
  return response.data;
};

export const getIamContext = async () => {
  const response = await api.get("/core/iam/context");
  return response.data;
};

export const upsertConfig = async (data: {
  modulo: string;
  tabKey: string;
  config: string;
}) => {
  const response = await api.post("/core/iam/config", data);
  return response.data;
};
