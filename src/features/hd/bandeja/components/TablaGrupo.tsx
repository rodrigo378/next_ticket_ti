"use client";
import { HD_Ticket } from "@interfaces/hd";
import {
  EyeOutlined,
  ExclamationCircleFilled,
  PushpinOutlined,
  SettingOutlined,
  SearchOutlined,
  InboxOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
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
// Helpers de fecha/SLA (fuera del componente para evitar deps de hooks)
type DateLike = string | Date | number | null | undefined;

const toDayjs = (v: DateLike) => (v != null ? dayjs(v) : null);

const fmt = (v: DateLike) => {
  const d = toDayjs(v);
  return d ? d.format("DD/MM/YYYY HH:mm") : "—";
};

const fromNow = (v: DateLike) => {
  const d = toDayjs(v);
  return d ? d.fromNow() : "—";
};

const secondsLeft = (v: DateLike) => {
  const d = toDayjs(v);
  return d ? d.diff(dayjs(), "second") : null;
};

const toISO = (v: DateLike): string | undefined => {
  const d = toDayjs(v);
  return d ? d.toISOString() : undefined;
};

const SLA_TAG = (v: DateLike) => {
  const d = toDayjs(v);
  if (!d) return <Tag>—</Tag>;
  const secs = d.diff(dayjs(), "second");
  const human = d.fromNow(true); // sin sufijo
  if (secs > 3600) return <Tag>{`${human} restantes`}</Tag>;
  if (secs > 0) return <Tag color="gold">{`${human} restantes`}</Tag>;
  return <Tag color="red">{`VENCIDO hace ${human}`}</Tag>;
};

const SLA_ESTADO = (r: HD_Ticket) => {
  const respLeft = secondsLeft(r.slaTicket?.tiempo_estimado_respuesta) ?? 0;
  const resolLeft = secondsLeft(r.slaTicket?.tiempo_estimado_resolucion) ?? 0;

  if (r.slaTicket?.cumplido) return <Tag color="blue">Cumplido</Tag>;
  if (resolLeft < 0) return <Tag color="red">Vencido resolución</Tag>;
  if (respLeft < 0) return <Tag color="gold">Vencido respuesta</Tag>;
  return <Tag color="green">Dentro de SLA</Tag>;
};

// ===================================================================================
const { Text, Title } = Typography;
const TABKEY = "bandeja.table.grupo";

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
  // L4 (existentes)
  | "area"
  | "col_l4"
  | "n4_sla_objetivo"
  | "n4_observaciones"
  // L5 (existentes)
  | "col_l5"
  | "n5_impacto"
  | "n5_costo_estimado"
  // NUEVOS GENERALES
  | "asignado_a"
  // NUEVOS L4 (auditoría)
  | "l4_estado_sla"
  | "l4_resp_combo"
  | "l4_resp_termino"
  | "l4_resol_combo"
  | "asignado_el"
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
  "asignado_a",
  "acciones",
];

// ===================================================================================
// Orden sugerido (sin duplicados)
const DISPLAY_ORDER: ColumnKey[] = [
  "codigo",
  "area",
  "tipo",
  "clasificacion",
  "creado",
  "asignado_a",
  "estado",
  "prioridad",
  "fecha_creacion",
  "asunto",
  // Auditoría L4
  "l4_estado_sla",
  "l4_resp_combo",
  "l4_resp_termino",
  "l4_resol_combo",
  "asignado_el",
  // Pruebas L4
  "col_l4",
  "n4_sla_objetivo",
  "n4_observaciones",
  // Pruebas L5
  "col_l5",
  "n5_impacto",
  "n5_costo_estimado",
  // Acción
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
export default function TableGrupo({
  tickets,
  loading,
  hdRole,
  hdConfig,
  saveConfig,
  usuario,
}: Props) {
  const { token } = theme.useToken();

  // Normalizo rol para evitar problemas de casing/espacios
  const role = (hdRole ?? "").toString().trim().toLowerCase();
  console.log("===================");
  console.log("usuario => ", usuario);
  console.log("===================");

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
          render: (fecha?: string | Date) => {
            if (!fecha) return "—";
            return (
              <Tooltip title={toISO(fecha)}>
                <div>
                  <span>{fmt(fecha)}</span>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {fromNow(fecha)}
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
          render: (record: HD_Ticket) => {
            const asignado = record.asignado_id === usuario?.id;
            return (
              <Space>
                {asignado ? (
                  <CheckCircleFilled
                    style={{ color: token.colorSuccess }}
                    aria-label="Asignado a mí"
                  />
                ) : (
                  <CloseCircleFilled
                    style={{ color: token.colorError }}
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

        // --- NUEVO GENERAL ---
        asignado_a: {
          title: "Asignado a",
          key: "asignado_a",
          render: (r: HD_Ticket) => {
            const full = `${r.asignado?.nombre ?? ""} ${
              r.asignado?.apellidos ?? ""
            }`.trim();
            return full || "—";
          },
        },

        // --- nivel_4 (campos de prueba existentes) ---
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

        // --- NUEVOS NIVEL_4 (auditoría SLA) ---
        l4_estado_sla: {
          title: "L4 • Estado SLA",
          key: "l4_estado_sla",
          render: (r: HD_Ticket) => SLA_ESTADO(r),
        },

        l4_resp_combo: {
          title: "L4 • Respuesta (vence/restante)",
          key: "l4_resp_combo",
          render: (r: HD_Ticket) => {
            const vence = r.slaTicket?.tiempo_estimado_respuesta;
            return (
              <div className="flex flex-col !items-start">
                <span>{fmt(vence)}</span>
                {SLA_TAG(vence)}
              </div>
            );
          },
        },

        l4_resp_termino: {
          title: "L4 • Hora fin respuesta",
          key: "l4_resp_termino",
          render: (r: HD_Ticket) => {
            const vence = r.slaTicket?.tiempo_estimado_respuesta;
            const left = secondsLeft(vence);
            return left != null && left <= 0 ? fmt(vence) : "—";
          },
        },

        l4_resol_combo: {
          title: "L4 • Resolución (vence/restante)",
          key: "l4_resol_combo",
          render: (r: HD_Ticket) => {
            const vence = r.slaTicket?.tiempo_estimado_resolucion;
            return (
              <div className="flex flex-col !items-start">
                <span>{fmt(vence)}</span>
                {SLA_TAG(vence)}
              </div>
            );
          },
        },

        asignado_el: {
          title: "Asignado el",
          key: "asignado_el",
          render: (r: HD_Ticket) =>
            r.asignadoAt ? (
              <Tooltip title={toISO(r.asignadoAt)}>
                <div>
                  <span>{fmt(r.asignadoAt)}</span>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {fromNow(r.asignadoAt)}
                  </Text>
                </div>
              </Tooltip>
            ) : (
              "—"
            ),
        },

        // --- nivel_5 (campos de prueba existentes) ---
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

          // render: (record: HD_Ticket) => {
          //   const estaAsignado = record.asignado_id === usuario?.id;
          //   return estaAsignado ? (
          //     <Link href={`/hd/bandeja/${record.id}`}>
          //       <Button
          //         type="link"
          //         icon={<EyeOutlined />}
          //         style={{ color: token.colorLink }}
          //       >
          //         Ver
          //       </Button>
          //     </Link>
          //   ) : (
          //     <Tooltip title="Solo el técnico asignado puede ver este ticket">
          //       <Button type="link" icon={<EyeOutlined />} disabled>
          //         Ver
          //       </Button>
          //     </Tooltip>
          //   );
          // },
        },
      }),
      [token, areaOptions, areaFilter, creadoFilter, prioridadFilter, usuario]
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
    area: "Área",
    // nuevo general
    asignado_a: "Asignado a",
    // L4 pruebas existentes
    col_l4: "L4 • Indicador",
    n4_sla_objetivo: "L4 • SLA objetivo",
    n4_observaciones: "L4 • Observaciones",
    // L4 nuevos
    l4_estado_sla: "L4 • Estado SLA",
    l4_resp_combo: "L4 • Respuesta (vence/restante)",
    l4_resp_termino: "L4 • Hora fin respuesta",
    l4_resol_combo: "L4 • Resolución (vence/restante)",
    asignado_el: "Asignado el",
    // L5 pruebas existentes
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
    "asignado_a",
  ];

  // ===================================================================================
  const l4Keys: ColumnKey[] = [
    "area",
    // pruebas L4 existentes
    "col_l4",
    "n4_sla_objetivo",
    "n4_observaciones",
    // nuevos L4
    "l4_estado_sla",
    "l4_resp_combo",
    "l4_resp_termino",
    "l4_resol_combo",
    "asignado_el",
  ];

  // ===================================================================================
  const l5Keys: ColumnKey[] = ["col_l5", "n5_impacto", "n5_costo_estimado"]; // sin cambios

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
    <div className="rounded-lg shadow p-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-3">
        <Text strong>Tickets • Asignados a mi área (grupo)</Text>
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
          Personaliza columnas para <b>Asignados a mi área</b>. Se guarda por
          usuario en el módulo HD.
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

          {["nivel_4", "nivel_5"].includes(role) && (
            <>
              <Title level={5} style={{ marginTop: 0 }}>
                nivel_4
              </Title>
              {renderCheckboxGrid(l4Keys)}

              <Divider style={{ margin: "12px 0" }} />
            </>
          )}

          {role === "nivel_5" && (
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
