// services/authService.ts
import { SignIn, SignUp } from "@/interface/usuario";
import { api } from "./api";

export const signin = (data: SignIn) => api.post("/auth/signin", data);
export const signup = (data: SignUp) => api.post("/auth/signup", data);
