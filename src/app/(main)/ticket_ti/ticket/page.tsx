"use client";

import { Table, Tag, Typography, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TicketTi } from "@/interface/ticket_ti";
import { getTicketsMe } from "@/services/ticket_ti";

const { Title } = Typography;

// Datos mock para vista visual

const columns = [
  {
    title: "Título",
    dataIndex: "titulo",
    key: "titulo",
  },
  {
    title: "Estado",
    dataIndex: "estado_id",
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
    dataIndex: "prioridad_id",
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
    title: "Fecha de creación",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (createdAt: string) => {
      const fecha = new Date(createdAt);
      return fecha.toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
  {
    title: "Acciones",
    key: "acciones",
    render: () => (
      <Link href={"/ticket_ti/ticket/1"}>
        <Button type="link" icon={<EyeOutlined />}>
          Ver
        </Button>
      </Link>
    ),
  },
];

export default function Page() {
  const [ticketsTi, serTicketsTi] = useState<TicketTi[]>([]);

  const fetchTicketsTi = async () => {
    try {
      const data = await getTicketsMe();
      serTicketsTi(data);
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
        dataSource={ticketsTi}
        pagination={{ pageSize: 5 }}
        rowKey="id"
        bordered
      />
    </div>
  );
}

// /ticket_ti/tickets                  → Vista general con listado de tickets
// /ticket_ti/tickets/create           → Vista de formulario para crear nuevo ticket
// /ticket_ti/tickets/{id}             → Vista de detalle de ticket (mostrar info + mensajes)
// /ticket_ti/tickets/{id}/edit        → Vista para editar ticket (solo si tiene permisos)
// /ticket_ti/tickets/{id}/asignar     → Vista modal o embebida para asignación del ticket
// /ticket_ti/tickets/{id}/cerrar
