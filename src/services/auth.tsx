// services/authService.ts
import { SignIn } from "@/interface/usuario";
import { api } from "./api";

export const signin = (data: SignIn) => api.post("/auth/signin", data);
