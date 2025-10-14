"use client";
import { HD_Ticket } from "@interfaces/hd";
import {
  EyeOutlined,
  ExclamationCircleFilled,
  PushpinOutlined,
  SettingOutlined,
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
import type { TableProps } from "antd/es/table";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Core_Usuario } from "@/interfaces/core";
import { upsertConfig } from "@/services/core";

const { Text, Title } = Typography;

// --- clave única de esta tabla ---
const TABKEY = "bandeja.table.mis_tickets";

/** Identificadores únicos de columnas (generales + L4 + L5 + acciones) */
type ColumnKey =
  | "codigo"
  | "tipo"
  | "clasificacion"
  | "creado"
  | "prioridad"
  | "asunto"
  // L4
  | "area"
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

/** Defaults para Asignados a mí (solo generales + acciones) */
const getDefaultKeys = (): ColumnKey[] => [
  "codigo",
  "tipo",
  "clasificacion",
  "creado",
  "prioridad",
  "asunto",
  "acciones",
];

const DISPLAY_ORDER: ColumnKey[] = [
  "codigo",
  "area", // <- justo después de "codigo"
  "tipo",
  "clasificacion",
  "creado",
  "prioridad",
  "asunto",
  // L4
  "col_l4",
  "n4_sla_objetivo",
  "n4_observaciones",
  // L5
  "col_l5",
  "n5_impacto",
  "n5_costo_estimado",
  // acción
  "acciones",
];

interface Props {
  usuario: Partial<Core_Usuario>;
  tickets: HD_Ticket[];
  loading: boolean;
  hdRole: string | null;
  // ⬇️ configuración del módulo traída del context (/core/iam/context)
  // esperada forma:
  // {
  //   "bandeja.table.mis_tickets": {
  //     visibleKeys?: ColumnKey[],
  //     filtros?: { area?: string | string[] }
  //   },
  //   ...
  // }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hdConfig: any;
}

export default function TableTicketsAsignados({
  usuario,
  tickets,
  loading,
  hdRole,
  hdConfig,
}: Props) {
  const { token } = theme.useToken();

  // ====== CONFIG INICIAL DESDE hdConfig ======
  const cfg = (hdConfig?.[TABKEY] ?? {}) as {
    visibleKeys?: ColumnKey[];
    filtros?: { area?: string | string[] };
  };

  // columnas visibles (con fallback)
  const [visibleKeys, setVisibleKeys] = useState<ColumnKey[]>(
    cfg.visibleKeys?.length
      ? (cfg.visibleKeys as ColumnKey[])
      : getDefaultKeys()
  );

  // Opciones únicas desde los tickets para Área
  const areaOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (tickets ?? []).map((t) => t.area?.nombre).filter(Boolean) as string[]
        )
      ).map((n) => ({ label: n, value: n })),
    [tickets]
  );

  // Filtro controlado de Área (inicia desde config)
  const [areaFilter, setAreaFilter] = useState<string[]>(
    cfg.filtros?.area
      ? Array.isArray(cfg.filtros.area)
        ? cfg.filtros.area
        : [cfg.filtros.area]
      : []
  );

  // ====== persistencia remota SOLO de este tab ======
  const saveConfig = async (partial: Record<string, unknown>) => {
    try {
      await upsertConfig({
        modulo: "HD",
        tabKey: TABKEY,
        // axios serializa; lado servidor haces merge por tabKey
        config: partial,
      });
    } catch (e) {
      console.error("upsertConfig error", e);
    }
  };

  // ====== Persistencia de columnas ======
  const persistVisible = (keys: ColumnKey[]) => {
    const finalKeys = Array.from(new Set([...keys, ...MANDATORY_COLUMNS]));
    setVisibleKeys(finalKeys);
    saveConfig({ visibleKeys: finalKeys });
  };

  // ====== Cambios de filtros de la tabla (header de Área) ======
  const onTableChange: TableProps<HD_Ticket>["onChange"] = (_, filters) => {
    const f = (filters.area as string[]) ?? [];
    setAreaFilter(f);
    saveConfig({ filtros: { area: f } });
  };

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

        area: {
          title: "Área",
          dataIndex: ["area", "nombre"],
          key: "area",
          filters: areaOptions.map((o) => ({ text: o.label, value: o.value })),
          filterSearch: true,
          filteredValue: areaFilter.length ? areaFilter : null, // controlado
          onFilter: (value, record) =>
            (record.area?.nombre ?? "").toLowerCase() ===
            String(value).toLowerCase(),
          render: (_, record: HD_Ticket) => (
            <span>{record.area?.nombre ?? "—"}</span>
          ),
        },

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
      // deps
      [usuario?.id, token, areaOptions, areaFilter]
    );

  /** Etiquetas para el selector del modal */
  const OPTION_LABELS: Record<ColumnKey, string> = {
    // generales
    codigo: "Código",
    tipo: "Tipo",
    clasificacion: "Clasificación",
    creado: "Creado por",
    prioridad: "Prioridad",
    asunto: "Asunto",
    // L4
    area: "Área",
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

  // Modal de columnas
  const [modalOpen, setModalOpen] = useState(false);

  const tableColumns: ColumnsType<HD_Ticket> = useMemo(() => {
    const orderIndex = (k: ColumnKey) => {
      const i = DISPLAY_ORDER.indexOf(k);
      return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };
    return visibleKeys
      .slice()
      .sort((a, b) => orderIndex(a) - orderIndex(b))
      .map((k) => columnsByKey[k])
      .filter(Boolean);
  }, [visibleKeys, columnsByKey]);

  /** Grupos del modal */
  const baseKeys: ColumnKey[] = [
    "codigo",
    "tipo",
    "clasificacion",
    "creado",
    "prioridad",
    "asunto",
  ];
  const l4Keys: ColumnKey[] = [
    "area",
    "col_l4",
    "n4_sla_objetivo",
    "n4_observaciones",
  ];
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

  return (
    <div className="rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <Text strong>Tickets • Asignados a mí</Text>
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
        onChange={onTableChange}
      />

      <Modal
        title="Configurar columnas"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <div>
              <Button onClick={() => persistVisible(getDefaultKeys())}>
                Restablecer
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() =>
                  persistVisible(Object.keys(columnsByKey) as ColumnKey[])
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
          Personaliza columnas para <b>Asignados a mí</b>. Se guarda por usuario
          en el módulo HD.
        </Text>

        <Divider style={{ margin: "12px 0" }} />

        <Checkbox.Group
          style={{ width: "100%" }}
          value={visibleKeys}
          onChange={(v) => persistVisible(v as ColumnKey[])}
        >
          <Title level={5} style={{ marginTop: 0 }}>
            Campos generales
          </Title>
          {renderCheckboxGrid(baseKeys)}

          <Divider style={{ margin: "12px 0" }} />

          {hdRole === "nivel_4" && (
            <>
              <Title level={5} style={{ marginTop: 0 }}>
                nivel_4
              </Title>
              {renderCheckboxGrid(l4Keys)}

              <Divider style={{ margin: "12px 0" }} />
            </>
          )}

          {hdRole === "nivel_5" && (
            <>
              <Title level={5} style={{ marginTop: 0 }}>
                nivel_5
              </Title>
              {renderCheckboxGrid(l5Keys)}
            </>
          )}
        </Checkbox.Group>
      </Modal>
    </div>
  );
}
