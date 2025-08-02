"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  message,
  Tag,
  Select,
  Drawer,
  Divider,
  Descriptions,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { Usuario } from "@/interface/usuario";
import { getTicket, getTickets, updateTicket } from "@/services/ticket_ti";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { getUsuarios } from "@/services/usuario";
import { Ticket } from "@/interface/ticket_ti";
import { PrioridadTicket } from "@/interface/prioridad";

dayjs.extend(relativeTime);
dayjs.locale("es");

const { Option } = Select;

export default function Page() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(
    null
  );
  const [asignadoId, setAsignadoId] = useState<number | undefined>();
  const [prioridadId, setPrioridadId] = useState<number | undefined>();

  const abrirDrawer = async (ticket: Ticket) => {
    try {
      const data = await getTicket(ticket.id!);
      setTicketSeleccionado(data);
      setAsignadoId(data.asignado_id ?? undefined);
      setPrioridadId(data.prioridad_id ?? undefined);
      setDrawerVisible(true);
    } catch (error) {
      console.error("Error al obtener detalle del ticket", error);
      message.error("❌ Error al cargar detalle del ticket");
    }
  };

  const fetchTicketsTi = async () => {
    try {
      setLoading(true);
      const data = await getTickets();
      console.log("tickets => ", data);

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

  const handleActualizar = async () => {
    if (!ticketSeleccionado || !asignadoId || !prioridadId) {
      message.warning("Debes seleccionar soporte y prioridad");
      return;
    }

    try {
      await updateTicket(Number(ticketSeleccionado.id), {
        asignado_id: asignadoId,
        prioridad_id: prioridadId,
        estado_id: 2,
      });
      message.success("✅ Ticket actualizado correctamente");
      fetchTicketsTi();
      setDrawerVisible(false);
    } catch (error) {
      console.error("error =>", error);
      message.error("❌ Error al actualizar el ticket");
    }
  };

  useEffect(() => {
    fetchTicketsTi();
    fetchUsuarios();
  }, []);

  // const slaActual = ticketSeleccionado?.categoria?.SLA?.find(
  //   (sla) => sla.prioridad_id === prioridadId
  // );
  // console.log("slaActual => ", slaActual);

  const columns = [
    {
      title: "Codigo",
      dataIndex: "codigo",
      key: "codigo",
    },
    {
      title: "Área",
      dataIndex: ["categoria", "incidencia", "subarea", "area", "nombre"],
      key: "area",
    },
    {
      title: "tipo",
      dataIndex: ["categoria", "incidencia", "tipo"],
      key: "tipo",
    },
    {
      title: "Prioridad",
      dataIndex: "prioridad",
      key: "prioridad_id",
      render: (prioridad: PrioridadTicket) => {
        const color =
          prioridad?.nombre === "Alta"
            ? "red"
            : prioridad?.nombre === "Media"
            ? "orange"
            : "green";

        return <Tag color={color}>{prioridad?.nombre}</Tag>;
      },
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
      render: (createdAt: string) => dayjs(createdAt).fromNow(),
    },
    {
      title: "Creado por",
      key: "creado_id",
      render: (record: Ticket) =>
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
      title: "Acciones",
      key: "acciones",
      render: (record: Ticket) => (
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
      <h1 style={{ marginBottom: 20 }}>Asignar Tickets 1</h1>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={tickets}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Drawer
        title={`Detalle del ticket: ${ticketSeleccionado?.codigo}`}
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {ticketSeleccionado && (
          <div className="flex flex-col gap-4">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Descripción">
                {ticketSeleccionado.descripcion}
              </Descriptions.Item>
              <Descriptions.Item label="Área">
                {
                  ticketSeleccionado.categoria?.incidencia?.subarea?.area
                    ?.nombre
                }
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                {ticketSeleccionado.estado?.nombre}
              </Descriptions.Item>
              <Descriptions.Item label="Creado por">
                {ticketSeleccionado.creado?.nombre}{" "}
                {ticketSeleccionado.creado?.apellidos}
              </Descriptions.Item>
              <Descriptions.Item label="Incidencia">
                {ticketSeleccionado.categoria?.nombre}
              </Descriptions.Item>
              <Descriptions.Item label="Categoría">
                {ticketSeleccionado.categoria?.nombre}
              </Descriptions.Item>
            </Descriptions>

            {/* {slaActual && ticketSeleccionado && ( */}
            <Descriptions
              bordered
              column={1}
              size="small"
              title="⏱ SLA del Ticket"
            >
              <Descriptions.Item label="Tiempo de Respuesta">
                {ticketSeleccionado.slaTicket?.sla?.tiempo_respuesta} minutos
              </Descriptions.Item>
              <Descriptions.Item label="Tiempo de Resolución">
                {ticketSeleccionado.slaTicket?.sla?.tiempo_resolucion} minutos
              </Descriptions.Item>
              <Descriptions.Item label="⏱ Estimado de Respuesta">
                {dayjs(
                  ticketSeleccionado.slaTicket?.tiempo_estimado_respuesta
                ).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="📅 Estimado de Resolución">
                {dayjs(
                  ticketSeleccionado.slaTicket?.tiempo_estimado_resolucion
                ).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>
            {/* )} */}

            {ticketSeleccionado.documentos &&
              ticketSeleccionado.documentos.length > 0 && (
                <>
                  <Divider>📎 Archivos adjuntos</Divider>
                  <ul className="list-disc pl-4">
                    {ticketSeleccionado.documentos.map((archivo, index) => {
                      const fileUrl = `http://localhost:4000${archivo.url.replace(
                        /\\/g,
                        "/"
                      )}`;
                      return (
                        <li key={index}>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            📎 {archivo.nombre}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

            <Divider>Asignar soporte y prioridad</Divider>

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
                <Option value="1">
                  <Tag color="green">Baja</Tag>
                </Option>
                <Option value="2">
                  <Tag color="orange">Media</Tag>
                </Option>
                <Option value="3">
                  <Tag color="red">Alta</Tag>
                </Option>
              </Select>
            </div>

            <Button
              type="primary"
              block
              className="mt-4"
              onClick={handleActualizar}
            >
              Guardar Cambios
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
