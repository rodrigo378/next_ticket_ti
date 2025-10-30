// src/const/modulos/modulos.const.ts
export type RoleOption = { label: string; value: string };

export const MODULOS = {
  ADM: "ADM",
  HD: "HD",
  TP: "TP",
  API: "API",
} as const;
export type ModCodigo = keyof typeof MODULOS;

export const ADM_ROLES = [
  { label: "Administrativo", value: "administrativo" },
  { label: "Estudiante", value: "estudiante" },
] as const satisfies RoleOption[];

export const HD_ROLES = [
  { label: "nivel_1", value: "nivel_1" },
  { label: "nivel_2", value: "nivel_2" },
  { label: "nivel_3", value: "nivel_3" },
  { label: "nivel_4", value: "nivel_4" },
  { label: "nivel_5", value: "nivel_5" },
  { label: "Administrativo", value: "administrativo" },
  { label: "Estudiante", value: "estudiante" },
] as const satisfies RoleOption[];

export const TP_ROLES = [
  { label: "Supervisor", value: "supervisor" },
  { label: "Personal de salud", value: "per_salud" },
  { label: "Administrativo", value: "administrativo" },
  { label: "Estudiante", value: "estudiante" },
] as const satisfies RoleOption[];

export const API_ROLES = [
  { label: "Administrador", value: "administrador" },
  { label: "sin rol", value: "quitar" },
] as const satisfies RoleOption[];

export const HR_ROLES = [
  { label: "Decano", value: "decano" },
  { label: "sin rol", value: "quitar" },
] as const satisfies RoleOption[];
