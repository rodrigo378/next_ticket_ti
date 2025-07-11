"use client";

import { useEffect, useState } from "react";
import { getTicketsTi, updateTicketTi } from "@/services/ticket_ti";
import { Table, Button, message, Tag, Select } from "antd";
import Link from "next/link";
import { EyeOutlined } from "@ant-design/icons";
import { TicketTi } from "@/interface/ticket_ti";
import { getUsuarios } from "@/services/admin";
import { Usuario } from "@/interface/usuario";

const { Option } = Select;

export default function Page() {
  const [tickets, setTickets] = useState<TicketTi[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const fetchTicketsTi = async () => {
    try {
      setLoading(true);
      const data = await getTicketsTi();
      setTickets(data);
    } catch (error) {
      console.log("error => ", error);
      message.error("Error al obtener los tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  // const fetchSoportes = async () => {
  //   try {
  //     const data = await getUsuariosSoporte();
  //     setSoportes(data);
  //   } catch (error) {
  //     console.log("error => ", error);
  //     message.error("Error al obtener usuarios de soporte");
  //   }
  // };

  const handleAsignar = async (
    ticketId: number,
    data: { asignado_id?: number; prioridad_id?: number }
  ) => {
    try {
      console.log("select cambio usuario");

      console.log("ticketId => ", ticketId);
      console.log("soporteId => ", data);

      await updateTicketTi(ticketId, data);
      message.success("Ticket asignado correctamente");
      fetchTicketsTi(); // Recargar tickets
    } catch (error) {
      console.log("error => ", error);
      message.error("Error al asignar ticket");
    }
  };

  useEffect(() => {
    fetchTicketsTi();
    fetchUsuarios();
  }, []);

  const columns = [
    {
      title: "Título",
      dataIndex: "titulo",
      key: "titulo",
    },
    {
      title: "Estado",
      dataIndex: ["estado", "nombre"],
      key: "estado",
      render: (estado: string) => {
        const color =
          estado === "resuelto"
            ? "green"
            : estado === "abierto"
            ? "blue"
            : "orange";
        return <Tag color={color}>{estado.toUpperCase()}</Tag>;
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
      title: "Creado por",
      // dataIndex: {cre},
      key: "creado_id",
      render: (record: TicketTi) => {
        return `${record.creado.nombre} ${record.creado.apellidos}`;
      },
    },
    {
      title: "Asignar a soporte",
      key: "asignar",
      render: (record: TicketTi) => (
        <Select
          defaultValue={record.asignado_id || undefined}
          placeholder="Seleccionar"
          style={{ width: 160 }}
          onChange={(value) =>
            handleAsignar(record.id!, { asignado_id: value })
          }
        >
          {usuarios.map((usuario) => (
            <Option key={usuario.id} value={usuario.id}>
              {usuario.nombre}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "prioridad",
      key: "prioridad_id",
      render: (record: TicketTi) => (
        <Select
          defaultValue={record.prioridad_id?.toString() || undefined}
          onChange={(value) =>
            handleAsignar(record.id!, { prioridad_id: Number(value) })
          }
          placeholder="Seleccionar"
          style={{ width: 160 }}
        >
          <Option key="1" value="1">
            Alta
          </Option>
          <Option key="2" value="2">
            Media
          </Option>
          <Option key="" value="3">
            Baja
          </Option>
        </Select>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (record: TicketTi) => (
        <Link href={`/ticket_ti/ticket/${record.id}`}>
          <Button type="link" icon={<EyeOutlined />}>
            Ver
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Listado de Tickets TI</h1>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={tickets}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
