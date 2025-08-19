import { PrioridadTicket } from "@/interface/prioridad";
import { Ticket } from "@/interface/ticket_ti";
import { Button, Table, Tag } from "antd";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { Usuario } from "@/interface/usuario";
import { EyeOutlined } from "@ant-design/icons";
dayjs.extend(relativeTime);
dayjs.locale("es");

interface Props {
  tickets: Ticket[];
  loading: boolean;
  abrirDrawer: (ticket: Ticket) => void;
}

export default function TicketTableAdmin({
  tickets,
  loading,
  abrirDrawer,
}: Props) {
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

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={tickets}
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
}
