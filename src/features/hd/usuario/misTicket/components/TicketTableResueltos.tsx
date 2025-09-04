import { HD_Ticket } from "@/interface/hd/hd_ticket";
import { ExclamationCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Rate, Table, Tag } from "antd";
import Link from "next/link";

interface Props {
  ticket: HD_Ticket[];
}

export default function TicketTableResueltos({ ticket }: Props) {
  const columns = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      render: (codigo: string) => <Tag color="blue">{codigo}</Tag>,
    },
    {
      title: "Área",
      dataIndex: ["categoria", "subarea", "area", "nombre"],
      key: "area",
    },
    {
      title: "Servicio",
      key: "servicio",
      render: (ticket: HD_Ticket) => {
        const subarea = ticket.categoria?.subarea?.nombre || "—";
        const incidencia = ticket.categoria?.incidencia?.nombre || "—";
        const categoria = ticket.categoria?.nombre || "—";
        return (
          <span>
            {subarea} / {incidencia} / {categoria}
          </span>
        );
      },
    },
    {
      title: "Tipo",
      dataIndex: ["categoria", "incidencia", "tipo"],
      key: "tipo",
    },
    {
      title: "Estado",
      dataIndex: ["estado", "nombre"],
      key: "estado",
      render: (nombre?: string) => (
        // <Tag color={estadoColor(nombre)}>{nombre}</Tag>
        <Tag>{nombre}</Tag>
      ),
    },
    {
      title: "Responsable",
      dataIndex: ["asignado", "nombre"],
      key: "responsable",
      render: (_: unknown, record: HD_Ticket) =>
        record.asignado
          ? `${record.asignado.nombre} ${record.asignado.apellidos ?? ""}`
          : "—",
    },
    {
      title: "Calificación",
      key: "calificacion",
      render: (ticket: HD_Ticket) => {
        const calif = ticket?.calificacionTicket?.calificacion;
        return calif ? (
          <Rate allowHalf disabled defaultValue={Number(calif)} />
        ) : (
          <Tag icon={<ExclamationCircleOutlined />} color="gold">
            Pendiente
          </Tag>
        );
      },
    },
    {
      title: "Creado",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string | Date) => (
        // <span>{dayjs(createdAt).fromNow()}</span>
        <span>{createdAt.toLocaleString()}</span>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (record: { id: number }) => (
        <Link href={`/hd/ticket/bandeja/${record.id}`}>
          <Button type="link" icon={<EyeOutlined />}>
            Ver
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={ticket}
      pagination={{ pageSize: 5 }}
      rowKey="id"
      bordered
      rowClassName={(record: HD_Ticket) =>
        !record?.calificacionTicket?.calificacion ? "bg-yellow-50" : ""
      }
    />
  );
}
