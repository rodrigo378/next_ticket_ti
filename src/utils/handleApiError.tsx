// src/utils/handleApiError.ts
import { message } from "antd";
import { errorMap } from "./errorMap";
import { normalizeError, NormalizedError } from "@/services/api";

export function handleApiError(error: unknown) {
  const err: NormalizedError = normalizeError(error);
  const handler = errorMap[err.code] ?? errorMap.UNKNOWN_ERROR;

  try {
    handler(err);
  } catch {
    message.error(err.message || "Ocurrió un error.");
  }
}
