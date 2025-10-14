"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Typography,
  Tag,
  Tooltip,
  Alert,
  Button,
  Input,
  Select,
  Table,
  message,
  Empty,
  Tabs,
  theme,
  Space,
  Rate,
  Grid,
  List,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  SafetyCertificateTwoTone,
  InfoCircleOutlined,
  FieldTimeOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { Breakpoint } from "antd/es/_util/responsiveObserver";
import { useRouter } from "next/navigation";
import dayjs from "@shared/date/dayjs";
import { HD_Ticket } from "@interfaces/hd";
import { getTicketsMe } from "@services/hd";

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const fmt = (iso: string) => dayjs(iso).format("DD/MM/YYYY HH:mm");

// IDs de estado
const ESTADO_ID = {
  ABIERTO: 1,
  ASIGNADO: 2,
  EN_PROCESO: 3,
  RESUELTO: 4,
  REABIERTO: 5,
  CANCELADO: 6,
  DERIVADO: 7,
} as const;

// Meta para tags
const ESTADO_META: Record<string, { label: string; color: string }> = {
  ABIERTO: { label: "Abierto", color: "blue" },
  ASIGNADO: { label: "Asignado", color: "purple" },
  EN_PROCESO: { label: "En proceso", color: "gold" },
  RESUELTO: { label: "Resuelto", color: "green" },
  REABIERTO: { label: "Reabierto", color: "orange" },
  CANCELADO: { label: "Cancelado", color: "red" },
  DERIVADO: { label: "Derivado", color: "geekblue" },
};

// NUEVO: listas de estados por pestaña
const ACTIVE_STATE_IDS = [
  String(ESTADO_ID.ABIERTO),
  String(ESTADO_ID.ASIGNADO),
  String(ESTADO_ID.EN_PROCESO),
];

const FINALIZED_STATE_IDS = [String(ESTADO_ID.RESUELTO)];

type RowUI = {
  id: number;
  codigo: string;
  area_nombre: string;
  descripcion: string;
  estadoCodigo: string;
  estadoNombre: string;
  creado_en: string;
  calificacion?: number | null;
};

// Helpers responsive tipados
const ALL_BP: Breakpoint[] = ["xs", "sm", "md", "lg", "xl"];
const DESK_BP: Breakpoint[] = ["sm", "md", "lg", "xl"];

/* Tag con ellipsis real (sin tooltip nativo que se “despegue”) */
function EllipsisTag({
  children,
  maxWidth,
}: {
  children: React.ReactNode;
  maxWidth?: number | string;
}) {
  return (
    <Tag
      className="m-0"
      style={{ maxWidth: maxWidth ?? "100%", display: "inline-block" }}
      title=""
    >
      <Typography.Text
        ellipsis={{ tooltip: false }}
        style={{ maxWidth: "100%", display: "inline-block" }}
      >
        {children}
      </Typography.Text>
    </Tag>
  );
}

export default function TicketListStudentView() {
  const router = useRouter();
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < md

  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState<string>("");
  const [estado, setEstado] = useState<string | undefined>(undefined);
  const [raw, setRaw] = useState<HD_Ticket[]>([]);

  const [activePage, setActivePage] = useState(1);
  const [finalPage, setFinalPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [tabKey, setTabKey] = useState<"activos" | "finalizados">("activos");

  // contador de resueltos sin calificación (para el tab)
  const [pendientesFinalizados, setPendientesFinalizados] = useState<number>(0);

  // Ajustes responsive de paginación
  useEffect(() => {
    setPageSize(isMobile ? 5 : 8);
  }, [isMobile]);

  const fetchTickets = async (estados_id: string[]) => {
    setLoading(true);
    try {
      const response = await getTicketsMe({ estados_id });
      setRaw(response as HD_Ticket[]);

      if (estados_id.includes(String(ESTADO_ID.RESUELTO))) {
        const count = (response as HD_Ticket[]).filter(
          (t) => !t?.calificacionTicket?.calificacion
        ).length;
        setPendientesFinalizados(count);
      }
    } catch (err) {
      console.log("err => ", err);
      message.error("No se pudieron obtener tus tickets.");
    } finally {
      setLoading(false);
    }
  };

  // Precarga: activos + conteo finalizados pendientes
  useEffect(() => {
    // Activos: ABIERTO, ASIGNADO, EN_PROCESO
    fetchTickets(ACTIVE_STATE_IDS);

    // Conteo de RESUELTO sin calificación
    (async () => {
      try {
        const resp = await getTicketsMe({ estados_id: FINALIZED_STATE_IDS });
        const count = (resp as HD_Ticket[]).filter(
          (t) => !t?.calificacionTicket?.calificacion
        ).length;
        setPendientesFinalizados(count);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cambiar dataset por tab
  useEffect(() => {
    if (tabKey === "activos") {
      setActivePage(1);
      fetchTickets(ACTIVE_STATE_IDS);
    } else {
      setFinalPage(1);
      fetchTickets(FINALIZED_STATE_IDS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey]);

  // Map a UI
  const rowsAll: RowUI[] = useMemo(() => {
    return (raw || []).map((t) => {
      const codigo = (t.estado?.codigo || "ABIERTO").toUpperCase();
      const area_nombre =
        (t.area?.nombre as string | undefined) ?? `Área #${t.area_id}`;
      const calif =
        t?.calificacionTicket?.calificacion != null
          ? Number(t.calificacionTicket.calificacion)
          : null;

      return {
        id: t.id,
        codigo: t.codigo,
        area_nombre,
        descripcion: t.descripcion ?? "",
        estadoCodigo: codigo,
        estadoNombre: t.estado?.nombre ?? ESTADO_META[codigo]?.label ?? codigo,
        creado_en: (t.createdAt as unknown as string) ?? "",
        calificacion: calif,
      };
    });
  }, [raw]);

  // Filtros locales
  const rowsFiltered = useMemo(() => {
    let data = rowsAll;
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      data = data.filter(
        (r) =>
          r.codigo.toLowerCase().includes(qq) ||
          r.descripcion.toLowerCase().includes(qq) ||
          r.area_nombre.toLowerCase().includes(qq)
      );
    }
    if (estado) {
      data = data.filter((r) => r.estadoCodigo === estado);
    }
    return data
      .slice()
      .sort(
        (a, b) => dayjs(b.creado_en).valueOf() - dayjs(a.creado_en).valueOf()
      );
  }, [rowsAll, q, estado]);

  // Paginación por tab
  const dataActivos = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return rowsFiltered.slice(start, start + pageSize);
  }, [rowsFiltered, activePage, pageSize]);

  const dataFinalizados = useMemo(() => {
    const start = (finalPage - 1) * pageSize;
    return rowsFiltered.slice(start, start + pageSize);
  }, [rowsFiltered, finalPage, pageSize]);

  const onBuscar = () => {
    setActivePage(1);
    setFinalPage(1);
  };

  const onVer = (row: RowUI) => {
    router.push(`/hd/est/${row.id}`);
  };

  // Columnas (desktop)
  const baseColumns: ColumnsType<RowUI> = [
    {
      title: <span className="whitespace-nowrap">Código</span>,
      dataIndex: "codigo",
      key: "codigo",
      width: 120,
      render: (v: string) => <Text strong>{v}</Text>,
      onCell: () => ({ className: "whitespace-nowrap" }),
      responsive: ALL_BP,
    },
    {
      title: <span className="whitespace-nowrap">Área</span>,
      dataIndex: "area_nombre",
      key: "area",
      width: 240,
      render: (v: string) => (
        <div style={{ maxWidth: 220 }}>
          <EllipsisTag maxWidth={220}>{v}</EllipsisTag>
        </div>
      ),
      responsive: DESK_BP, // oculto en xs en la tabla
    },
    {
      title: <span className="whitespace-nowrap">Estado</span>,
      key: "estado",
      width: 150,
      render: (_: unknown, row: RowUI) => {
        const meta = ESTADO_META[row.estadoCodigo] || {
          label: row.estadoCodigo,
          color: "default",
        };
        return (
          <Tooltip title={row.estadoNombre}>
            <Tag color={meta.color}>{meta.label}</Tag>
          </Tooltip>
        );
      },
      responsive: ALL_BP,
    },
    {
      title: <span className="whitespace-nowrap">Creado</span>,
      dataIndex: "creado_en",
      key: "creado_en",
      width: 180,
      render: (iso: string) => (
        <span style={{ color: token.colorTextSecondary }}>
          <FieldTimeOutlined className="mr-1" />
          {fmt(iso)}
        </span>
      ),
      sorter: (a, b) =>
        dayjs(a.creado_en).valueOf() - dayjs(b.creado_en).valueOf(),
      defaultSortOrder: "descend",
      responsive: DESK_BP, // oculto en xs
    },
  ];

  const calificacionCol: ColumnType<RowUI> = {
    title: <span className="whitespace-nowrap">Calificación</span>,
    key: "calificacion",
    width: 180,
    render: (row: RowUI) =>
      row.calificacion != null ? (
        <Rate allowHalf disabled value={Number(row.calificacion)} />
      ) : (
        <Tag icon={<ExclamationCircleOutlined />} color="gold">
          Pendiente
        </Tag>
      ),
    responsive: DESK_BP,
  };

  const accionesCol: ColumnType<RowUI> = {
    title: <span className="whitespace-nowrap">Acciones</span>,
    key: "acciones",
    width: 110,
    render: (_: unknown, row: RowUI) => (
      <Button icon={<EyeOutlined />} onClick={() => onVer(row)}>
        Ver
      </Button>
    ),
    responsive: ALL_BP,
  };

  const columnsActivos: ColumnsType<RowUI> = [...baseColumns, accionesCol];
  const columnsFinalizados: ColumnsType<RowUI> = [
    ...baseColumns,
    calificacionCol,
    accionesCol,
  ];

  const FinalizadosLabel = () => (
    <span className="inline-flex items-center gap-2">
      Finalizados
      <Tag color={pendientesFinalizados > 0 ? "gold" : "default"}>
        Pendientes: {pendientesFinalizados}
      </Tag>
    </span>
  );

  // ---- Render responsive: Tabla en desktop / Lista en móvil ----
  const renderTablaActivos = (
    <Table<RowUI>
      rowKey="id"
      columns={columnsActivos}
      dataSource={dataActivos}
      loading={loading}
      size={isMobile ? "small" : "middle"}
      scroll={isMobile ? { x: 560 } : undefined}
      pagination={{
        current: activePage,
        pageSize,
        total: rowsFiltered.length,
        showSizeChanger: !isMobile,
        onChange: (p, ps) => {
          setActivePage(p);
          setPageSize(ps);
        },
        showTotal: (t) => `${t} ticket(s) activos`,
        size: isMobile ? "small" : "default",
      }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No hay tickets activos"
          />
        ),
      }}
      tableLayout="fixed"
      className="tabla-activos"
    />
  );

  const renderTablaFinalizados = (
    <Table<RowUI>
      rowKey="id"
      columns={columnsFinalizados}
      dataSource={dataFinalizados}
      loading={loading}
      size={isMobile ? "small" : "middle"}
      scroll={isMobile ? { x: 680 } : undefined}
      pagination={{
        current: finalPage,
        pageSize,
        total: rowsFiltered.length,
        showSizeChanger: !isMobile,
        onChange: (p, ps) => {
          setFinalPage(p);
          setPageSize(ps);
        },
        showTotal: (t) => `${t} ticket(s) finalizados`,
        size: isMobile ? "small" : "default",
      }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No hay tickets finalizados"
          />
        ),
      }}
      tableLayout="fixed"
      className="tabla-finalizados"
      rowClassName={(row) => (row.calificacion == null ? "row-pendiente" : "")}
    />
  );

  // Vista móvil como tarjetas
  const renderList = (data: RowUI[], showRating?: boolean) => (
    <List
      dataSource={data}
      loading={loading}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              showRating
                ? "No hay tickets finalizados"
                : "No hay tickets activos"
            }
          />
        ),
      }}
      renderItem={(row) => {
        const meta = ESTADO_META[row.estadoCodigo] || {
          label: row.estadoCodigo,
          color: "default",
        };
        return (
          <List.Item className="p-0">
            <Card
              size="small"
              className="w-full"
              bordered
              style={{ borderColor: token.colorBorderSecondary }}
              bodyStyle={{ padding: 12 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Text strong className="truncate">
                      #{row.codigo}
                    </Text>
                    <Tag color={meta.color} className="m-0">
                      {meta.label}
                    </Tag>
                  </div>

                  <div
                    className="mt-1 text-xs"
                    style={{ color: token.colorTextSecondary }}
                  >
                    <FieldTimeOutlined className="mr-1" />
                    {fmt(row.creado_en)}
                  </div>

                  <div className="mt-2 max-w-[78vw]">
                    <EllipsisTag>{row.area_nombre}</EllipsisTag>
                  </div>

                  {showRating && (
                    <div className="mt-2">
                      {row.calificacion != null ? (
                        <Rate
                          allowHalf
                          disabled
                          value={Number(row.calificacion)}
                        />
                      ) : (
                        <Tag icon={<ExclamationCircleOutlined />} color="gold">
                          Pendiente
                        </Tag>
                      )}
                    </div>
                  )}
                </div>

                <Button icon={<EyeOutlined />} onClick={() => onVer(row)}>
                  Ver
                </Button>
              </div>
            </Card>
          </List.Item>
        );
      }}
      pagination={{
        current: tabKey === "activos" ? activePage : finalPage,
        pageSize,
        total: rowsFiltered.length,
        onChange: (p) =>
          tabKey === "activos" ? setActivePage(p) : setFinalPage(p),
        size: "small",
      }}
    />
  );

  return (
    <div
      className="min-h-[100dvh]"
      style={{
        background: `linear-gradient(to bottom, ${token.colorFillTertiary}, ${token.colorBgLayout})`,
      }}
    >
      {/* HERO */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="rounded-2xl p-[1px] shadow-lg">
          <div
            className="rounded-2xl backdrop-blur-md px-6 py-6 md:px-10"
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Title
                  level={3}
                  className="m-0"
                  style={{ color: token.colorText }}
                >
                  📁 Mis Tickets
                </Title>
                <Text style={{ color: token.colorTextSecondary }}>
                  Consulta el estado y el historial de tus tickets registrados.
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip title="Tus datos están protegidos">
                  <SafetyCertificateTwoTone twoToneColor={token.colorSuccess} />
                </Tooltip>
                <Tag color="blue" className="text-sm">
                  Mesa de Ayuda
                </Tag>
              </div>
            </div>
            <Alert
              className="mt-4"
              type="info"
              showIcon
              message={
                <span className="text-[13px]">
                  <InfoCircleOutlined /> Recibirás avisos en tu correo
                  institucional UMA cuando tu ticket cambie de estado.
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Card
          className="rounded-2xl shadow-sm"
          style={{ background: token.colorBgContainer }}
        >
          {/* Filtros */}
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Space.Compact className="w-full md:max-w-[520px]">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por código, área o descripción"
                allowClear
                prefix={<SearchOutlined />}
                onPressEnter={onBuscar}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={onBuscar}
                loading={loading}
              >
                Buscar
              </Button>
            </Space.Compact>

            <div className="flex gap-2 w-full md:w-auto">
              <Select
                placeholder="Estado (opcional)"
                allowClear
                value={estado}
                onChange={(v) => {
                  setEstado(v as string | undefined);
                  setActivePage(1);
                  setFinalPage(1);
                }}
                className="w-full md:w-64"
                suffixIcon={<FilterOutlined />}
              >
                {Object.keys(ESTADO_ID).map((code) => (
                  <Option key={code} value={code}>
                    {ESTADO_META[code]?.label ?? code}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Tabs: Activos / Finalizados */}
          <Tabs
            activeKey={tabKey}
            onChange={(k) => setTabKey(k as typeof tabKey)}
            items={[
              {
                key: "activos",
                label: "Activos",
                children: isMobile
                  ? renderList(dataActivos, false)
                  : renderTablaActivos,
              },
              {
                key: "finalizados",
                label: <FinalizadosLabel />,
                children: isMobile
                  ? renderList(dataFinalizados, true)
                  : renderTablaFinalizados,
              },
            ]}
            tabBarGutter={10}
            className="mb-1"
          />
        </Card>
      </div>

      {/* Estilos con tokens: headers, zebra y fila pendiente */}
      <style jsx global>{`
        .tabla-activos .ant-table-thead > tr > th,
        .tabla-finalizados .ant-table-thead > tr > th {
          background: ${token.colorFillSecondary};
          white-space: nowrap;
        }
        .tabla-activos .ant-table-tbody > tr:nth-child(odd) > td,
        .tabla-finalizados .ant-table-tbody > tr:nth-child(odd) > td {
          background: ${token.colorFillQuaternary};
        }
        .tabla-activos .ant-table-tbody > tr:hover > td,
        .tabla-finalizados .ant-table-tbody > tr:hover > td {
          background: ${token.controlItemBgHover} !important;
        }
        .tabla-finalizados .row-pendiente > td {
          background: ${token.colorWarningBg} !important;
        }
      `}</style>
    </div>
  );
}
