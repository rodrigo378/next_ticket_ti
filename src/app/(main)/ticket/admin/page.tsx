"use client";

import { useEffect, useState } from "react";
import { Table, Button, message, Tag, Select, Drawer } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { TicketTi } from "@/interface/ticket_ti";
import { getUsuarios } from "@/services/admin";
import { Usuario } from "@/interface/usuario";
import { asignarSoporte, getTickets } from "@/services/ticket_ti";
import { Prioridad } from "@/interface/prioridad";

const { Option } = Select;

export default function Page() {
  const [tickets, setTickets] = useState<TicketTi[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState<TicketTi | null>(
    null
  );
  const [asignadoId, setAsignadoId] = useState<number | undefined>();
  const [prioridadId, setPrioridadId] = useState<number | undefined>();

  const abrirDrawer = (ticket: TicketTi) => {
    setTicketSeleccionado(ticket);
    setAsignadoId(ticket.asignado_id ?? undefined); // Convertimos null a undefined
    setPrioridadId(ticket.prioridad_id ?? undefined); // Igual aquí por si acaso
    setDrawerVisible(true);
  };

  const fetchTicketsTi = async () => {
    try {
      setLoading(true);
      const data = await getTickets();
      setTickets(data);
    } catch (error) {
      console.error("error => ", error);
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
      console.error("error => ", error);
    }
  };

  const handleAsignar = async (ticketId: number, asignado_id: number) => {
    try {
      // await updateTicketTi(ticket_id, data);

      // console.log("Asignando ticket =>", ticketId, data);
      const response = await asignarSoporte(ticketId, asignado_id);
      console.log("response => ", response);

      message.success("Ticket actualizado correctamente");
      fetchTicketsTi();
    } catch (error) {
      console.error("error => ", error);
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
      title: "Área",
      dataIndex: ["incidencia", "area", "nombre"],
      key: "area",
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
      key: "creado_id",
      render: (record: TicketTi) =>
        `${record.creado?.nombre || ""} ${record.creado?.apellidos || ""}`,
    },
    {
      title: "Asignado a",
      dataIndex: "asignado",
      key: "asignado",
      render: (asignado: Usuario | null) =>
        asignado ? (
          <span>
            {asignado.nombre} {asignado.apellidos}
          </span>
        ) : (
          <Tag color="default">No asignado</Tag>
        ),
    },
    {
      title: "Prioridad",
      dataIndex: "prioridad",
      key: "prioridad_id",
      render: (prioridad: Prioridad) => <span>{prioridad?.nombre}</span>,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (record: TicketTi) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => abrirDrawer(record)}
        >
          Ver
        </Button>
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
      <Drawer
        title={`Detalle del ticket: ${ticketSeleccionado?.titulo}`}
        placement="right"
        width={450}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {ticketSeleccionado && (
          <div className="flex flex-col gap-4">
            <p>
              <strong>Descripción:</strong> {ticketSeleccionado.descripcion}
            </p>
            <p>
              <strong>Área:</strong>{" "}
              {ticketSeleccionado.incidencia?.area?.nombre}
            </p>
            <p>
              <strong>Estado:</strong> {ticketSeleccionado.estado?.nombre}
            </p>
            <p>
              <strong>Creado por:</strong> {ticketSeleccionado.creado?.nombre}{" "}
              {ticketSeleccionado.creado?.apellidos}
            </p>
            <p>
              <strong>Incidencia:</strong>{" "}
              {ticketSeleccionado.incidencia?.nombre}
            </p>
            <p>
              <strong>Categoría:</strong> {ticketSeleccionado.categoria?.nombre}
            </p>

            <div>
              <p>
                <strong>Asignar soporte:</strong>
              </p>
              <Select
                style={{ width: "100%" }}
                value={asignadoId}
                onChange={(value) => setAsignadoId(value)}
                placeholder="Seleccionar soporte"
              >
                {usuarios.map((usuario) => (
                  <Option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellidos}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <p>
                <strong>Prioridad:</strong>
              </p>
              <Select
                style={{ width: "100%" }}
                value={prioridadId?.toString()}
                onChange={(value) => setPrioridadId(Number(value))}
                placeholder="Seleccionar prioridad"
              >
                <Option value="1">Baja</Option>
                <Option value="2">Media</Option>
                <Option value="3">Alta</Option>
              </Select>
            </div>

            <Button
              type="primary"
              block
              className="mt-4"
              onClick={() => {
                if (ticketSeleccionado) {
                  handleAsignar(ticketSeleccionado.id!, asignadoId!);
                  setDrawerVisible(false);
                }
              }}
            >
              Guardar Cambios
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
