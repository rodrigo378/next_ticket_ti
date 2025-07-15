"use client";

import { Table, Tag, Typography, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TicketTi } from "@/interface/ticket_ti";
import { getTicketsMe } from "@/services/ticket_ti";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

dayjs.extend(relativeTime);
dayjs.locale("es");
const { Title } = Typography;

const columns = [
  {
    title: "Título",
    dataIndex: "titulo",
    key: "titulo",
  },
  {
    title: "Incidencia",
    dataIndex: ["incidencia", "nombre"],
    key: "incidencia",
    render: (incidencia: string) => <span>{incidencia}</span>,
  },
  {
    title: "Categoría",
    dataIndex: ["categoria", "nombre"],
    key: "categoria",
    render: (categoria: string) => <span>{categoria}</span>,
  },
  {
    title: "Estado",
    dataIndex: ["estado", "nombre"],
    key: "estado_id",
    render: (estado: string) => {
      let color = "blue";
      if (estado === "Cerrado") color = "green";
      else if (estado === "En progreso") color = "orange";
      else if (estado === "Abierto") color = "red";
      return <Tag color={color}>{estado}</Tag>;
    },
  },
  {
    title: "Prioridad",
    dataIndex: ["prioridad", "nombre"],
    key: "prioridad_id",
    render: (prioridad: string) => {
      const color =
        prioridad === "Alta"
          ? "volcano"
          : prioridad === "Media"
          ? "gold"
          : "green";
      return <Tag color={color}>{prioridad}</Tag>;
    },
  },
  {
    title: "Creado",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (createdAt: string) => dayjs(createdAt).fromNow(),
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

export default function Page() {
  const [ticket, setTicket] = useState<TicketTi[]>([]);

  const fetchTicketsTi = async () => {
    try {
      const data = await getTicketsMe();
      setTicket(data);
      console.log("data => ", data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      await fetchTicketsTi();
    };
    fetch();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm">
      <Title level={3}>🎟️ Mis Tickets</Title>

      <Table
        columns={columns}
        // dataSource={dataSource}
        dataSource={ticket}
        pagination={{ pageSize: 5 }}
        rowKey="id"
        bordered
      />
    </div>
  );
}
