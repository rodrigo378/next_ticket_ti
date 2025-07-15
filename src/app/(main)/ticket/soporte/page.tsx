"use client";

import { Table, Tag, Button, Typography, Space, message, Select } from "antd";
import {
  EyeOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { TicketTi } from "@/interface/ticket_ti";
import Link from "next/link";
import { getTickets } from "@/services/ticket_ti";

const { Title } = Typography;
const { Option } = Select;

// Simulación de user_id (puedes quitar esto si ya lo manejas desde tu auth)
const userIdSimulado = 999;

export default function Page() {
  const [ticketsTi, setTicketsTi] = useState<TicketTi[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getTickets(); // El backend ya filtra por áreas del usuario
      setTicketsTi(data);
    } catch (error) {
      console.error("error => ", error);
      message.error("Error al cargar los tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (ticketId: number, estadoId: number) => {
    try {
      console.log(ticketId, estadoId);

      // await updateEstadoTicket(ticketId, estadoId);
      message.success("Estado actualizado correctamente");
      fetchTickets();
    } catch (error) {
      console.error("error => ", error);
      message.error("Error al actualizar estado");
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
      key: "incidencia",
      render: (nombre: string) => <Tag color="blue">{nombre}</Tag>,
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
      key: "estado",
      render: (record: TicketTi) => (
        <Select
          value={record.estado?.id}
          onChange={(value) => handleEstadoChange(record.id!, value)}
          style={{ width: 150 }}
        >
          <Option value={1}>Abierto</Option>
          <Option value={2}>En Proceso</Option>
          <Option value={3}>Resuelto</Option>
        </Select>
      ),
    },
    {
      title: "Asignado a mí",
      key: "asignado_a_mi",
      render: (record: TicketTi) =>
        record.asignado_id === userIdSimulado ? (
          <CheckCircleTwoTone twoToneColor="#52c41a" />
        ) : (
          <CloseCircleTwoTone twoToneColor="#ff4d4f" />
        ),
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
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
}
