"use client";
import { Modal } from "antd";
import type { NormalizedError } from "@/services/api";
import { errorMap as baseMap, type ErrorMap } from "./errorMap";

export function handleApiError(err: NormalizedError, extraMap?: ErrorMap) {
  const map = extraMap ? { ...baseMap, ...extraMap } : baseMap;
  const handler = map[err.code] ?? map.UNKNOWN_ERROR;

  try {
    handler(err);
  } catch (boom) {
    console.error("Fallo mostrando modal:", boom, "error=", err);
    Modal.error({
      title: "Error",
      content: err.message || "Ocurrió un error.",
    });
  }
}
