import { Ticket } from "@/interface/ticket_ti";
import { EyeOutlined } from "@ant-design/icons";
import { Button, Table, Tag, Tooltip } from "antd";
import Link from "next/link";

import dayjs from "dayjs";
import "dayjs/locale/es";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

dayjs.locale("es");
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(tz);
dayjs.tz.setDefault("America/Lima");

interface Props {
  ticket: Ticket[];
}

export default function TicketTable({ ticket }: Props) {
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
      render: (ticket: Ticket) => {
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
    // {
    //   title: "Estado",
    //   dataIndex: ["estado", "nombre"],
    //   key: "estado",
    //   render: (nombre?: string) => (
    //     // <Tag color={estadoColor(nombre)}>{nombre}</Tag>
    //     <Tag>{nombre}</Tag>
    //   ),
    // },
    // {
    //   title: "Responsable",
    //   dataIndex: ["asignado", "nombre"],
    //   key: "responsable",
    //   render: (_: unknown, record: Ticket) =>
    //     record.asignado
    //       ? `${record.asignado.nombre} ${record.asignado.apellidos ?? ""}`
    //       : "—",
    // },
    {
      title: "Creado",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a: Ticket, b: Ticket) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      render: (createdAt: string | Date) => {
        const d = dayjs(createdAt);
        return (
          <Tooltip title={`${d.format("DD/MM/YYYY HH:mm")} (Lima)`}>
            <span>{d.fromNow()}</span>
          </Tooltip>
        );
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

  return (
    <Table
      columns={columns}
      dataSource={ticket}
      pagination={{ pageSize: 5 }}
      rowKey="id"
      bordered
    />
  );
}
