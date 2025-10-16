"use client";
import { HD_Ticket } from "@interfaces/hd";
import { EyeOutlined, SettingOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Modal,
  Rate,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Checkbox,
  theme,
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Core_Usuario } from "@/interfaces/core";
import dayjs from "@shared/date/dayjs";

// ===================================================================================
// Tipos auxiliares fuertes (sin any)
type DateLike = string | Date | number | null | undefined;

type AreaLike =
  | { id: number; nombre: string; abreviado?: string }
  | null
  | undefined;
type UsuarioLike = { nombre?: string; apellidos?: string } | null | undefined;

type SLALike =
  | { tiempo_respuesta: number; tiempo_resolucion: number }
  | null
  | undefined;

type SLATicketLike =
  | {
      tiempo_estimado_respuesta?: DateLike;
      tiempo_estimado_resolucion?: DateLike;
      cumplido?: boolean;
      sla?: SLALike;
    }
  | null
  | undefined;

type CalificacionLike =
  | { calificacion: number; comentario?: string }
  | null
  | undefined;

// ===================================================================================
// Helpers de fecha / formato (tipados)
const toDayjs = (v: DateLike) => (v != null ? dayjs(v) : null);

const fmt = (v: DateLike): string => {
  const d = toDayjs(v);
  return d ? d.format("DD/MM/YYYY HH:mm") : "—";
};

const fromNow = (v: DateLike): string => {
  const d = toDayjs(v);
  return d ? d.fromNow() : "—";
};

const toISO = (v: DateLike): string | undefined => {
  const d = toDayjs(v);
  return d ? d.toISOString() : undefined;
};

const diffMinutes = (a: DateLike, b: DateLike): number | null => {
  const da = toDayjs(a);
  const db = toDayjs(b);
  if (!da || !db) return null;
  return da.diff(db, "minute");
};

const humanDuration = (minutes: number | null): string => {
  if (minutes == null) return "—";
  const sign = minutes < 0 ? "-" : "";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return h === 0 ? `${sign}${m}m` : `${sign}${h}h ${m}m`;
};

// Deriva SLA objetivo (min) priorizando sla dentro de slaTicket
const slaObjetivoRespuestaMin = (r: HD_Ticket): number | null => {
  const s = (r.slaTicket as SLATicketLike)?.sla;
  if (s && typeof s.tiempo_respuesta === "number") return s.tiempo_respuesta;
  const estimado = (r.slaTicket as SLATicketLike)?.tiempo_estimado_respuesta;
  return diffMinutes(estimado ?? null, r.createdAt);
};

const slaObjetivoResolucionMin = (r: HD_Ticket): number | null => {
  const s = (r.slaTicket as SLATicketLike)?.sla;
  if (s && typeof s.tiempo_resolucion === "number") return s.tiempo_resolucion;
  const estimado = (r.slaTicket as SLATicketLike)?.tiempo_estimado_resolucion;
  return diffMinutes(estimado ?? null, r.createdAt);
};

// Estado SLA final (Cumplido / Incumplido) al cierre
const estadoSlaFinalTag = (r: HD_Ticket) => {
  const st = r.slaTicket as SLATicketLike;
  const banderaCumplido = st?.cumplido === true;

  const respReal = diffMinutes(r.respondidoAt ?? null, r.createdAt);
  const respObj = slaObjetivoRespuestaMin(r);
  const resolReal = diffMinutes(r.finalizadoAt ?? null, r.createdAt);
  const resolObj = slaObjetivoResolucionMin(r);

  const respCumple =
    respReal != null && respObj != null ? respReal <= respObj : true;
  const resolCumple =
    resolReal != null && resolObj != null ? resolReal <= resolObj : true;

  const ok = (respCumple && resolCumple) || banderaCumplido;
  return ok ? (
    <Tag color="green">Cumplido</Tag>
  ) : (
    <Tag color="red">Incumplido</Tag>
  );
};

// Atención en horario hábil (por defecto L–V 08:00–18:00, sin props extra)
// día ISO sin plugin: 1=Lunes ... 7=Domingo
const isoDay = (d: dayjs.Dayjs) => ((d.day() + 6) % 7) + 1;

const inWindow = (d: dayjs.Dayjs, start: string, end: string): boolean => {
  const [sh, sm] = start.split(":").map((x) => Number(x) || 0);
  const [eh, em] = end.split(":").map((x) => Number(x) || 0);
  const m = d.hour() * 60 + d.minute();
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  return m >= s && m <= e;
};

const atencionEnHorarioHabil = (r: HD_Ticket) => {
  const dentroHorario = (fecha: DateLike) => {
    const d = toDayjs(fecha);
    if (!d) return true;
    const dow = isoDay(d);
    if (dow >= 6) return false;
    return inWindow(d, "08:00:00", "18:00:00");
  };

  const okCre = dentroHorario(r.createdAt);
  const okAsig = dentroHorario(r.asignadoAt ?? null);
  const okResp = dentroHorario(r.respondidoAt ?? null);
  const okFin = dentroHorario(r.finalizadoAt ?? null);

  const okAll = okCre && okAsig && okResp && okFin;
  return okAll ? <Tag>Sí</Tag> : <Tag color="gold">Parcial</Tag>;
};

// ===================================================================================
const { Text, Title } = Typography;
const TABKEY = "bandeja.table.finalizados";

// ===================================================================================
// Column keys
type ColumnKey =
  // Generales
  | "codigo"
  | "area"
  | "tipo"
  | "clasificacion"
  | "asunto"
  | "creado"
  | "fecha_creacion"
  | "asignado_a"
  | "asignado_el"
  | "respondido_el"
  | "finalizado_el"
  | "valoracion"
  | "comentario_valoracion"
  | "adjuntos"
  | "mensajes"
  | "derivaciones"
  // Nivel 4
  | "sla_obj_respuesta"
  | "horario_habil"
  | "sla_obj_resolucion"
  | "sla_estado_final"
  | "resp_real"
  | "resol_real"
  // Acción
  | "acciones";

const MANDATORY_COLUMNS: ColumnKey[] = ["acciones"];

// Default visibles
const getDefaultKeys = (): ColumnKey[] => [
  // generales
  "codigo",
  "area",
  "tipo",
  "clasificacion",
  "asunto",
  "creado",
  "fecha_creacion",
  "asignado_a",
  "finalizado_el",
  "valoracion",
  // nivel 4 esenciales
  "sla_estado_final",
  "resp_real",
  "resol_real",
  // acción
  "acciones",
];

// Orden de despliegue
const DISPLAY_ORDER: ColumnKey[] = [
  "codigo",
  "area",
  "tipo",
  "clasificacion",
  "asunto",
  "creado",
  "fecha_creacion",
  "asignado_a",
  "asignado_el",
  "respondido_el",
  "finalizado_el",
  "valoracion",
  "comentario_valoracion",
  "adjuntos",
  "mensajes",
  "derivaciones",
  // L4
  "sla_obj_respuesta",
  "horario_habil",
  "sla_obj_resolucion",
  "sla_estado_final",
  "resp_real",
  "resol_real",
  // acción
  "acciones",
];

// ===================================================================================
// Props — iguales a TableGrupo
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
export default function TablaFinalizados({
  tickets,
  loading,
  hdRole,
  hdConfig,
  saveConfig,
}: Props) {
  const { token } = theme.useToken();

  // Normaliza rol (como en TableGrupo)
  const role = (hdRole ?? "").toString().trim().toLowerCase();

  // Solo finalizados por seguridad
  const data = useMemo(
    () => (tickets ?? []).filter((t) => Boolean(t.finalizadoAt)),
    [tickets]
  );

  const cfg = (hdConfig?.[TABKEY] ?? {}) as {
    visibleKeys?: ColumnKey[];
  };

  const [visibleKeys, setVisibleKeys] = useState<ColumnKey[]>(
    cfg.visibleKeys?.length
      ? (cfg.visibleKeys as ColumnKey[])
      : getDefaultKeys()
  );
  const [modalOpen, setModalOpen] = useState(false);

  const persistVisible = (keys: ColumnKey[]) => {
    const finalKeys = Array.from(
      new Set<ColumnKey>([...keys, ...MANDATORY_COLUMNS])
    );
    setVisibleKeys(finalKeys);
    saveConfig({
      tabKey: TABKEY,
      config: { visibleKeys: finalKeys },
    });
  };

  // ===================================================================================
  // Columnas
  const columnsByKey: Record<ColumnKey, ColumnsType<HD_Ticket>[number]> =
    useMemo(
      () => ({
        // Generales
        codigo: { title: "Código", dataIndex: "codigo", key: "codigo" },

        area: {
          title: "Área",
          key: "area",
          render: (r: HD_Ticket) => (r.area as AreaLike)?.nombre ?? "—",
        },

        tipo: {
          title: "Tipo",
          key: "tipo",
          render: (r: HD_Ticket) => r.categoria?.incidencia?.tipo ?? "—",
        },

        clasificacion: {
          title: "Clasificación",
          key: "clasificacion",
          render: (r: HD_Ticket) => (
            <span style={{ color: token.colorTextSecondary }}>
              {r.categoria?.incidencia?.nombre ?? "—"} /{" "}
              <b style={{ color: token.colorText }}>
                {r.categoria?.nombre ?? "—"}
              </b>
            </span>
          ),
        },

        asunto: {
          title: "Asunto",
          key: "asunto",
          render: (r: HD_Ticket) => (
            <Tooltip title={r.descripcion}>
              <span
                style={{
                  maxWidth: 260,
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: token.colorText,
                }}
              >
                {r.descripcion}
              </span>
            </Tooltip>
          ),
        },

        creado: {
          title: "Creado por",
          key: "creado",
          render: (r: HD_Ticket) => {
            const u = r.creado as UsuarioLike;
            const full = `${u?.nombre ?? ""} ${u?.apellidos ?? ""}`.trim();
            return full || "—";
          },
        },

        fecha_creacion: {
          title: "Fecha de creación",
          key: "fecha_creacion",
          dataIndex: "createdAt",
          sorter: (a: HD_Ticket, b: HD_Ticket) => {
            const da = a.createdAt ? dayjs(a.createdAt).valueOf() : 0;
            const db = b.createdAt ? dayjs(b.createdAt).valueOf() : 0;
            return da - db;
          },
          defaultSortOrder: "descend",
          render: (fecha?: string | Date) =>
            fecha ? (
              <Tooltip title={toISO(fecha)}>
                <div>
                  <span>{fmt(fecha)}</span>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {fromNow(fecha)}
                  </Text>
                </div>
              </Tooltip>
            ) : (
              "—"
            ),
        },

        asignado_a: {
          title: "Asignado a",
          key: "asignado_a",
          render: (r: HD_Ticket) => {
            const u = r.asignado as UsuarioLike;
            const full = `${u?.nombre ?? ""} ${u?.apellidos ?? ""}`.trim();
            return full || "—";
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

        respondido_el: {
          title: "Respondido el",
          key: "respondido_el",
          render: (r: HD_Ticket) =>
            r.respondidoAt ? (
              <Tooltip title={toISO(r.respondidoAt)}>
                <div>
                  <span>{fmt(r.respondidoAt)}</span>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {fromNow(r.respondidoAt)}
                  </Text>
                </div>
              </Tooltip>
            ) : (
              "—"
            ),
        },

        finalizado_el: {
          title: "Finalizado el",
          key: "finalizado_el",
          render: (r: HD_Ticket) =>
            r.finalizadoAt ? (
              <Tooltip title={toISO(r.finalizadoAt)}>
                <div>
                  <span>{fmt(r.finalizadoAt)}</span>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {fromNow(r.finalizadoAt)}
                  </Text>
                </div>
              </Tooltip>
            ) : (
              "—"
            ),
        },

        valoracion: {
          title: "Valoración",
          key: "valoracion",
          render: (r: HD_Ticket) => {
            const cal =
              (r.calificacionTicket as CalificacionLike)?.calificacion ?? 0;
            return (
              <div className="flex items-center gap-2">
                <Rate disabled allowHalf value={cal} />
                <Text type="secondary">{cal ? cal.toFixed(1) : "—"}</Text>
              </div>
            );
          },
        },

        comentario_valoracion: {
          title: "Comentario de valoración",
          key: "comentario_valoracion",
          render: (r: HD_Ticket) => {
            const c =
              (r.calificacionTicket as CalificacionLike)?.comentario ?? "";
            return c ? (
              <Tooltip title={c}>
                <span
                  style={{
                    maxWidth: 260,
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c}
                </span>
              </Tooltip>
            ) : (
              "—"
            );
          },
        },

        adjuntos: {
          title: "# Adjuntos",
          key: "adjuntos",
          render: (r: HD_Ticket) => r.documentos?.length ?? 0,
        },

        mensajes: {
          title: "# Mensajes",
          key: "mensajes",
          render: (r: HD_Ticket) => r.mensajes?.length ?? 0,
        },

        derivaciones: {
          title: "# Derivaciones",
          key: "derivaciones",
          render: (r: HD_Ticket) =>
            (r.derivacionesComoOrigen?.length ?? 0) +
            (r.derivacionesComoDestino?.length ?? 0),
        },

        // Nivel 4
        sla_obj_respuesta: {
          title: "SLA objetivo • Respuesta",
          key: "sla_obj_respuesta",
          render: (r: HD_Ticket) => {
            const mins = slaObjetivoRespuestaMin(r);
            return mins != null ? `${mins} min` : "—";
          },
        },

        horario_habil: {
          title: "Atención en horario hábil",
          key: "horario_habil",
          render: (r: HD_Ticket) => atencionEnHorarioHabil(r),
        },

        sla_obj_resolucion: {
          title: "SLA objetivo • Resolución",
          key: "sla_obj_resolucion",
          render: (r: HD_Ticket) => {
            const mins = slaObjetivoResolucionMin(r);
            return mins != null ? `${mins} min` : "—";
          },
        },

        sla_estado_final: {
          title: "Estado SLA final",
          key: "sla_estado_final",
          render: (r: HD_Ticket) => estadoSlaFinalTag(r),
        },

        resp_real: {
          title: "1.ª respuesta (real)",
          key: "resp_real",
          render: (r: HD_Ticket) =>
            humanDuration(diffMinutes(r.respondidoAt ?? null, r.createdAt)),
        },

        resol_real: {
          title: "Resolución (real)",
          key: "resol_real",
          render: (r: HD_Ticket) =>
            humanDuration(diffMinutes(r.finalizadoAt ?? null, r.createdAt)),
        },

        // Acción
        acciones: {
          title: "Acciones",
          key: "acciones",
          render: (r: HD_Ticket) => (
            <Link href={`/hd/bandeja/${r.id}`}>
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
      [token]
    );

  // ===================================================================================
  // Filtros de la tabla (por si luego quieres agregar filtros/orden, dejamos el handler)
  const onTableChange: TableProps<HD_Ticket>["onChange"] = () => {
    // reservado
  };

  const OPTION_LABELS: Record<ColumnKey, string> = {
    // Generales
    codigo: "Código",
    area: "Área",
    tipo: "Tipo",
    clasificacion: "Clasificación",
    asunto: "Asunto",
    creado: "Creado por",
    fecha_creacion: "Fecha de creación",
    asignado_a: "Asignado a",
    asignado_el: "Asignado el",
    respondido_el: "Respondido el",
    finalizado_el: "Finalizado el",
    valoracion: "Valoración",
    comentario_valoracion: "Comentario de valoración",
    adjuntos: "# Adjuntos",
    mensajes: "# Mensajes",
    derivaciones: "# Derivaciones",
    // Nivel 4
    sla_obj_respuesta: "SLA objetivo • Respuesta",
    horario_habil: "Atención en horario hábil",
    sla_obj_resolucion: "SLA objetivo • Resolución",
    sla_estado_final: "Estado SLA final",
    resp_real: "1.ª respuesta (real)",
    resol_real: "Resolución (real)",
    // Acción
    acciones: "Acciones",
  };

  // ===================================================================================
  // Columnas finales (orden + visibles)
  const tableColumns: ColumnsType<HD_Ticket> = useMemo(() => {
    const orderIndex = (k: ColumnKey) => {
      const i = DISPLAY_ORDER.indexOf(k);
      return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };
    return visibleKeys
      .slice()
      .sort((a, b) => orderIndex(a) - orderIndex(b))
      .map((k) => columnsByKey[k])
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [visibleKeys, columnsByKey]);

  // Para el modal de configuración
  const baseKeys: ColumnKey[] = [
    "codigo",
    "area",
    "tipo",
    "clasificacion",
    "asunto",
    "creado",
    "fecha_creacion",
    "asignado_a",
    "asignado_el",
    "respondido_el",
    "finalizado_el",
    "valoracion",
    "comentario_valoracion",
    "adjuntos",
    "mensajes",
    "derivaciones",
  ];

  const l4Keys: ColumnKey[] = [
    "sla_obj_respuesta",
    "horario_habil",
    "sla_obj_resolucion",
    "sla_estado_final",
    "resp_real",
    "resol_real",
  ];

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
        <Text strong>Tickets • Finalizados</Text>
        <Space>
          <Button icon={<SettingOutlined />} onClick={() => setModalOpen(true)}>
            Columnas
          </Button>
        </Space>
      </div>

      <Table
        columns={tableColumns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, responsive: true }}
        scroll={{ x: "max-content" }} // solo horizontal
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
          Personaliza columnas para <b>Finalizados</b>. Se guarda por usuario en
          el módulo HD.
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
            </>
          )}
        </Checkbox.Group>
      </Modal>
    </div>
  );
}
