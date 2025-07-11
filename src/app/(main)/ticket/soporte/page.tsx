"use client";

import { Table, Tag, Button, Typography, Space, message } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getTicketSoporte } from "@/services/ticket_ti";
import { TicketTi } from "@/interface/ticket_ti";
import Link from "next/link";

const { Title } = Typography;

export default function Page() {
  const [ticketsTi, setTicketsTi] = useState<TicketTi[]>([]);

  const fetchTickets = async () => {
    try {
      const data = await getTicketSoporte();
      setTicketsTi(data);
      console.log("data => ", data);
    } catch (error) {
      console.log("error => ", error);
      message.error("error als");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Asunto",
      dataIndex: "titulo",
      key: "titulo",
    },
    {
      title: "Incidencia",
      dataIndex: ["incidencia", "nombre"],
      key: "categoria",
      render: (categoria: string) => <Tag color="blue">{categoria}</Tag>,
    },
    {
      title: "Prioridad",
      dataIndex: ["prioridad", "nombre"],
      key: "prioridad",
      render: (prioridad: string) => {
        const color =
          prioridad === "Alta"
            ? "red"
            : prioridad === "Media"
            ? "orange"
            : "green";
        return <Tag color={color}>{prioridad}</Tag>;
      },
    },
    {
      title: "Estado",
      dataIndex: ["estado", "nombre"],
      key: "estado",
      render: (estado: string) => {
        const color =
          estado === "Abierto"
            ? "green"
            : estado === "En Proceso"
            ? "blue"
            : "gray";
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (record: TicketTi) => (
        <Space>
          <Link href={`/ticket_ti/soporte/${record.id}`}>
            <Button
              type="link"
              icon={<EyeOutlined />}
              className="text-blue-600"
            >
              Ver
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      <Title level={3}>🎧 Tickets Asignados a Soporte</Title>

      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <Table
          columns={columns}
          dataSource={ticketsTi}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
}
