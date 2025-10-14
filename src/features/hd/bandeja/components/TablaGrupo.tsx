"use client";
import { HD_Ticket } from "@interfaces/hd";
import {
  EyeOutlined,
  ExclamationCircleFilled,
  PushpinOutlined,
  SettingOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Divider,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Core_Usuario } from "@/interfaces/core";

const { Text, Title } = Typography;

interface Props {
  usuario: Partial<Core_Usuario>;
  tickets: HD_Ticket[];
  loading: boolean;
}

/** Identificadores únicos de columnas (generales + L4 + L5 + acciones) */
type ColumnKey =
  | "codigo"
  | "tipo"
  | "clasificacion"
  | "creado"
  | "prioridad"
  | "estado_asignado"
  | "asunto"
  | "asignado_a" // <- exclusivo de grupo
  // L4
  | "col_l4"
  | "n4_sla_objetivo"
  | "n4_observaciones"
  // L5
  | "col_l5"
  | "n5_impacto"
  | "n5_costo_estimado"
  // acción
  | "acciones";

/** Columnas obligatorias */
const MANDATORY_COLUMNS: ColumnKey[] = ["acciones"];

/** Defaults para “Del grupo” */
const getDefaultKeys = (): ColumnKey[] => [
  "codigo",
  "tipo",
  "clasificacion",
  "creado",
  "prioridad",
  "estado_asignado",
  "asunto",
  "asignado_a",
  "acciones",
];

const STORAGE_KEY = "hd_columns_grupo";

export default function TableTicketsGrupo({
  tickets,
  loading,
  usuario,
}: Props) {
  const { token } = theme.useToken();

  const prioridadColor: Record<string, string> = {
    Alta: token.colorError,
    Media: token.colorWarning,
    Baja: token.colorSuccess,
  };
  const prioridadBg: Record<string, string> = {
    Alta: token.colorErrorBg,
    Media: token.colorWarningBg,
    Baja: token.colorSuccessBg,
  };
  const iconStyle = { fontSize: 16, lineHeight: 1 };

  /** TODAS las columnas disponibles para este tab */
  const columnsByKey: Record<ColumnKey, ColumnsType<HD_Ticket>[number]> =
    useMemo(
      () => ({
        // Generales
        codigo: { title: "Código", dataIndex: "codigo", key: "codigo" },

        tipo: {
          title: "Tipo",
          key: "tipo",
          render: (record: HD_Ticket) => {
            const tipo = record.categoria?.incidencia?.tipo;
            const isReq = tipo === "requerimiento";
            const Icono = isReq ? PushpinOutlined : ExclamationCircleFilled;
            const color = isReq ? token.colorTextSecondary : token.colorWarning;
            return (
              <span style={{ color: token.colorText }}>
                <Icono style={{ ...iconStyle, color, marginRight: 6 }} />
                {tipo}
              </span>
            );
          },
        },

        clasificacion: {
          title: "Clasificación",
          key: "clasificacion",
          render: (record: HD_Ticket) => (
            <span style={{ color: token.colorTextSecondary }}>
              {record.categoria?.incidencia?.nombre} /{" "}
              <b style={{ color: token.colorText }}>
                {record.categoria?.nombre}
              </b>
            </span>
          ),
        },

        creado: {
          title: "Creado por",
          key: "creado_id",
          render: (record: HD_Ticket) => (
            <div className="flex flex-col !items-start">
              <span>{`${record.creado?.nombre || ""} ${
                record.creado?.apellidos || ""
              }`}</span>
              <Tag color={record.creado?.rol_id === 3 ? "blue" : "green"}>
                {record.creado?.rol_id === 3 ? `Alumno` : `Administrativo`}
              </Tag>
            </div>
          ),
        },

        prioridad: {
          title: "Prioridad",
          key: "prioridad",
          render: (record: HD_Ticket) => {
            const prioridad = record.prioridad?.nombre;
            const color = prioridadColor[prioridad ?? ""] ?? token.colorText;
            const bg = prioridadBg[prioridad ?? ""] ?? token.colorFillTertiary;
            return (
              <Tag style={{ color, background: bg, borderColor: color }}>
                {prioridad ?? "—"}
              </Tag>
            );
          },
        },

        estado_asignado: {
          title: "Estado / Asignado",
          key: "estado",
          render: (record: HD_Ticket) => {
            const asignado = record.asignado_id === usuario?.id;
            return (
              <Space>
                {asignado ? (
                  <CheckCircleFilled
                    style={{ ...iconStyle, color: token.colorSuccess }}
                    aria-label="Asignado a mí"
                  />
                ) : (
                  <CloseCircleFilled
                    style={{ ...iconStyle, color: token.colorError }}
                    aria-label="No asignado a mí"
                  />
                )}
                <Tag
                  style={{
                    color: token.colorInfoText,
                    background: token.colorInfoBg,
                    borderColor: token.colorInfo,
                  }}
                >
                  {record.estado?.nombre || "Sin estado"}
                </Tag>
              </Space>
            );
          },
        },

        asunto: {
          title: "Asunto",
          key: "asunto",
          render: (record: HD_Ticket) => (
            <Tooltip title={record.descripcion}>
              <span
                style={{
                  maxWidth: 220,
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: token.colorText,
                }}
              >
                {record.descripcion}
              </span>
            </Tooltip>
          ),
        },

        asignado_a: {
          title: "Asignado a",
          key: "asignado_a",
          render: (record: HD_Ticket) =>
            record.asignado ? (
              <div className="flex flex-col !items-start">
                <span>{`${record.asignado?.nombre || ""} ${
                  record.asignado?.apellidos || ""
                }`}</span>
              </div>
            ) : (
              <Tag color="default">Sin asignación</Tag>
            ),
        },

        // --- nivel_4 (campos de prueba) ---
        col_l4: {
          title: "L4 • Indicador",
          key: "col_l4",
          render: () => <span>Escalado L4</span>,
        },
        n4_sla_objetivo: {
          title: "L4 • SLA objetivo",
          key: "n4_sla_objetivo",
          render: () => <span>4h hábiles</span>,
        },
        n4_observaciones: {
          title: "L4 • Observaciones",
          key: "n4_observaciones",
          render: () => <span>Validación proveedor</span>,
        },

        // --- nivel_5 (campos de prueba) ---
        col_l5: {
          title: "L5 • Indicador",
          key: "col_l5",
          render: () => <span>Escalado L5</span>,
        },
        n5_impacto: {
          title: "L5 • Impacto",
          key: "n5_impacto",
          render: () => <Tag>Crítico</Tag>,
        },
        n5_costo_estimado: {
          title: "L5 • Costo estimado",
          key: "n5_costo_estimado",
          render: () => <span>S/ 1,250.00</span>,
        },

        // Acción
        acciones: {
          title: "Acciones",
          key: "acciones",
          render: (record: HD_Ticket) => (
            <Link href={`/hd/bandeja/${record.id}`}>
              <Button
                type="link"
                icon={<EyeOutlined />}
                style={{ color: token.colorLink }}
              >
                Ver
              </Button>
            </Link>
          ),
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [token]
    );

  /** Etiquetas para el selector */
  const OPTION_LABELS: Record<ColumnKey, string> = {
    // generales
    codigo: "Código",
    tipo: "Tipo",
    clasificacion: "Clasificación",
    creado: "Creado por",
    prioridad: "Prioridad",
    estado_asignado: "Estado / Asignado",
    asunto: "Asunto",
    asignado_a: "Asignado a",
    // L4
    col_l4: "L4 • Indicador",
    n4_sla_objetivo: "L4 • SLA objetivo",
    n4_observaciones: "L4 • Observaciones",
    // L5
    col_l5: "L5 • Indicador",
    n5_impacto: "L5 • Impacto",
    n5_costo_estimado: "L5 • Costo estimado",
    // acción
    acciones: "Acciones",
  };

  /** Estado y persistencia (solo para este tab) */
  const [visibleKeys, setVisibleKeys] = useState<ColumnKey[]>(getDefaultKeys());
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ColumnKey[];
        const merged = Array.from(
          new Set([...parsed, ...MANDATORY_COLUMNS, ...getDefaultKeys()])
        );
        setVisibleKeys(merged);
        return;
      } catch {}
    }
    setVisibleKeys(getDefaultKeys());
  }, []);

  const persist = (keys: ColumnKey[]) => {
    const finalKeys = Array.from(new Set([...keys, ...MANDATORY_COLUMNS]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalKeys));
    setVisibleKeys(finalKeys);
  };

  /** Columnas finales (respeta el orden en visibleKeys) */
  const tableColumns: ColumnsType<HD_Ticket> = useMemo(
    () => visibleKeys.map((k) => columnsByKey[k]).filter(Boolean),
    [visibleKeys, columnsByKey]
  );

  /** Grupos del modal */
  const baseKeys: ColumnKey[] = [
    "codigo",
    "tipo",
    "clasificacion",
    "creado",
    "prioridad",
    "estado_asignado",
    "asunto",
    "asignado_a",
  ];
  const l4Keys: ColumnKey[] = ["col_l4", "n4_sla_objetivo", "n4_observaciones"];
  const l5Keys: ColumnKey[] = ["col_l5", "n5_impacto", "n5_costo_estimado"];

  const renderCheckboxGrid = (keys: ColumnKey[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {keys.map((key) => (
        <Checkbox
          key={key}
          value={key}
          disabled={MANDATORY_COLUMNS.includes(key)}
        >
          {OPTION_LABELS[key]}
          {MANDATORY_COLUMNS.includes(key) && (
            <Text type="secondary" style={{ marginLeft: 6 }}>
              (obligatoria)
            </Text>
          )}
        </Checkbox>
      ))}
    </div>
  );

  /** Render */
  return (
    <div className="rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <Text strong>Tickets • Del grupo</Text>
        <Space>
          <Button icon={<SettingOutlined />} onClick={() => setModalOpen(true)}>
            Columnas
          </Button>
        </Space>
      </div>

      <Table
        columns={tableColumns}
        dataSource={tickets}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1200 }}
        onRow={(record) => {
          const p = record.prioridad?.nombre;
          let bg: string | undefined;
          if (p === "Alta") bg = token.colorErrorBg;
          else if (p === "Media") bg = token.colorWarningBg;
          else if (p === "Baja") bg = token.colorSuccessBg;
          return bg ? { style: { background: bg } } : {};
        }}
      />

      <Modal
        title="Configurar columnas"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <div>
              <Button onClick={() => persist(getDefaultKeys())}>
                Restablecer
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() =>
                  persist(Object.keys(columnsByKey) as ColumnKey[])
                }
              >
                Seleccionar todo
              </Button>
            </div>
            <Button type="primary" onClick={() => setModalOpen(false)}>
              Aplicar y cerrar
            </Button>
          </Space>
        }
      >
        <Text type="secondary">
          Personaliza columnas para <b>Del grupo</b>. Se guarda localmente.
        </Text>

        <Divider style={{ margin: "12px 0" }} />

        <Checkbox.Group
          style={{ width: "100%" }}
          value={visibleKeys}
          onChange={(v) => persist(v as ColumnKey[])}
        >
          {/* Generales */}
          <Title level={5} style={{ marginTop: 0 }}>
            Campos generales
          </Title>
          {renderCheckboxGrid(baseKeys)}

          <Divider style={{ margin: "12px 0" }} />

          {/* nivel_4 */}
          <Title level={5} style={{ marginTop: 0 }}>
            nivel_4
          </Title>
          {renderCheckboxGrid(l4Keys)}

          <Divider style={{ margin: "12px 0" }} />

          {/* nivel_5 */}
          <Title level={5} style={{ marginTop: 0 }}>
            nivel_5
          </Title>
          {renderCheckboxGrid(l5Keys)}
        </Checkbox.Group>
      </Modal>
    </div>
  );
}
