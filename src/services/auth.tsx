// services/authService.ts
import { SignIn } from "@/interface/usuario";
import { api } from "./api";

export const signin = async (data: SignIn) => {
  const response = await api.post("/auth/signin", data);

  return response.data;
};

export const getMe = async () => {
  const token = localStorage.getItem("token");
  const response = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
