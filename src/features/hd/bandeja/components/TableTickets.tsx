"use client";
import { HD_Ticket } from "@interfaces/hd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
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
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Core_Usuario } from "@/interfaces/core";

const { Text, Title } = Typography;

interface Props {
  usuario: Partial<Core_Usuario>;
  tickets: HD_Ticket[];
  loading: boolean;
  tabKey: "mis_tickets" | "grupo" | "finalizados" | string;
  hdRole?: "nivel_4" | "nivel_5" | string | null;
}

/** Util: diferencia legible */
const diffHuman = (start?: string | Date, end?: string | Date) => {
  if (!start || !end) return "—";
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return "—";
  const ms = e - s;
  const d = Math.floor(ms / (24 * 60 * 60 * 1000));
  const h = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m || parts.length === 0) parts.push(`${m}m`);
  return parts.join(" ");
};

/** Identificadores únicos de columnas */
type ColumnKey =
  // generales
  | "codigo"
  | "tipo"
  | "clasificacion"
  | "creado"
  | "prioridad"
  | "estado_asignado"
  | "asunto"
  | "asignado_a" // solo tab "grupo"
  | "tiempo_resolucion" // solo tab "finalizados"
  // L4/L5 y compartidas
  | "nivel_4_5" // visible si rol L4 o L5
  | "col_l4"
  | "n4_sla_objetivo"
  | "n4_observaciones"
  | "col_l5"
  | "n5_impacto"
  | "n5_costo_estimado"
  // acción
  | "acciones";

/** Columnas obligatorias */
const MANDATORY_COLUMNS: ColumnKey[] = ["acciones"];

/** Defaults por tab + rol */
const getDefaultKeys = (tabKey: string, role?: string | null): ColumnKey[] => {
  const base: ColumnKey[] = [
    "codigo",
    "tipo",
    "clasificacion",
    "creado",
    "prioridad",
    "estado_asignado",
    "asunto",
    "acciones",
  ];
  if (tabKey === "grupo")
    base.splice(base.indexOf("asunto") + 1, 0, "asignado_a");
  if (tabKey === "finalizados")
    base.splice(base.indexOf("asunto") + 1, 0, "tiempo_resolucion");

  const isL4 = role === "nivel_4";
  const isL5 = role === "nivel_5";
  if (isL4 || isL5) base.splice(base.indexOf("acciones"), 0, "nivel_4_5");
  if (isL4)
    base.splice(
      base.indexOf("acciones"),
      0,
      "col_l4",
      "n4_sla_objetivo",
      "n4_observaciones"
    );
  if (isL5)
    base.splice(
      base.indexOf("acciones"),
      0,
      "col_l5",
      "n5_impacto",
      "n5_costo_estimado"
    );

  MANDATORY_COLUMNS.forEach((k) => !base.includes(k) && base.push(k));
  return base;
};

const makeStorageKey = (tabKey: string, role?: string | null) =>
  `hd_columns_${tabKey}_${role || "none"}`;

export default function TableTickets({
  usuario,
  tickets,
  loading,
  tabKey,
  hdRole,
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

  /** Definir TODAS las columnas disponibles */
  const columnsByKey: Record<ColumnKey, ColumnsType<HD_Ticket>[number]> =
    useMemo(
      () => ({
        // generales
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
              <span>{`${record.titular?.nombre || ""} ${
                record.titular?.apellidos || ""
              }`}</span>
              <Tag color={record.titular?.rol_id === 3 ? "blue" : "green"}>
                {record.titular?.rol_id === 3 ? `Alumno` : `Administrativo`}
              </Tag>
            </div>
          ),
        },
        prioridad: {
          title: "Prioridad",
          dataIndex: ["prioridad", "nombre"],
          key: "prioridad",
          render: (prioridad: string) => {
            const color = prioridadColor[prioridad] ?? token.colorText;
            const bg = prioridadBg[prioridad] ?? token.colorFillTertiary;
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
        tiempo_resolucion: {
          title: "Tiempo de resolución",
          key: "tiempo_resolucion",
          render: (record: HD_Ticket) => {
            const inicio = record.createdAt;
            const fin = record.finalizadoAt ?? null;
            return <span>{fin ? diffHuman(inicio, fin) : "—"}</span>;
          },
        },

        // L4/L5 compartidas y específicas (campos de prueba)
        nivel_4_5: {
          title: "Nivel 4/5 • SLA",
          key: "sla",
          render: () => <Tag>SLA conjunto: 8h</Tag>,
        },
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

        // acción
        acciones: {
          title: "Acciones",
          key: "acciones",
          render: (record: HD_Ticket) => {
            const estaAsignado = record.asignado_id === usuario?.id;
            const puedeVer = tabKey !== "mis_tickets" ? true : estaAsignado;
            return puedeVer ? (
              <Link href={`/hd/bandeja/${record.id}`}>
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  style={{ color: token.colorLink }}
                >
                  Ver
                </Button>
              </Link>
            ) : (
              <Tooltip title="Solo el técnico asignado puede ver este ticket">
                <Button type="link" icon={<EyeOutlined />} disabled>
                  Ver
                </Button>
              </Tooltip>
            );
          },
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [usuario?.id, tabKey, token]
    );

  /** Etiquetas para el selector */
  const OPTION_LABELS: Record<ColumnKey, string> = {
    codigo: "Código",
    tipo: "Tipo",
    clasificacion: "Clasificación",
    creado: "Creado por",
    prioridad: "Prioridad",
    estado_asignado: "Estado / Asignado",
    asunto: "Asunto",
    asignado_a: "Asignado a (solo Grupo)",
    tiempo_resolucion: "Tiempo de resolución (solo Finalizados)",
    nivel_4_5: "Nivel 4/5 • SLA",
    col_l4: "L4 • Indicador",
    n4_sla_objetivo: "L4 • SLA objetivo",
    n4_observaciones: "L4 • Observaciones",
    col_l5: "L5 • Indicador",
    n5_impacto: "L5 • Impacto",
    n5_costo_estimado: "L5 • Costo estimado",
    acciones: "Acciones",
  };

  /** Estado y persistencia */
  const storageKey = useMemo(
    () => makeStorageKey(tabKey, hdRole),
    [tabKey, hdRole]
  );
  const [visibleKeys, setVisibleKeys] = useState<ColumnKey[]>(() =>
    getDefaultKeys(tabKey, hdRole)
  );
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ColumnKey[];
        const merged = Array.from(
          new Set([
            ...parsed,
            ...MANDATORY_COLUMNS,
            ...getDefaultKeys(tabKey, hdRole),
          ])
        );
        setVisibleKeys(merged);
        return;
      } catch {}
    }
    setVisibleKeys(getDefaultKeys(tabKey, hdRole));
  }, [storageKey, tabKey, hdRole]);

  const persist = (keys: ColumnKey[]) => {
    const finalKeys = Array.from(new Set([...keys, ...MANDATORY_COLUMNS]));
    localStorage.setItem(storageKey, JSON.stringify(finalKeys));
    setVisibleKeys(finalKeys);
  };

  /** Aplicabilidad por tab/rol */
  const keysThatApply = useMemo(() => {
    const keys = new Set(visibleKeys);

    // por tab
    if (tabKey !== "grupo") keys.delete("asignado_a");
    if (tabKey !== "finalizados") keys.delete("tiempo_resolucion");

    // por rol
    const isL4 = hdRole === "nivel_4";
    const isL5 = hdRole === "nivel_5";
    if (!isL4 && !isL5) {
      keys.delete("nivel_4_5");
      keys.delete("col_l4");
      keys.delete("n4_sla_objetivo");
      keys.delete("n4_observaciones");
      keys.delete("col_l5");
      keys.delete("n5_impacto");
      keys.delete("n5_costo_estimado");
    } else if (isL4) {
      keys.delete("col_l5");
      keys.delete("n5_impacto");
      keys.delete("n5_costo_estimado");
    } else if (isL5) {
      keys.delete("col_l4");
      keys.delete("n4_sla_objetivo");
      keys.delete("n4_observaciones");
    }

    MANDATORY_COLUMNS.forEach((k) => keys.add(k));
    return Array.from(keys);
  }, [visibleKeys, tabKey, hdRole]);

  /** Columnas finales (respeta el orden en visibleKeys) */
  const tableColumns: ColumnsType<HD_Ticket> = useMemo(
    () =>
      visibleKeys
        .filter((k) => keysThatApply.includes(k))
        .map((k) => columnsByKey[k])
        .filter(Boolean),
    [visibleKeys, keysThatApply, columnsByKey]
  );

  /** --- Orden dinámico (sin librerías) --- */
  // const dragIndex = useRef<number | null>(null);

  // const move = (list: ColumnKey[], from: number, to: number) => {
  //   if (to < 0 || to >= list.length) return list;
  //   const copy = list.slice();
  //   const [item] = copy.splice(from, 1);
  //   copy.splice(to, 0, item);
  //   return copy;
  // };

  // const moveUp = (key: ColumnKey) => {
  //   const idx = visibleKeys.indexOf(key);
  //   if (idx <= 0) return;
  //   persist(move(visibleKeys, idx, idx - 1));
  // };
  // const moveDown = (key: ColumnKey) => {
  //   const idx = visibleKeys.indexOf(key);
  //   if (idx < 0 || idx >= visibleKeys.length - 1) return;
  //   persist(move(visibleKeys, idx, idx + 1));
  // };

  // const onDragStart = (index: number) => (e: React.DragEvent) => {
  //   dragIndex.current = index;
  //   e.dataTransfer.effectAllowed = "move";
  // };
  // const onDragOver = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.dataTransfer.dropEffect = "move";
  // };
  // const onDrop = (index: number) => (e: React.DragEvent) => {
  //   e.preventDefault();
  //   const from = dragIndex.current;
  //   if (from == null || from === index) return;
  //   dragIndex.current = null;
  //   persist(move(visibleKeys, from, index));
  // };

  /** Modal: grupos */
  const baseKeys: ColumnKey[] = [
    "codigo",
    "tipo",
    "clasificacion",
    "creado",
    "prioridad",
    "estado_asignado",
    "asunto",
    "asignado_a",
    "tiempo_resolucion",
  ];
  const l4_5_shared: ColumnKey[] = ["nivel_4_5"];
  const l4Keys: ColumnKey[] = ["col_l4", "n4_sla_objetivo", "n4_observaciones"];
  const l5Keys: ColumnKey[] = ["col_l5", "n5_impacto", "n5_costo_estimado"];

  const renderCheckboxGrid = (
    keys: ColumnKey[],
    note?: (k: ColumnKey) => React.ReactNode
  ) => (
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
          {note?.(key)}
        </Checkbox>
      ))}
    </div>
  );

  /** Render */
  return (
    <div className="rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <Text strong>Tickets</Text>
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
              <Button onClick={() => persist(getDefaultKeys(tabKey, hdRole))}>
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
          Personaliza columnas para <b>{tabKey}</b>
          {hdRole ? ` • Rol: ${hdRole}` : ""}. Se guarda por tab y rol.
        </Text>

        <Divider style={{ margin: "12px 0" }} />

        {/* Campos generales */}
        <Title level={5} style={{ marginTop: 0 }}>
          Campos generales
        </Title>
        <Checkbox.Group
          style={{ width: "100%" }}
          value={visibleKeys}
          onChange={(v) => persist(v as ColumnKey[])}
        >
          {renderCheckboxGrid(baseKeys, (k) =>
            k === "asignado_a" && tabKey !== "grupo" ? (
              <Text type="secondary" style={{ marginLeft: 6 }}>
                • solo tab grupo
              </Text>
            ) : k === "tiempo_resolucion" && tabKey !== "finalizados" ? (
              <Text type="secondary" style={{ marginLeft: 6 }}>
                • solo tab finalizados
              </Text>
            ) : null
          )}

          <Divider style={{ margin: "12px 0" }} />

          {/* nivel_4_5 compartido */}
          <Title level={5} style={{ marginTop: 0 }}>
            nivel_4_5
          </Title>
          {renderCheckboxGrid(l4_5_shared)}

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

        <Divider />

        {/* Orden dinámico */}
        {/* <Title level={5} style={{ marginTop: 0 }}>
          Orden de columnas
        </Title>
        <Text type="secondary">
          Arrastra o usa ▲▼. (Solo afecta a las seleccionadas y aplicables en
          este contexto)
        </Text>

        <div className="mt-2 border rounded p-2 max-h-64 overflow-auto">
          {visibleKeys
            .filter((k) => keysThatApply.includes(k))
            .map((key, index) => (
              <div
                key={key}
                className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-50"
                draggable
                onDragStart={onDragStart(index)}
                onDragOver={onDragOver}
                onDrop={onDrop(index)}
                style={{ cursor: "move" }}
              >
                <Space>
                  <DragOutlined />
                  <span>{OPTION_LABELS[key]}</span>
                  {MANDATORY_COLUMNS.includes(key) && <Tag>obligatoria</Tag>}
                </Space>
                <Space>
                  <Button
                    size="small"
                    icon={<ArrowUpOutlined />}
                    onClick={() => moveUp(key)}
                    disabled={index === 0}
                  />
                  <Button
                    size="small"
                    icon={<ArrowDownOutlined />}
                    onClick={() => moveDown(key)}
                    disabled={
                      index ===
                      visibleKeys.filter((k) => keysThatApply.includes(k))
                        .length -
                        1
                    }
                  />
                </Space>
              </div>
            ))}
        </div> */}
      </Modal>
    </div>
  );
}
