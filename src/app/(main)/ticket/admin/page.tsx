"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  message,
  Tag,
  Select,
  Drawer,
  Divider,
  Descriptions,
  Tabs,
  Row,
  Col,
  Progress,
  Typography,
  Card,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { Usuario } from "@/interface/usuario";
import { asignarTicket, getTicket, getTickets } from "@/services/ticket_ti";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { getUsuarios } from "@/services/usuario";
import { Ticket } from "@/interface/ticket_ti";
import { PrioridadTicket } from "@/interface/prioridad";

dayjs.extend(relativeTime);
dayjs.locale("es");

const { Option } = Select;
const { Text } = Typography;

const items = [
  { key: "sin_asignar", label: "Sin asignar" },
  { key: "asignados", label: "Asignados" },
];

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
  const [tabKey, setTabKey] = useState("sin_asignar");

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

  const fetchTicketsTi = async (estados_id?: string[]) => {
    try {
      setLoading(true);
      const data = await getTickets({ me: undefined, estados_id });
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
      await asignarTicket(ticketSeleccionado.id, {
        asignado_id: asignadoId,
        prioridad_id: prioridadId,
      });

      message.success("✅ Ticket actualizado correctamente");
      // Refrescar la pestaña "Sin asignar" para que desaparezca de esa lista
      fetchTicketsTi(["1"]);
      setDrawerVisible(false);
    } catch (error) {
      console.error("error =>", error);
      message.error("❌ Error al actualizar el ticket");
    }
  };

  useEffect(() => {
    fetchTicketsTi(["1"]);
    fetchUsuarios();
  }, []);

  const columns = [
    {
      title: "Codigo",
      dataIndex: "codigo",
      key: "codigo",
    },
    {
      title: "Área",
      dataIndex: ["categoria", "subarea", "area", "nombre"],
      key: "area",
    },
    {
      title: "Tipo",
      key: "tipo",
      render: (record: Ticket) => {
        const tipo = record.categoria?.incidencia?.tipo;
        const icon = tipo === "requerimiento" ? "📌" : "⚠️";
        return (
          <span>
            {icon} {tipo}
          </span>
        );
      },
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
            : prioridad?.nombre === "Baja"
            ? "green"
            : "";
        return (
          <Tag color={color}>
            {prioridad?.nombre === undefined ? "Sin asignar" : prioridad.nombre}
          </Tag>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: ["estado", "nombre"],
      key: "estado",
      render: (estado: string) => {
        const color =
          estado?.toLowerCase() === "resuelto"
            ? "green"
            : estado?.toLowerCase() === "abierto"
            ? "blue"
            : "orange";
        return <Tag color={color}>{estado?.toUpperCase()}</Tag>;
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

  const onChange = (key: string) => {
    setTabKey(key);
    if (key === "sin_asignar") fetchTicketsTi(["1"]);
    else if (key === "asignados") fetchTicketsTi(["2", "3", "4"]);
  };

  // -------- Helpers SLA para Drawer --------
  const tieneSLA = useMemo(
    () =>
      Boolean(ticketSeleccionado?.slaTicket && ticketSeleccionado?.asignadoAt),
    [ticketSeleccionado]
  );

  // Reemplaza tus helpers por estos:
  // Congela el "ahora" para cada métrica
  const nowForRespuesta = (t?: Ticket | null) =>
    t?.respondidoAt ? dayjs(t.respondidoAt) : dayjs();

  const nowForResolucion = (t?: Ticket | null) =>
    t?.finalizadoAt ? dayjs(t.finalizadoAt) : dayjs();

  const calcPercent = (
    start?: string | Date,
    end?: string | Date,
    nowRef?: dayjs.Dayjs
  ): number => {
    if (!start || !end) return 0;
    const s = dayjs(start);
    const e = dayjs(end);
    const now = nowRef ?? dayjs();
    if (!s.isValid() || !e.isValid()) return 0;

    const total = e.diff(s); // ms totales
    if (total <= 0) return 100;

    const trans = Math.min(Math.max(now.diff(s), 0), total);
    return Math.floor((trans / total) * 100); // floor para estabilidad
  };

  const humanRemaining = (end?: string | Date, nowRef?: dayjs.Dayjs) => {
    if (!end) return "—";
    const e = dayjs(end);
    const now = nowRef ?? dayjs();
    if (!e.isValid()) return "—";
    if (now.isAfter(e)) return "Vencido";
    return `Faltan ${e.toNow(true)}`;
  };

  // RESPUESTA: inicio = asignadoAt, fin = tiempo_estimado_respuesta, ahora = respondidoAt || now
  const respNow = nowForRespuesta(ticketSeleccionado);
  const respPercent = calcPercent(
    ticketSeleccionado?.asignadoAt,
    ticketSeleccionado?.slaTicket?.tiempo_estimado_respuesta,
    respNow
  );
  const respRemaining = humanRemaining(
    ticketSeleccionado?.slaTicket?.tiempo_estimado_respuesta,
    respNow
  );

  // RESOLUCIÓN: inicio = asignadoAt, fin = tiempo_estimado_resolucion, ahora = finalizadoAt || now
  const resoNow = nowForResolucion(ticketSeleccionado);
  const resoPercent = calcPercent(
    ticketSeleccionado?.asignadoAt,
    ticketSeleccionado?.slaTicket?.tiempo_estimado_resolucion,
    resoNow
  );
  const resoRemaining = humanRemaining(
    ticketSeleccionado?.slaTicket?.tiempo_estimado_resolucion,
    resoNow
  );

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Asignar Soporte</h1>

      <Tabs
        activeKey={tabKey}
        onChange={onChange}
        items={items}
        className="mb-4"
      />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={tickets}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title={
          <span className="text-lg font-semibold">
            🎫 Detalle del Ticket: {ticketSeleccionado?.codigo}
          </span>
        }
        placement="right"
        width={560}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {ticketSeleccionado && (
          <div className="flex flex-col gap-6">
            <Divider orientation="left">📄 Información General</Divider>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Área">
                {ticketSeleccionado.area?.nombre}
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color="blue">{ticketSeleccionado.estado?.nombre}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Creado por">
                {ticketSeleccionado.creado?.nombre}{" "}
                {ticketSeleccionado.creado?.apellidos}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de creación">
                {ticketSeleccionado.createdAt
                  ? dayjs(ticketSeleccionado.createdAt).format(
                      "DD/MM/YYYY HH:mm"
                    )
                  : "—"}
              </Descriptions.Item>
              {ticketSeleccionado.asignadoAt && (
                <Descriptions.Item label="Fecha de asignación">
                  {ticketSeleccionado.asignadoAt
                    ? dayjs(ticketSeleccionado.asignadoAt).format(
                        "DD/MM/YYYY HH:mm"
                      )
                    : "—"}
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Catálogo de servicio">
                {
                  ticketSeleccionado.categoria?.incidencia?.catalogo_servicio
                    ?.nombre
                }
              </Descriptions.Item>
              <Descriptions.Item
                label={ticketSeleccionado.categoria?.incidencia?.tipo}
              >
                {ticketSeleccionado.categoria?.incidencia?.nombre}
              </Descriptions.Item>
              <Descriptions.Item label="Categoría">
                {ticketSeleccionado.categoria?.nombre}
              </Descriptions.Item>
              <Descriptions.Item label="Descripcion">
                {ticketSeleccionado.descripcion}
              </Descriptions.Item>
            </Descriptions>

            {/* SLA del ticket: visible solo si está asignado y tiene registro SLA */}
            {tieneSLA && (
              <>
                <Divider orientation="left">⏱ SLA del Ticket</Divider>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Tiempo de Respuesta (min)">
                    {ticketSeleccionado.slaTicket?.sla?.tiempo_respuesta ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiempo de Resolución (min)">
                    {ticketSeleccionado.slaTicket?.sla?.tiempo_resolucion ??
                      "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Estimado de Respuesta">
                    {ticketSeleccionado.slaTicket?.tiempo_estimado_respuesta
                      ? dayjs(
                          ticketSeleccionado.slaTicket.tiempo_estimado_respuesta
                        ).format("DD/MM/YYYY HH:mm")
                      : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Estimado de Resolución">
                    {ticketSeleccionado.slaTicket?.tiempo_estimado_resolucion
                      ? dayjs(
                          ticketSeleccionado.slaTicket
                            .tiempo_estimado_resolucion
                        ).format("DD/MM/YYYY HH:mm")
                      : "—"}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {tieneSLA && (
              <Card size="small" className="mt-2" bordered>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Text strong>Progreso → Respuesta</Text>
                    <div className="mt-2 flex items-center justify-center">
                      <Progress
                        type="circle"
                        percent={respPercent}
                        status={respPercent >= 100 ? "exception" : "normal"}
                      />
                    </div>
                    <div className="text-center mt-2 text-xs text-gray-500">
                      {respRemaining}
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <Text strong>Progreso → Resolución</Text>
                    <div className="mt-2 flex items-center justify-center">
                      <Progress
                        type="circle"
                        percent={resoPercent}
                        status={resoPercent >= 100 ? "exception" : "normal"}
                      />
                    </div>
                    <div className="text-center mt-2 text-xs text-gray-500">
                      {resoRemaining}
                    </div>
                  </Col>
                </Row>
              </Card>
            )}

            {ticketSeleccionado.documentos &&
              ticketSeleccionado.documentos?.length > 0 && (
                <>
                  <Divider orientation="left">📎 Archivos Adjuntos</Divider>
                  <ul className="list-disc pl-5 space-y-1">
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
                            📄 {archivo.nombre}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

            <Divider orientation="left">👨‍🔧 Asignación y Prioridad</Divider>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-medium">Asignar Soporte:</p>
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
                <p className="font-medium">Prioridad:</p>
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
                className="mt-2"
                icon={<EyeOutlined />}
                onClick={handleActualizar}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
