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
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { getTicketsMe } from "@/features/hd/service/ticket_ti";
import { HD_Ticket } from "@/interface/hd/hd_ticket";

const { Title, Text } = Typography;
const { Option } = Select;

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

export default function TicketListStudentView() {
  const router = useRouter();
  const { token } = theme.useToken();

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

  // Precarga: activos (1) + conteo de resueltos (4)
  useEffect(() => {
    fetchTickets([String(ESTADO_ID.ABIERTO)]);
    (async () => {
      try {
        const resp = await getTicketsMe({
          estados_id: [String(ESTADO_ID.RESUELTO)],
        });
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
      fetchTickets([String(ESTADO_ID.ABIERTO)]);
    } else {
      setFinalPage(1);
      fetchTickets([String(ESTADO_ID.RESUELTO)]);
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
        creado_en: t.createdAt as unknown as string,
        calificacion: calif,
      };
    });
  }, [raw]);

  // Filtros locales (texto + estado)
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

  // Columnas
  const baseColumns: ColumnsType<RowUI> = [
    {
      title: <span className="whitespace-nowrap">Código</span>,
      dataIndex: "codigo",
      key: "codigo",
      width: 120,
      render: (v) => <Text strong>{v}</Text>,
      onCell: () => ({ className: "whitespace-nowrap" }),
    },
    {
      title: <span className="whitespace-nowrap">Área</span>,
      dataIndex: "area_nombre",
      key: "area",
      width: 220,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <Tag
            style={{
              background: token.colorFillQuaternary,
              borderColor: token.colorBorderSecondary,
              color: token.colorText,
              maxWidth: 200,
              display: "inline-block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              verticalAlign: "middle",
            }}
          >
            {v}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: <span className="whitespace-nowrap">Estado</span>,
      key: "estado",
      width: 150,
      render: (_, row) => {
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
    },
  ];

  const calificacionCol = {
    title: <span className="whitespace-nowrap">Calificación</span>,
    key: "calificacion",
    width: 180,
    render: (row: RowUI) => {
      const calif = row.calificacion;
      return calif != null ? (
        <Rate allowHalf disabled value={Number(calif)} />
      ) : (
        <Tag icon={<ExclamationCircleOutlined />} color="gold">
          Pendiente
        </Tag>
      );
    },
  };

  const accionesCol = {
    title: <span className="whitespace-nowrap">Acciones</span>,
    key: "acciones",
    width: 110,
    render: (_: unknown, row: RowUI) => (
      <Button icon={<EyeOutlined />} onClick={() => onVer(row)}>
        Ver
      </Button>
    ),
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

  return (
    <div
      className="min-h-[100dvh]"
      style={{
        background: `linear-gradient(to bottom, ${token.colorFillTertiary}, ${token.colorBgLayout})`,
      }}
    >
      {/* HERO */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div
          className="rounded-2xl p-[1px] shadow-lg"
          style={
            {
              // background: `linear-gradient(135deg, ${token.colorPrimary}CC, ${token.colorPrimaryHover}CC 60%, ${token.colorPrimaryActive}CC)`,
            }
          }
        >
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
          style={{
            background: token.colorBgContainer,
            // border: `1px solid ${token.colorBorderSecondary}`,
          }}
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
                children: (
                  <Table<RowUI>
                    rowKey="id"
                    columns={columnsActivos}
                    dataSource={dataActivos}
                    loading={loading}
                    pagination={{
                      current: activePage,
                      pageSize,
                      total: rowsFiltered.length,
                      showSizeChanger: true,
                      onChange: (p, ps) => {
                        setActivePage(p);
                        setPageSize(ps);
                      },
                      showTotal: (t) => `${t} ticket(s) activos`,
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
                ),
              },
              {
                key: "finalizados",
                label: <FinalizadosLabel />,
                children: (
                  <Table<RowUI>
                    rowKey="id"
                    columns={columnsFinalizados}
                    dataSource={dataFinalizados}
                    loading={loading}
                    pagination={{
                      current: finalPage,
                      pageSize,
                      total: rowsFiltered.length,
                      showSizeChanger: true,
                      onChange: (p, ps) => {
                        setFinalPage(p);
                        setPageSize(ps);
                      },
                      showTotal: (t) => `${t} ticket(s) finalizados`,
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
                    rowClassName={(row) =>
                      row.calificacion == null ? "row-pendiente" : ""
                    }
                  />
                ),
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
