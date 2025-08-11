"use client";

import { Table, Typography, Tag, Button, Tabs, Rate, Space, Badge } from "antd";
import { EyeOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getTicketsMe } from "@/services/ticket_ti";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { Ticket } from "@/interface/ticket_ti";

dayjs.extend(relativeTime);
dayjs.locale("es");

const { Title } = Typography;

export default function Page() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const fetchTickets = async () => {
    try {
      const data = await getTicketsMe();
      setTickets(data);
    } catch (error) {
      console.error("Error al obtener tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Derivaciones por estado
  const ticketsActivos = useMemo(
    () => tickets.filter((t) => ![4, 6].includes(t.estado_id)), // 4=Resuelto, 6=Cancelado
    [tickets]
  );
  const ticketsResueltos = useMemo(
    () => tickets.filter((t) => t.estado_id === 4),
    [tickets]
  );

  // Conteo de resueltos pendientes de calificar
  const pendientes = useMemo(
    () =>
      ticketsResueltos.filter((t) => !t?.CalificacionTicket?.calificacion)
        .length,
    [ticketsResueltos]
  );

  // Colores de estado (según tu seed)
  const estadoColor = (nombre?: string) => {
    switch (nombre) {
      case "Abierto/Creado":
        return "red";
      case "Asignado":
        return "blue";
      case "En Proceso":
        return "orange";
      case "Resuelto":
        return "green";
      case "Reabierto/Observado":
        return "magenta";
      case "Cancelado":
        return "default";
      default:
        return "blue";
    }
  };

  const baseColumns = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      render: (codigo: string) => <Tag color="blue">{codigo}</Tag>,
    },
    {
      title: "Área",
      dataIndex: ["categoria", "subarea", "area", "nombre"],
      key: "area",
    },
    {
      title: "Servicio",
      key: "servicio",
      render: (ticket: Ticket) => {
        const subarea = ticket.categoria?.subarea?.nombre || "—";
        const incidencia = ticket.categoria?.incidencia?.nombre || "—";
        const categoria = ticket.categoria?.nombre || "—";
        return (
          <span>
            {subarea} / {incidencia} / {categoria}
          </span>
        );
      },
    },
    {
      title: "Tipo",
      dataIndex: ["categoria", "incidencia", "tipo"],
      key: "tipo",
    },
    {
      title: "Estado",
      dataIndex: ["estado", "nombre"],
      key: "estado",
      render: (nombre?: string) => (
        <Tag color={estadoColor(nombre)}>{nombre}</Tag>
      ),
    },
    {
      title: "Responsable",
      dataIndex: ["asignado", "nombre"],
      key: "responsable",
      render: (_: any, record: Ticket) =>
        record.asignado
          ? `${record.asignado.nombre} ${record.asignado.apellidos ?? ""}`
          : "—",
    },
    {
      title: "Creado",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string | Date) => (
        <span>{dayjs(createdAt).fromNow()}</span>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (record: { id: number }) => (
        <Link href={`/ticket/${record.id}`}>
          <Button type="link" icon={<EyeOutlined />}>
            Ver
          </Button>
        </Link>
      ),
    },
  ];

  // Tabla Activos (sin columna de calificación)
  const columnsActivos = baseColumns;

  // Tabla Resueltos (con columna de calificación/distintivo)
  const columnsResueltos = [
    ...baseColumns.slice(0, 5), // hasta Estado
    {
      title: "Calificación",
      key: "calificacion",
      render: (ticket: Ticket) => {
        const calif = ticket?.CalificacionTicket?.calificacion;
        return calif ? (
          <Rate allowHalf disabled defaultValue={Number(calif)} />
        ) : (
          <Tag icon={<ExclamationCircleOutlined />} color="gold">
            Pendiente
          </Tag>
        );
      },
    },
    ...baseColumns.slice(5), // Responsable, Creado, Acciones
  ];

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm">
      <Space direction="vertical" style={{ width: "100%" }}>
        <Title level={3}>🎟️ Mis Tickets</Title>

        <Tabs
          defaultActiveKey="activos"
          items={[
            {
              key: "activos",
              label: "Activos",
              children: (
                <Table
                  columns={columnsActivos}
                  dataSource={ticketsActivos}
                  pagination={{ pageSize: 5 }}
                  rowKey="id"
                  bordered
                />
              ),
            },
            {
              key: "resueltos",
              label: (
                <>
                  Resueltos
                  {pendientes > 0 && (
                    <Badge count={pendientes} style={{ marginLeft: 8 }} />
                  )}
                </>
              ),
              children: (
                <Table
                  columns={columnsResueltos}
                  dataSource={ticketsResueltos}
                  pagination={{ pageSize: 5 }}
                  rowKey="id"
                  bordered
                  // filas resaltadas cuando falta calificar
                  rowClassName={(record: Ticket) =>
                    !record?.CalificacionTicket?.calificacion
                      ? "bg-yellow-50"
                      : ""
                  }
                />
              ),
            },
          ]}
        />
      </Space>
    </div>
  );
}
