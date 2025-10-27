/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/api/usuario.ts
import axios from "axios";

/** ---------- Axios base (BFF Nest) ---------- */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // p.ej. https://mesadeayuda.uma.edu.pe
  withCredentials: true,
});

/** ---------- Helpers Basic Auth ---------- */
export const setBasicAuth = (email: string, password: string): void => {
  const token = btoa(`${email}:${password}`);
  api.defaults.headers.common["Authorization"] = `Basic ${token}`;
};

export const clearBasicAuth = (): void => {
  delete api.defaults.headers.common["Authorization"];
};

/** ---------- Endpoints Admin (Nest -> FastAPI) ---------- */
const BASE = "/api/admin";

/**
 * GET /api/admin/admin/users
 */
export const getUsuarios = async () => {
  const { data } = await api.get(`${BASE}/users`);
  return data;
};

/**
 * POST /api/admin/admin/users/:userId/token?label=...
 * (respuesta típica: { token_plain: string, ... })
 */
export const generarTokenUsuario = async (
  userId: number,
  label = "default"
) => {
  console.log("cambio");

  const { data } = await api.post(
    `${BASE}/users/${encodeURIComponent(String(userId))}/token`,
    null,
    { params: { label } }
  );
  return data;
};

/**
 * GET /api/admin/admin/items
 */
export const getItems = async () => {
  const { data } = await api.get(`${BASE}/items`);
  return data;
};

/**
 * GET /api/admin/admin/tokens
 */
export const listTokens = async () => {
  const { data } = await api.get(`${BASE}/tokens`);
  return data;
};

/**
 * POST /api/admin/admin/token-items  { token_id, item_id }
 */
export const assignTokenItem = async (token_id: number, item_id: number) => {
  const { data } = await api.post(`${BASE}/token-items`, {
    token_id,
    item_id,
  });
  return data;
};

/**
 * DELETE /api/admin/admin/token-items  { token_id, item_id }
 */
export const revokeTokenItem = async (token_id: number, item_id: number) => {
  const { data } = await api.delete(`${BASE}/token-items`, {
    data: { token_id, item_id },
  });
  return data;
};

/**
 * GET /api/admin/admin/tokens/:tokenId/item-ids  -> number[]
 */
export const getAssignedItemIdsByToken = async (
  token_id: number
): Promise<number[]> => {
  const { data } = await api.get<number[]>(
    `${BASE}/tokens/${encodeURIComponent(String(token_id))}/item-ids`
  );
  return data;
};

/** -------------------------------------------------------
 * POST /api/admin/convalidar
 * Envía archivos + c_codesp (+ c_codmod opcional)
 * ------------------------------------------------------- */
export type ConvalidarResponse = {
  status: "ok";
  total_archivos: number;
  resultado_extraccion: unknown;
  resultado_convalidacion: unknown;
  convalidadas: number;
  porcentaje_convalidacion_plan: number;
  porcentaje_convalidacion_real: number;
  costo_total_usd: number;
};

export const convalidar = async (
  files: File[], // del input <input type="file" multiple />
  c_codesp: string, // ej: 'E4'
  c_codmod: number = 2, // por defecto 2
  opts?: {
    signal?: AbortSignal; // opcional: para cancelar
    onUploadProgress?: (e: ProgressEvent) => void; // opcional: barra de progreso
    timeoutMs?: number; // opcional: override timeout
  }
): Promise<ConvalidarResponse> => {
  if (!files?.length) {
    throw new Error("Debes adjuntar al menos un archivo.");
  }
  if (!c_codesp) {
    throw new Error("El parámetro c_codesp es obligatorio.");
  }

  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  fd.append("c_codesp", c_codesp);
  if (typeof c_codmod !== "undefined" && c_codmod !== null) {
    fd.append("c_codmod", String(c_codmod));
  }

  // ¡No seteamos Content-Type manualmente! El browser agrega el boundary.
  const { data } = await api.post<ConvalidarResponse>(
    `${BASE}/convalidar`,
    fd,
    {
      timeout: opts?.timeoutMs ?? 300_000, // 5 min (match con Nest)
      signal: opts?.signal,
      onUploadProgress: opts?.onUploadProgress as  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | ((progressEvent: any) => void)
        | undefined,
    }
  );

  return data;
};

/** -------------------------------------------------------
 * POST /api/admin/extraer-cursos
 * Sube archivos (PDF/imagenes) y devuelve cursos extraídos.
 * ------------------------------------------------------- */
export type ExtraerCursosResponse = {
  status: "ok";
  total_archivos: number;
  resultado: {
    extraidos: Array<{ curso: string; ciclo: string | null; nota: number }>;
    total_imagenes: number;
    lotes: number;
    uso: unknown;
    uso_detalle: unknown[];
    total_cursos_extraidos: number;
  };
};

export const extraerCursos = async (
  files: File[],
  opts?: {
    signal?: AbortSignal;
    onUploadProgress?: (e: ProgressEvent) => void;
    timeoutMs?: number;
  }
): Promise<ExtraerCursosResponse> => {
  if (!files?.length) throw new Error("Debes adjuntar al menos un archivo.");

  const fd = new FormData();
  for (const f of files) fd.append("files", f);

  const { data } = await api.post<ExtraerCursosResponse>(
    "/api/admin/extraer-cursos",
    fd,
    {
      timeout: opts?.timeoutMs ?? 300_000,
      signal: opts?.signal,
      onUploadProgress: opts?.onUploadProgress as any,
    }
  );
  return data;
};

/** -------------------------------------------------------
 * POST /api/admin/convalidar-extraidos
 * Envía { c_codesp, c_codmod?, extraidos[] } y devuelve convalidación.
 * ------------------------------------------------------- */
export type ConvalidarExtraidosPayload = {
  c_codesp: string;
  c_codmod?: number;
  extraidos: Array<{ curso: string; ciclo: string | null; nota: number }>;
};

export type ConvalidarExtraidosResponse = {
  status: "ok";
  resultado_convalidacion: unknown;
  convalidadas: number;
  porcentaje_convalidacion_plan: number;
  porcentaje_convalidacion_real: number;
  costo_usd: number;
};

export const convalidarExtraidos = async (
  payload: ConvalidarExtraidosPayload,
  opts?: { signal?: AbortSignal; timeoutMs?: number }
): Promise<ConvalidarExtraidosResponse> => {
  if (!payload?.c_codesp) throw new Error("c_codesp es obligatorio");
  if (!Array.isArray(payload?.extraidos))
    throw new Error('"extraidos" debe ser una lista');

  const { data } = await api.post<ConvalidarExtraidosResponse>(
    "/api/admin/convalidar-extraidos",
    payload,
    {
      timeout: opts?.timeoutMs ?? 300_000,
      signal: opts?.signal,
    }
  );
  return data;
};
