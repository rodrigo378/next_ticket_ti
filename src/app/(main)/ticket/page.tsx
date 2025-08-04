"use client";

import { Table, Typography, Tag, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
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

  const columns = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      render: (codigo: string) => <Tag color="blue">{codigo}</Tag>,
    },
    {
      title: "Area",
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
      render: (estado: string) => {
        let color = "blue";
        if (estado === "Cerrado") color = "green";
        else if (estado === "En progreso") color = "orange";
        else if (estado === "Abierto") color = "red";
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: "Responsable",
      dataIndex: ["asignado", "nombre"],
      key: "responsable",
      render: (nombre?: string) => nombre || "—",
    },
    {
      title: "Creado",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => <span>{dayjs(createdAt).fromNow()}</span>,
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

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm">
      <Title level={3}>🎟️ Mis Tickets</Title>

      <Table
        columns={columns}
        dataSource={tickets}
        pagination={{ pageSize: 5 }}
        rowKey="id"
        bordered
      />
    </div>
  );
}
