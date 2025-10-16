"use client";
import { HD_Ticket } from "@interfaces/hd";
import {
  EyeOutlined,
  ExclamationCircleFilled,
  PushpinOutlined,
  SettingOutlined,
  SearchOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Divider,
  Input,
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
import dayjs from "@shared/date/dayjs";

// ===================================================================================
const { Text, Title } = Typography;
const TABKEY = "bandeja.table.mis_tickets";

// ===================================================================================
type ColumnKey =
  | "codigo"
  | "tipo"
  | "clasificacion"
  | "creado"
  | "fecha_creacion"
  | "estado"
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

// ===================================================================================
const MANDATORY_COLUMNS: ColumnKey[] = ["acciones"];

// ===================================================================================
const getDefaultKeys = (): ColumnKey[] => [
  "codigo",
  "tipo",
  "clasificacion",
  "creado",
  "fecha_creacion",
  "estado",
  "prioridad",
  "asunto",
  "acciones",
];

// ===================================================================================
const DISPLAY_ORDER: ColumnKey[] = [
  "codigo",
  "area",
  "tipo",
  "clasificacion",
  "creado",
  "fecha_creacion",
  "estado",
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

// ===================================================================================
interface Props {
  usuario: Partial<Core_Usuario>;
  tickets: HD_Ticket[];
  loading: boolean;
  hdRole: string | null;
  hdConfig: Record<string, unknown>;
  saveConfig: (data: {
    tabKey: string;
    config: Record<string, unknown>;
  }) => void;
}

// ===================================================================================
export default function TableTicketsAsignados({
  tickets,
  loading,
  hdRole,
  hdConfig,
  saveConfig,
}: Props) {
  const { token } = theme.useToken();

  // ===================================================================================
  const cfg = (hdConfig?.[TABKEY] ?? {}) as {
    visibleKeys?: ColumnKey[];
    filtros?: { area?: string | string[] };
  };

  // ===================================================================================
  const [visibleKeys, setVisibleKeys] = useState<ColumnKey[]>(
    cfg.visibleKeys?.length
      ? (cfg.visibleKeys as ColumnKey[])
      : getDefaultKeys()
  );

  // ===================================================================================
  const areaOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (tickets ?? []).map((t) => t.area?.nombre).filter(Boolean) as string[]
        )
      ).map((n) => ({ label: n, value: n })),
    [tickets]
  );

  // ===================================================================================
  const [areaFilter, setAreaFilter] = useState<string[]>(
    cfg.filtros?.area
      ? Array.isArray(cfg.filtros.area)
        ? cfg.filtros.area
        : [cfg.filtros.area]
      : []
  );

  // ===================================================================================
  const [creadoFilter, setCreadoFilter] = useState<string | null>(null);
  const [prioridadFilter, setPrioridadFilter] = useState<string[]>([]);

  // ===================================================================================
  const persistVisible = (keys: ColumnKey[]) => {
    const finalKeys = Array.from(new Set([...keys, ...MANDATORY_COLUMNS]));
    setVisibleKeys(finalKeys);
    saveConfig({
      tabKey: TABKEY,
      config: { visibleKeys: finalKeys },
    });
  };

  // ===================================================================================
  const onTableChange: TableProps<HD_Ticket>["onChange"] = (_, filters) => {
    const fArea = (filters.area as string[]) ?? [];
    const fPri = (filters.prioridad as string[]) ?? [];
    const fCre = (filters.creado as string[]) ?? [];

    setAreaFilter(fArea);
    setPrioridadFilter(fPri);
    setCreadoFilter(fCre[0] ?? null);

    // si quieres guardar en config solo el área, lo dejas igual:
    // saveConfig({ tabKey: TABKEY, config: { filtros: { area: fArea } } });
  };

  // ===================================================================================
  const columnsByKey: Record<ColumnKey, ColumnsType<HD_Ticket>[number]> =
    useMemo(
      () => ({
        // Generales
        // ===================================================================================
        codigo: {
          title: <span style={{ whiteSpace: "nowrap" }}>Código</span>,
          dataIndex: "codigo",
          key: "codigo",
          sorter: (a, b) => a.codigo.localeCompare(b.codigo),
          render: (v) => (
            <Space size={6}>
              <InboxOutlined />
              <Typography.Text code>{v}</Typography.Text>
            </Space>
          ),
        },

        // ===================================================================================
        area: {
          title: "Área",
          dataIndex: ["area", "nombre"],
          key: "area",
          filters: areaOptions.map((o) => ({ text: o.label, value: o.value })),
          filterSearch: true,
          filteredValue: areaFilter.length ? areaFilter : null,
          onFilter: (value, record) =>
            (record.area?.nombre ?? "").toLowerCase() ===
            String(value).toLowerCase(),
          render: (_, record: HD_Ticket) => (
            <span>{record.area?.nombre ?? "—"}</span>
          ),
        },

        // ===================================================================================
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
                <Icono style={{ color, marginRight: 6 }} />
                {tipo}
              </span>
            );
          },
        },

        // ===================================================================================
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

        // ===================================================================================
        fecha_creacion: {
          title: "Fecha de creación",
          key: "fecha_creacion",
          dataIndex: "createdAt",
          defaultSortOrder: "descend",
          sorter: (a: HD_Ticket, b: HD_Ticket) => {
            const da = a.createdAt ? dayjs(a.createdAt).valueOf() : 0;
            const db = b.createdAt ? dayjs(b.createdAt).valueOf() : 0;
            return da - db;
          },
          onCell: (record: HD_Ticket) => {
            const p = record.prioridad?.nombre;
            let bg: string | undefined;
            if (p === "Alta") bg = "#fff1f0";
            else if (p === "Media") bg = "#fff8db";
            else if (p === "Baja") bg = "#e6ffed";
            return bg ? { style: { backgroundColor: bg } } : {};
          },
          render: (fecha?: string) => {
            if (!fecha) return "—";
            const d = dayjs(fecha);
            return (
              <Tooltip title={d.toISOString()}>
                <div>
                  <span>{d.format("DD/MM/YYYY HH:mm")}</span>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {d.fromNow()}
                  </Text>
                </div>
              </Tooltip>
            );
          },
        },

        // ===================================================================================
        creado: {
          title: "Creado por",
          key: "creado",
          dataIndex: "creado",
          filteredValue: creadoFilter ? [creadoFilter] : null,
          filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
          }) => (
            <div style={{ padding: 8 }}>
              <Input
                autoFocus
                placeholder="Buscar por nombre"
                value={selectedKeys[0]}
                onChange={(e) =>
                  setSelectedKeys(e.target.value ? [e.target.value] : [])
                }
                onPressEnter={() => confirm()}
                style={{ width: 188, marginBottom: 8, display: "block" }}
              />
              <Space>
                <Button
                  type="primary"
                  onClick={() => confirm()}
                  icon={<SearchOutlined />}
                  size="small"
                >
                  Buscar
                </Button>
                <Button
                  onClick={() => {
                    clearFilters?.();
                    setSelectedKeys([]);
                    confirm();
                  }}
                  size="small"
                >
                  Reset
                </Button>
              </Space>
            </div>
          ),
          filterIcon: (filtered: boolean) => (
            <SearchOutlined
              style={{ color: filtered ? "#1677ff" : undefined }}
            />
          ),
          onFilter: (value, record) => {
            const fullName = `${record.titular?.nombre ?? ""} ${
              record.titular?.apellidos ?? ""
            }`.toLowerCase();
            return fullName.includes(String(value).toLowerCase());
          },
          render: (_, record: HD_Ticket) => (
            <div className="flex flex-col !items-start">
              <span>{`${record.titular?.nombre ?? ""} ${
                record.titular?.apellidos ?? ""
              }`}</span>
              <Tag color={record.titular?.rol_id === 3 ? "blue" : "green"}>
                {record.titular?.rol_id === 3 ? "Alumno" : "Administrativo"}
              </Tag>
            </div>
          ),
        },

        // ===================================================================================
        estado: {
          title: "Estado",
          key: "estado",
          dataIndex: ["estado", "nombre"],
        },

        // ===================================================================================
        prioridad: {
          title: "Prioridad",
          key: "prioridad",
          filters: [
            { text: "Alta", value: "Alta" },
            { text: "Media", value: "Media" },
            { text: "Baja", value: "Baja" },
          ],
          filteredValue: prioridadFilter.length ? prioridadFilter : null,
          onFilter: (value, record) =>
            (record.prioridad?.nombre ?? "").toLowerCase() ===
            String(value).toLowerCase(),
          render: (record: HD_Ticket) => {
            const prioridad = record.prioridad?.nombre ?? "—";
            let style: React.CSSProperties = {};
            switch (prioridad) {
              case "Alta":
                style = {
                  color: "#a8071a",
                  background: "#fff1f0",
                  borderColor: "#ffa39e",
                };
                break;
              case "Media":
                style = {
                  color: "#ad6800",
                  background: "#fff7e6",
                  borderColor: "#ffd591",
                };
                break;
              case "Baja":
                style = {
                  color: "#135200",
                  background: "#f6ffed",
                  borderColor: "#b7eb8f",
                };
                break;
              default:
                style = {};
            }
            return <Tag style={style}>{prioridad}</Tag>;
          },
        },

        // ===================================================================================
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
      [token, areaOptions, areaFilter, creadoFilter, prioridadFilter]
    );

  // ===================================================================================
  const OPTION_LABELS: Record<ColumnKey, string> = {
    // generales
    codigo: "Código",
    tipo: "Tipo",
    clasificacion: "Clasificación",
    creado: "Creado por",
    fecha_creacion: "Creado",
    estado: "Estado",
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

  // ===================================================================================
  const [modalOpen, setModalOpen] = useState(false);

  // ===================================================================================
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

  // ===================================================================================
  const baseKeys: ColumnKey[] = [
    "codigo",
    "tipo",
    "clasificacion",
    "creado",
    "fecha_creacion",
    "estado",
    "prioridad",
    "asunto",
  ];

  // ===================================================================================
  const l4Keys: ColumnKey[] = [
    "area",
    "col_l4",
    "n4_sla_objetivo",
    "n4_observaciones",
  ];

  // ===================================================================================
  const l5Keys: ColumnKey[] = ["col_l5", "n5_impacto", "n5_costo_estimado"];

  // ===================================================================================
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

  // ===================================================================================
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
        pagination={{ pageSize: 10, responsive: true }}
        sticky
        scroll={{ x: "max-content" }}
        onRow={(record) => {
          const p = record.prioridad?.nombre;
          let bg: string | undefined;

          if (p === "Alta") bg = "#fff1f0";
          else if (p === "Media") bg = "#fff8db";
          else if (p === "Baja") bg = "#e6ffed";

          return bg ? { style: { backgroundColor: bg } } : {};
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
