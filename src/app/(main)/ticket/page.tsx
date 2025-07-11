"use client";

import { Table, Tag, Typography, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import Link from "next/link";
// import { useEffect, useState } from "react";
// import { TicketTi } from "@/interface/ticket_ti";
// import { getTicketsMe } from "@/services/ticket_ti";

const { Title } = Typography;

const data = [
  {
    key: 1,
    titulo: "Fallo en el servidor de correo",
    estado: { nombre: "Cerrado" },
    prioridad: { nombre: "Alta" },
    createdAt: "2025-07-01T09:15:00Z",
    id: 101,
  },
  {
    key: 2,
    titulo: "Solicitud de acceso a VPN",
    estado: { nombre: "En progreso" },
    prioridad: { nombre: "Media" },
    createdAt: "2025-07-05T14:30:00Z",
    id: 102,
  },
  {
    key: 3,
    titulo: "Actualización de software de seguridad",
    estado: { nombre: "Abierto" },
    prioridad: { nombre: "Alta" },
    createdAt: "2025-07-10T08:00:00Z",
    id: 103,
  },
  {
    key: 4,
    titulo: "Configuración de nueva impresora",
    estado: { nombre: "Cerrado" },
    prioridad: { nombre: "Baja" },
    createdAt: "2025-06-28T11:45:00Z",
    id: 104,
  },
  {
    key: 5,
    titulo: "Problema con conexión a Internet",
    estado: { nombre: "En progreso" },
    prioridad: { nombre: "Alta" },
    createdAt: "2025-07-09T16:20:00Z",
    id: 105,
  },
];

const columns = [
  {
    title: "Título",
    dataIndex: "titulo",
    key: "titulo",
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
  // const [ticketsTi, serTicketsTi] = useState<TicketTi[]>([]);

  // const fetchTicketsTi = async () => {
  //   try {
  //     const data = await getTicketsMe();
  //     serTicketsTi(data);
  //     console.log("data => ", data);
  //   } catch (error) {
  //     console.log("error => ", error);
  //   }
  // };

  // useEffect(() => {
  //   const fetch = async () => {
  //     await fetchTicketsTi();
  //   };
  //   fetch();
  // }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm">
      <Title level={3}>🎟️ Mis Tickets</Title>

      <Table
        columns={columns}
        // dataSource={dataSource}
        dataSource={data}
        pagination={{ pageSize: 5 }}
        rowKey="id"
        bordered
      />
    </div>
  );
}
