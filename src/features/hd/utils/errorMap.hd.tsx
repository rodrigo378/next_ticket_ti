"use client";
import { Modal } from "antd";
import type { NormalizedError } from "@/services/api";
import type { ErrorMap } from "@/utils/errorMap";

const toArray = (x: unknown): string[] =>
  Array.isArray(x) ? x.map(String) : x ? [String(x)] : [];

export const hdErrorMap: ErrorMap = {
  HD_OUT_OF_AREA_HOURS: (err: NormalizedError) => {
    console.log("err => ", err);

    const ventanas = toArray(err.details?.ventanas);

    Modal.error({
      title: "Fuera de horario",
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>{err.message}</p>

          {ventanas.length > 0 && (
            <div
              style={{
                background: "#fff1f0",
                border: "1px solid #ffa39e",
                padding: 10,
                borderRadius: 8,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                Ventanas de atención para hoy
              </div>
              <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                {ventanas.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
      okText: "Cerrar",
      centered: true,
      maskClosable: true,
      keyboard: true,
      closable: true,
      okButtonProps: { danger: true },
    });
  },
};
