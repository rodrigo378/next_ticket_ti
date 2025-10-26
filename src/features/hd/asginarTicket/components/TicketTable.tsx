// TicketTable.tsx

import { Button, Table, Tag, Tooltip } from "antd";
import { BranchesOutlined, EyeOutlined } from "@ant-design/icons";
import { HD_Ticket, HD_PrioridadTicket } from "@interfaces/hd";
import { Core_Usuario } from "@interfaces/core";
import dayjs from "@shared/date/dayjs";

interface Props {
  tickets: HD_Ticket[];
  loading: boolean;
  abrirDrawer: (ticket: HD_Ticket) => void;
}

export default function TicketTableAdmin({
  tickets,
  loading,
  abrirDrawer,
}: Props) {
  const columns = [
    { title: "Codigo", dataIndex: "codigo", key: "codigo" },
    { title: "Área", dataIndex: ["area", "nombre"], key: "area" },
    {
      title: "Tipo",
      key: "tipo",
      render: (record: HD_Ticket) => {
        const tipo = record.categoria?.incidencia?.tipo;
        const icon =
          tipo === "requerimiento" ? "📌" : tipo === "incidencia" ? "⚠️" : "X";
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
      render: (prioridad: HD_PrioridadTicket) => {
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
      title: "Derivado",
      dataIndex: "boolDerivado",
      key: "boolDerivado",
      render: (boolDerivado: boolean) => (
        <Tooltip
          title={
            boolDerivado
              ? "Este ticket participa en una cadena de derivación"
              : "Sin derivación"
          }
        >
          <Tag
            color={boolDerivado ? "processing" : "default"}
            icon={boolDerivado ? <BranchesOutlined /> : undefined}
            style={{ borderRadius: 999 }}
          >
            {boolDerivado ? "Derivado" : "No"}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Creación",
      key: "creacion",
      dataIndex: "createdAt",
      render: (createdAt: string | Date) => {
        const d = dayjs(createdAt);
        // {d.fromNow()}
        return (
          <Tooltip
            className="flex flex-col"
            title={`${d.format("dddd, DD/MM/YYYY HH:mm")} (Lima)`}
          >
            <span>{d.format("DD/MM/YYYY HH:mm")}</span>
            <span>{d.fromNow()}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Creado por",
      key: "titular_id",
      render: (record: HD_Ticket) => (
        <div className="flex flex-col !items-start">
          <span>{`${record.titular?.nombre || ""} ${
            record.titular?.apellidos || ""
          }`}</span>
          <Tag color={record.titular?.rol_id === 3 ? "blue" : "green"}>
            {record.titular?.rol_id === 3 ? `Alumno` : `Administrativo`}
          </Tag>
        </div>
      ),
    },
    {
      title: "Asignado a",
      dataIndex: "asignado",
      key: "asignado",
      render: (asignado: Core_Usuario | null) =>
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
      render: (record: HD_Ticket) => (
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
    <div style={{ width: "100%", overflowX: "auto" }}>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={tickets}
        loading={loading}
        pagination={{ pageSize: 10, responsive: true }}
        scroll={{ x: "max-content" }}
        // opcional: size="small"
      />
    </div>
  );
}
