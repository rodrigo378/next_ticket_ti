import { HD_Ticket } from "@/interface/hd/hd_ticket";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Space, Table, Tag, Tooltip } from "antd";
import Link from "next/link";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  usuario: any;
  tickets: HD_Ticket[];
  loading: boolean;
}

export default function TableTickets({ usuario, tickets, loading }: Props) {
  const columns = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
    },
    {
      title: "Tipo",
      key: "tipo",
      render: (record: HD_Ticket) => {
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
      title: "Clasificación",
      key: "clasificacion",
      render: (record: HD_Ticket) => {
        return (
          <span>
            {record.categoria?.incidencia?.nombre} /{" "}
            <b>{record.categoria?.nombre}</b>
          </span>
        );
      },
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
      title: "Estado / Asignado",
      key: "estado",
      render: (record: HD_Ticket) => {
        const asignado = record.asignado_id === usuario?.id;
        return (
          <Space>
            {asignado ? (
              <CheckCircleTwoTone twoToneColor="#52c41a" />
            ) : (
              <CloseCircleTwoTone twoToneColor="#ff4d4f" />
            )}
            <Tag color="blue">{record.estado?.nombre || "Sin estado"}</Tag>
          </Space>
        );
      },
    },
    {
      title: "Asunto",
      key: "asunto",
      render: (record: HD_Ticket) => (
        <Tooltip title={record.descripcion}>
          <span
            style={{
              maxWidth: 200,
              display: "inline-block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.descripcion}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (record: HD_Ticket) => {
        const estaAsignado = record.asignado_id === usuario?.id;

        return estaAsignado ? (
          <Link href={`/hd/bandeja/${record.id}`}>
            <Button
              type="link"
              icon={<EyeOutlined />}
              className="text-blue-600"
            >
              Ver
            </Button>
          </Link>
        ) : (
          <Tooltip title="Solo el técnico asignado puede ver este ticket">
            <Button
              type="link"
              icon={<EyeOutlined />}
              className="text-gray-400"
              disabled
            >
              Ver
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <Table
        columns={columns}
        dataSource={tickets}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1000 }}
        rowClassName={(record) => {
          const prioridad = record.prioridad?.nombre;
          if (prioridad === "Alta") return "bg-red-100 text-black";
          if (prioridad === "Media") return "bg-yellow-100 text-black";
          return "";
        }}
      />
    </div>
  );
}
