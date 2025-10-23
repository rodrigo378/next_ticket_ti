/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import axios from "axios";
import {
  Upload,
  Select,
  Form,
  Button,
  message,
  Card,
  Spin,
  Typography,
  Alert,
  Divider,
  Table,
  Tag,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";

const { Option } = Select;
const { Title, Text } = Typography;

/** ---- Tipos ---- */
type ConvalidarResponse = {
  status: "ok";
  total_archivos: number;
  resultado_extraccion?: any;
  resultado_convalidacion?: any;
  convalidadas?: number;
  porcentaje_convalidacion_plan?: number; // 0–100 o 0–1
  porcentaje_convalidacion_real?: number; // 0–100 o 0–1
  costo_total_usd?: number;
};

type Row = {
  curso_plan: string;
  curso_extraido_equivalente: string | null;
  convalidable: boolean;
  razon: string;
};

/** ---- Normaliza estructura del backend a filas de tabla ---- */
const toRows = (payload: any): Row[] => {
  if (!payload) return [];

  const candidates = [
    payload,
    payload?.convalidaciones,
    payload?.detalle,
    payload?.items,
    payload?.matches,
    payload?.resultado,
    payload?.data,
  ].filter(Boolean);

  let arr: any[] = [];
  for (const c of candidates) {
    if (Array.isArray(c)) {
      arr = c;
      break;
    }
  }

  // Caso mapa plano { "PLAN": "EXTRAIDO", ... }
  if (!arr.length && typeof payload === "object") {
    const entries = Object.entries(payload);
    if (entries.length && typeof entries[0][1] !== "object") {
      return entries.map(([k, v]) => ({
        curso_plan: String(k),
        curso_extraido_equivalente: v ? String(v) : null,
        convalidable: Boolean(v),
        razon: v ? "" : "Sin equivalencia encontrada",
      }));
    }
  }

  const pick = (o: any, keys: string[], def?: any) => {
    for (const k of keys)
      if (o?.[k] !== undefined && o?.[k] !== null) return o[k];
    return def;
  };

  return arr.map((it: any) => ({
    curso_plan: String(
      pick(
        it,
        ["curso_plan", "plan_curso", "plan", "curso", "curso_del_plan"],
        ""
      )
    ),
    curso_extraido_equivalente:
      pick(
        it,
        [
          "curso_extraido_equivalente",
          "convalida_con",
          "extraido",
          "match",
          "curso_extraido",
          "equivalente",
          "origen",
        ],
        null
      )?.toString() ?? null,
    convalidable: Boolean(
      pick(it, ["convalidable", "ok", "match_ok", "valido", "is_match"], false)
    ),
    razon: String(pick(it, ["razon", "motivo", "reason", "explicacion"], "")),
  }));
};

export default function Page() {
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConvalidarResponse | null>(null);
  const [form] = Form.useForm();

  /** Upload */
  const props: UploadProps = {
    multiple: true,
    beforeUpload: (file) => {
      setFileList((prev) => [...prev, file]);
      return false;
    },
    fileList,
    onRemove: (file) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
    maxCount: 10,
    accept: ".jpg,.jpeg,.png,.pdf",
  };

  /** Normaliza % (0–1 → 0–100) */
  const normalizePct = (v?: number) =>
    v == null ? undefined : v <= 1 ? v * 100 : v;

  /** Submit */
  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error("Debes subir al menos un archivo.");
      return;
    }

    const c_codesp = "E4"; // ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES
    const modalidadMap: Record<string, number> = {
      presencial: 1,
      semipresencial: 2,
      virtual: 3,
    };
    const c_codmod = modalidadMap[values.modalidad];

    const fd = new FormData();
    fileList.forEach((f) => fd.append("files", f as File));
    fd.append("c_codesp", c_codesp);
    fd.append("c_codmod", String(c_codmod));

    setResult(null);
    setLoading(true);
    const hide = message.loading(
      "Procesando convalidación… esto puede tardar ~3 min",
      0
    );

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL!;
      const { data } = await axios.post<ConvalidarResponse>(
        `${baseURL}/api/admin/convalidar`,
        fd,
        { withCredentials: true, timeout: 300_000 }
      );
      setResult(data);
      message.success("Convalidación completada.");
    } catch (err: any) {
      if (err?.code === "ECONNABORTED")
        message.error(
          "La convalidación excedió el tiempo de espera. Inténtalo nuevamente."
        );
      else
        message.error(
          err?.response?.data?.message || err?.message || "Error al convalidar"
        );
    } finally {
      hide();
      setLoading(false);
    }
  };

  /** Valores de salida */
  const pctReal = normalizePct(result?.porcentaje_convalidacion_real);
  const rows = toRows(result?.resultado_convalidacion);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card
        title="Convalidación Académica"
        className="w-full max-w-5xl"
        bordered={false}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          form={form}
          className="space-y-4"
        >
          <Form.Item label="Archivo(s)" required>
            <Upload {...props}>
              <Button icon={<UploadOutlined />}>Subir archivo(s)</Button>
            </Upload>
            <Text type="secondary">
              Formatos permitidos: JPG, PNG, PDF. Máx. 10 archivos.
            </Text>
          </Form.Item>

          <Form.Item
            label="Carrera"
            name="carrera"
            initialValue="E4"
            rules={[{ required: true, message: "Seleccione una carrera" }]}
          >
            <Select disabled>
              <Option value="E4">
                ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Modalidad"
            name="modalidad"
            rules={[{ required: true, message: "Seleccione una modalidad" }]}
          >
            <Select placeholder="Selecciona una modalidad">
              <Option value="presencial">Presencial (1)</Option>
              <Option value="semipresencial">Semipresencial (2)</Option>
              <Option value="virtual">Virtual (3)</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Procesando…" : "Enviar solicitud"}
            </Button>
          </Form.Item>
        </Form>

        {loading && (
          <div className="w-full flex flex-col items-center justify-center mt-4 gap-2">
            <Spin tip="Analizando documentos y convalidando (≈3 min)..." />
            <Text type="secondary">
              No cierres esta ventana hasta finalizar.
            </Text>
          </div>
        )}

        {!loading && result && (
          <>
            <Divider />

            {/* --- RESULTADO ARRIBA --- */}
            <div className="w-full mb-4">
              <Title level={5} style={{ marginBottom: 8 }}>
                % Convalidación Real
              </Title>
              {typeof pctReal === "number" ? (
                <Title level={2} style={{ margin: 0 }}>
                  {pctReal.toFixed(2)}%
                </Title>
              ) : (
                <Alert
                  type="warning"
                  message="No se recibió el porcentaje de convalidación."
                  showIcon
                />
              )}
              {typeof result?.costo_total_usd === "number" && (
                <Text type="secondary">
                  Costo total estimado: ${result.costo_total_usd.toFixed(4)}
                </Text>
              )}
            </div>

            {/* --- TABLA ABAJO, SIN PAGINACIÓN --- */}
            <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>
              Detalle de cursos (plan vs récord)
            </Title>

            {rows.length ? (
              <Table<Row>
                size="small"
                rowKey={(_, i) => String(i)}
                dataSource={rows}
                pagination={false} // << sin paginación
                columns={[
                  {
                    title: "Curso del plan",
                    dataIndex: "curso_plan",
                    onCell: () => ({
                      style: { whiteSpace: "normal", wordBreak: "break-word" },
                    }),
                  },
                  {
                    title: "Curso del récord (match)",
                    dataIndex: "curso_extraido_equivalente",
                    render: (v) =>
                      v ?? <Text type="secondary">— sin match —</Text>,
                    onCell: () => ({
                      style: { whiteSpace: "normal", wordBreak: "break-word" },
                    }),
                  },
                  {
                    title: "Convalidable",
                    dataIndex: "convalidable",
                    width: 130,
                    render: (ok: boolean) =>
                      ok ? (
                        <Tag color="green">Sí</Tag>
                      ) : (
                        <Tag color="red">No</Tag>
                      ),
                  },
                  {
                    title: "Razón",
                    dataIndex: "razon",
                    render: (v: string) =>
                      v?.trim() ? v : <Text type="secondary">—</Text>,
                    onCell: () => ({
                      style: { whiteSpace: "normal", wordBreak: "break-word" },
                    }),
                  },
                ]}
              />
            ) : (
              <Alert
                type="info"
                message="No se detectaron equivalencias o el detalle no está disponible."
                showIcon
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
