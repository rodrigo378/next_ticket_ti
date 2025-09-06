// src/utils/errorMap.tsx
import { Modal, message } from "antd";
import type { NormalizedError } from "@/services/api";

type Handler = (err: NormalizedError) => void;

export const errorMap: Record<
  NormalizedError["code"] | "UNKNOWN_ERROR",
  Handler
> = {
  OUT_OF_HOURS: (err) => {
    const ventanas: string[] = err.details?.ventanas ?? [];
    Modal.info({
      title: "Fuera de horario",
      content: (
        <div>
          <p>{err.message}</p>
          {ventanas.length > 0 && (
            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
              {ventanas.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          )}
        </div>
      ),
      okText: "Entendido",
    });
  },

  AREA_NO_SCHEDULE: (err) => {
    Modal.warning({
      title: "Área sin horario activo hoy",
      content: err.message,
      okText: "Cerrar",
    });
  },

  VALIDATION_FAILED: (err) => {
    // si no vas a pintar en el form, avisa por toast
    message.error(err.message || "Datos inválidos.");
  },

  UNAUTHORIZED: () => {
    Modal.warning({
      title: "Sesión expirada",
      content: "Vuelve a iniciar sesión.",
      okText: "Ir al login",
      onOk: () => (window.location.href = "/login"),
    });
  },

  FORBIDDEN: (err) => {
    Modal.error({
      title: "Acceso denegado",
      content: err.message || "No tienes permisos para esta acción.",
    });
  },

  NOT_FOUND: (err) => {
    Modal.info({
      title: "No encontrado",
      content: err.message || "El recurso no existe.",
    });
  },

  SERVER_ERROR: (err) => {
    Modal.error({
      title: "Error del servidor",
      content: err.message || "Inténtalo en unos minutos.",
    });
  },

  UNKNOWN_ERROR: (err) => {
    console.log("================");
    console.log("entro aca 1");
    console.log("err => ", err);
    console.log("================");
    message.error(err.message || "Ocurrió un error.");
  },
};
