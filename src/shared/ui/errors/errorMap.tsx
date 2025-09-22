"use client";
import { Modal } from "antd";
import type { NormalizedError } from "@/services/api";

type Handler = (err: NormalizedError) => void;
export type ErrorMap = Record<string, Handler>;

export const errorMap: ErrorMap = {
  UNKNOWN_ERROR: (err) =>
    Modal.error({
      title: "Error",
      content: err.message || "Ocurrió un error inesperado.",
      okText: "Cerrar",
      centered: true,
      maskClosable: true,
      keyboard: true,
      closable: true,
      okButtonProps: { danger: true },
    }),
};
