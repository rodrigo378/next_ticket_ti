// src/services/api.ts
import axios, { AxiosError, AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface NormalizedError {
  status: number;
  code: string;
  message: string;
  details?: {
    ventanas?: string[];
    fieldErrors?: Record<string, string | string[]>;
    [k: string]: unknown;
  };
  raw?: unknown;
}

function mapHttpToCode(status?: number): string {
  switch (status) {
    case 400:
      return "HD_VALIDATION_FAILED";
    case 401:
      return "HD_UNAUTHORIZED";
    case 403:
      return "HD_FORBIDDEN";
    case 404:
      return "HD_NOT_FOUND";
    case 500:
      return "HD_SERVER_ERROR";
    default:
      return "HD_SERVER_ERROR";
  }
}

type BackendErrorPayload = {
  status?: number;
  code?: string;
  message?: string;
  details?: {
    ventanas?: string[];
    fieldErrors?: Record<string, string | string[]>;
    [k: string]: unknown;
  };
};

export function normalizeError(err: unknown): NormalizedError {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<BackendErrorPayload>;
    const status = ax.response?.status ?? 0;
    const data = ax.response?.data;

    if (
      data &&
      typeof data === "object" &&
      "code" in data &&
      "message" in data
    ) {
      return {
        status: typeof data.status === "number" ? data.status : status,
        code: String(data.code),
        message: String(data.message ?? "Ocurrió un error."),
        details: data.details,
        raw: err,
      };
    }

    return {
      status,
      code: mapHttpToCode(status),
      message:
        ax.message ||
        (status
          ? `Error HTTP ${status}`
          : "No se pudo conectar con el servidor."),
      raw: err,
    };
  }

  return {
    status: 0,
    code: "HD_SERVER_ERROR",
    message:
      (err instanceof Error && err.message) || "Ocurrió un error inesperado.",
    raw: err,
  };
}

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: unknown) => Promise.reject(normalizeError(error))
);
