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
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  SafetyCertificateTwoTone,
  InfoCircleOutlined,
  FieldTimeOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { getTicketsMe } from "@/features/hd/service/ticket_ti";
import { HD_Ticket } from "@/interface/hd/hd_ticket";

// ⬇️ USA TU INTERFAZ real (ajusta la ruta si es distinta)

const { Title, Text, Paragraph } = Typography;

/** ===== Estados según tu seed ===== */
type TicketEstado =
  | "ABIERTO"
  | "ASIGNADO"
  | "EN_PROCESO"
  | "RESUELTO"
  | "REABIERTO"
  | "CANCELADO"
  | "DERIVADO";

const ESTADO_META: Record<TicketEstado, { label: string; color: string }> = {
  ABIERTO: { label: "Abierto", color: "blue" },
  ASIGNADO: { label: "Asignado", color: "purple" },
  EN_PROCESO: { label: "En proceso", color: "gold" },
  RESUELTO: { label: "Resuelto", color: "green" },
  REABIERTO: { label: "Reabierto", color: "orange" },
  CANCELADO: { label: "Cancelado", color: "red" },
  DERIVADO: { label: "Derivado", color: "geekblue" },
};

const estadosOptions = [
  { label: "Abierto", value: "ABIERTO" },
  { label: "Asignado", value: "ASIGNADO" },
  { label: "En proceso", value: "EN_PROCESO" },
  { label: "Resuelto", value: "RESUELTO" },
  { label: "Reabierto", value: "REABIERTO" },
  { label: "Cancelado", value: "CANCELADO" },
  { label: "Derivado", value: "DERIVADO" },
];

const fmt = (iso: string) => dayjs(iso).format("DD/MM/YYYY HH:mm");

/** Filas UI (no cambiamos tu modelo, solo proyectamos lo necesario para la tabla) */
type RowUI = {
  id: number;
  codigo: string;
  area_nombre: string;
  descripcion: string;
  estadoCodigo: TicketEstado;
  estadoNombre: string;
  creado_en: string;
};

export default function TicketListStudentView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // filtros minimal
  const [q, setQ] = useState<string>("");
  const [estado, setEstado] = useState<TicketEstado | undefined>(undefined);

  // datos crudos desde API (usando tu interfaz)
  const [raw, setRaw] = useState<HD_Ticket[]>([]);

  // paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await getTicketsMe(); // <- devuelve core_Ticket[]
      setRaw(response as HD_Ticket[]);
    } catch {
      message.error("No se pudieron obtener tus tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // map a UI
  const rowsAll: RowUI[] = useMemo(() => {
    return (raw || []).map((t) => {
      const codigoEstado = (
        t.estado?.codigo || "ABIERTO"
      ).toUpperCase() as TicketEstado;
      const estadoCodigo: TicketEstado = (
        [
          "ABIERTO",
          "ASIGNADO",
          "EN_PROCESO",
          "RESUELTO",
          "REABIERTO",
          "CANCELADO",
          "DERIVADO",
        ] as const
      ).includes(codigoEstado)
        ? codigoEstado
        : "ABIERTO";

      // Si tu core_Ticket incluye area?.nombre úsalo; si no, mostramos fallback por id
      const area_nombre =
        (t.area?.nombre as string | undefined) ?? `Área #${t.area_id}`;

      return {
        id: t.id,
        codigo: t.codigo,
        area_nombre,
        descripcion: t.descripcion ?? "",
        estadoCodigo,
        estadoNombre: t.estado?.nombre ?? ESTADO_META[estadoCodigo].label,
        creado_en: t.createdAt as unknown as string, // tu API trae createdAt ISO
      };
    });
  }, [raw]);

  // filtros locales (q, estado)
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
    if (estado) data = data.filter((r) => r.estadoCodigo === estado);
    // orden por creado desc (como antes)
    data = data
      .slice()
      .sort(
        (a, b) => dayjs(b.creado_en).valueOf() - dayjs(a.creado_en).valueOf()
      );
    return data;
  }, [rowsAll, q, estado]);

  // paginar en cliente
  const total = rowsFiltered.length;
  const data = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rowsFiltered.slice(start, start + pageSize);
  }, [rowsFiltered, page, pageSize]);

  const onBuscar = () => {
    setPage(1);
    // no pega al backend: filtramos localmente
  };

  const onVer = (row: RowUI) => {
    router.push(`/hd/est/${row.id}`);
  };

  const columns: ColumnsType<RowUI> = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      width: 160,
      render: (v) => <Text strong>{v}</Text>,
      fixed: "left",
      onCell: () => ({ className: "whitespace-nowrap" }),
    },
    {
      title: "Área",
      dataIndex: "area_nombre",
      key: "area",
      width: 210,
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      ellipsis: true,
      render: (v: string) => (
        <Tooltip title={v}>
          <Paragraph className="!mb-0" ellipsis={{ rows: 2 }}>
            {v}
          </Paragraph>
        </Tooltip>
      ),
    },
    {
      title: "Estado",
      key: "estado",
      width: 160,
      render: (_, row) => {
        const meta = ESTADO_META[row.estadoCodigo];
        return (
          <Tooltip title={row.estadoNombre}>
            <Tag color={meta.color}>{meta.label}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Creado",
      dataIndex: "creado_en",
      key: "creado_en",
      width: 180,
      render: (iso: string) => (
        <span className="text-slate-600">
          <FieldTimeOutlined className="mr-1" />
          {fmt(iso)}
        </span>
      ),
      sorter: (a, b) =>
        dayjs(a.creado_en).valueOf() - dayjs(b.creado_en).valueOf(),
      defaultSortOrder: "descend",
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 110,
      fixed: "right",
      render: (_, row) => (
        <Button icon={<EyeOutlined />} onClick={() => onVer(row)}>
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-sky-50 via-white to-white">
      {/* HERO */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 p-[1px] shadow-lg">
          <div className="rounded-2xl bg-white/80 backdrop-blur-md px-6 py-6 md:px-10">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Title level={3} className="m-0 !text-slate-900">
                  📁 Mis Tickets
                </Title>
                <Text type="secondary">
                  Consulta el estado y el historial de tus tickets registrados.
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip title="Tus datos están protegidos">
                  <SafetyCertificateTwoTone twoToneColor="#22c55e" />
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
                  <InfoCircleOutlined /> Recibirás avisos por tu correo
                  institucional UMA cuando tu ticket cambie de estado.
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          {/* Filtros mínimos */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-8">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por código o descripción"
                allowClear
                prefix={<SearchOutlined />}
                onPressEnter={onBuscar}
              />
            </div>
            <div className="md:col-span-4">
              <Select
                placeholder="Estado"
                allowClear
                value={estado}
                onChange={(v) => {
                  setEstado(v as TicketEstado | undefined);
                  setPage(1);
                  setTimeout(onBuscar, 0);
                }}
                options={estadosOptions}
                className="w-full"
                suffixIcon={<FilterOutlined />}
              />
            </div>
          </div>

          {/* Botón único de búsqueda */}
          <div className="mb-4">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={onBuscar}
              loading={loading}
            >
              Buscar
            </Button>
          </div>

          {/* Tabla */}
          <Table<RowUI>
            rowKey="id"
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
              showTotal: (t) => `${t} ticket(s)`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No se encontraron tickets"
                />
              ),
            }}
            scroll={{ x: 900 }}
          />
        </Card>
      </div>
    </div>
  );
}
