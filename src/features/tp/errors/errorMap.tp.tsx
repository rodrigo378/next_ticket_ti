// ui/errors/tpErrorMap.tsx
"use client";
import { Modal } from "antd";
import type { NormalizedError } from "@/services/api";
import type { ErrorMap } from "@/shared/ui/errors/errorMap";

const asString = (x: unknown, fallback = "—") =>
  typeof x === "string" && x.trim().length > 0 ? x : fallback;

const asNumber = (x: unknown, fallback: number | string = "—") =>
  typeof x === "number" && Number.isFinite(x) ? x : fallback;

export const tpErrorMap: ErrorMap = {
  // =========================================================
  TP_FICHA_NOT_FOUND: (err: NormalizedError) => {
    // details: { usuario_id?: number }
    const usuarioId = asNumber(err.details?.usuario_id);
    Modal.warning({
      title: "Ficha no encontrada",
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            {err.message || "No existe una ficha registrada para este usuario."}
          </p>

          <div
            style={{
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Sugerencia</div>
            <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
              <li>Verifica el usuario seleccionado.</li>
              <li>
                Si corresponde, crea una nueva ficha (usuario_id:{" "}
                <strong>{String(usuarioId)}</strong>).
              </li>
            </ul>
          </div>
        </div>
      ),
      okText: "Entendido",
      centered: true,
      maskClosable: true,
    });
  },

  // =========================================================
  TP_FICHA_ALREADY_EXISTS: (err: NormalizedError) => {
    // details: { ficha_id?: number, usuario_id?: number }
    const fichaId = asNumber(err.details?.ficha_id);
    const usuarioId = asNumber(err.details?.usuario_id);
    Modal.error({
      title: "La ficha ya existe",
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            {err.message ||
              "El usuario ya tiene una ficha registrada. No se puede crear otra."}
          </p>
          <div
            style={{
              background: "#fffbe6",
              border: "1px solid #ffe58f",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Detalles</div>
            <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
              <li>
                ficha_id: <strong>{String(fichaId)}</strong>
              </li>
              <li>
                usuario_id: <strong>{String(usuarioId)}</strong>
              </li>
            </ul>
          </div>
        </div>
      ),
      okText: "Cerrar",
      centered: true,
      maskClosable: true,
      okButtonProps: { danger: true },
    });
  },

  // =========================================================
  TP_INVENTARIO_ALREADY_EXISTS: (err: NormalizedError) => {
    // details: { codigo?: string, inventario_id?: number }
    const codigo = asString(err.details?.codigo);
    const inventarioId = asNumber(err.details?.inventario_id);
    Modal.error({
      title: "Inventario duplicado",
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            {err.message ||
              "Ya existe un inventario con el mismo código. Cambia el código e inténtalo nuevamente."}
          </p>

          <div
            style={{
              background: "#fff1f0",
              border: "1px solid #ffa39e",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Registro existente
            </div>
            <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
              <li>
                Código: <strong>{codigo}</strong>
              </li>
              <li>
                inventario_id: <strong>{String(inventarioId)}</strong>
              </li>
            </ul>
          </div>
        </div>
      ),
      okText: "Entendido",
      centered: true,
      maskClosable: true,
      okButtonProps: { danger: true },
    });
  },

  // =========================================================
  TP_INVENTARIO_NOT_FOUND: (err: NormalizedError) => {
    // details: { inventario_id?: number, codigo?: string }
    const inventarioId = asNumber(err.details?.inventario_id);
    const codigo = asString(err.details?.codigo);
    Modal.warning({
      title: "Inventario no encontrado",
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            {err.message || "El inventario solicitado no existe."}
          </p>
          <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
            <li>
              inventario_id: <strong>{String(inventarioId)}</strong>
            </li>
            <li>
              código: <strong>{codigo}</strong>
            </li>
          </ul>
        </div>
      ),
      okText: "Entendido",
      centered: true,
      maskClosable: true,
    });
  },

  // =========================================================
  TP_LOTE_ALREADY_EXISTS: (err: NormalizedError) => {
    // details: { inventario_id?: number, codigoLote?: string, lote_id?: number }
    const inventarioId = asNumber(err.details?.inventario_id);
    const codigoLote = asString(err.details?.codigoLote);
    const loteId = asNumber(err.details?.lote_id);
    Modal.error({
      title: "Lote duplicado",
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            {err.message ||
              "Ya existe un lote con ese código para el inventario seleccionado."}
          </p>

          <div
            style={{
              background: "#fffbe6",
              border: "1px solid #ffe58f",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Detalles del lote
            </div>
            <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
              <li>
                Inventario: <strong>{String(inventarioId)}</strong>
              </li>
              <li>
                Código de lote: <strong>{codigoLote}</strong>
              </li>
              <li>
                lote_id: <strong>{String(loteId)}</strong>
              </li>
            </ul>
          </div>
        </div>
      ),
      okText: "Cerrar",
      centered: true,
      maskClosable: true,
      okButtonProps: { danger: true },
    });
  },
};
