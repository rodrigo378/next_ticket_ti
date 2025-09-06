// src/services/api.ts
import axios, { AxiosError, AxiosInstance } from "axios";

/* ===========================
   Tipos de error tipados
=========================== */
export type ApiErrorCode =
  | "OUT_OF_HOURS"
  | "AREA_NO_SCHEDULE"
  | "VALIDATION_FAILED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

export interface NormalizedError {
  status: number; // HTTP status (o 0 si no hay respuesta)
  code: ApiErrorCode; // código de dominio para la UI
  message: string; // mensaje amigable o del backend
  details?: {
    ventanas?: string[];
    fieldErrors?: Record<string, string | string[]>;
    [k: string]: unknown;
  };
  raw?: unknown; // error original (debug)
}

export const isNormalizedError = (x: unknown): x is NormalizedError =>
  !!x &&
  typeof x === "object" &&
  "status" in x &&
  "code" in x &&
  "message" in x;

function mapHttpToCode(status?: number): ApiErrorCode {
  switch (status) {
    case 400:
      return "VALIDATION_FAILED";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 500:
      return "SERVER_ERROR";
    default:
      return "UNKNOWN_ERROR";
  }
}

/** Normaliza cualquier error a NormalizedError */
export function normalizeError(err: unknown): NormalizedError {
  if (isNormalizedError(err)) return err;

  if (axios.isAxiosError(err)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ax = err as AxiosError<any>;
    const status = ax.response?.status ?? 0;
    const data = ax.response?.data;

    // Si el back ya manda { status, code, message, details }
    if (
      data &&
      typeof data === "object" &&
      "code" in data &&
      "message" in data
    ) {
      return {
        status: typeof data.status === "number" ? data.status : status,
        code: (data.code as ApiErrorCode) ?? mapHttpToCode(status),
        message: String(data.message ?? "Ocurrió un error."),
        details: data.details,
        raw: err,
      };
    }

    // Si no hay 'code' en el payload, mapea por HTTP
    return {
      status,
      code: mapHttpToCode(status),
      message:
        ax.message ||
        (status
          ? `Error HTTP ${status}`
          : "No se pudo conectar con el servidor."),
      details: undefined,
      raw: err,
    };
  }

  // Error no Axios / desconocido
  return {
    status: 0,
    code: "UNKNOWN_ERROR",
    message:
      (err instanceof Error && err.message) || "Ocurrió un error inesperado.",
    details: undefined,
    raw: err,
  };
}

/* ===========================
   Instancia de Axios compartida
=========================== */
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:4000";

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// Request: agrega Bearer token (lado cliente)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      if (!config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Response: rechaza SIEMPRE con NormalizedError
api.interceptors.response.use(
  (res) => res,
  (error: unknown) => Promise.reject(normalizeError(error))
);
