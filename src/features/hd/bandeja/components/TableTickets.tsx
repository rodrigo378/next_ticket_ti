"use client";
import { HD_Ticket } from "@interfaces/hd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  EyeOutlined,
  ExclamationCircleFilled,
  PushpinOutlined,
} from "@ant-design/icons";
import { Button, Space, Table, Tag, Tooltip, theme } from "antd";
import Link from "next/link";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  usuario: any;
  tickets: HD_Ticket[];
  loading: boolean;
}

export default function TableTickets({ usuario, tickets, loading }: Props) {
  const { token } = theme.useToken();

  const prioridadColor: Record<string, string> = {
    Alta: token.colorError,
    Media: token.colorWarning,
    Baja: token.colorSuccess,
  };
  const prioridadBg: Record<string, string> = {
    Alta: token.colorErrorBg,
    Media: token.colorWarningBg,
    Baja: token.colorSuccessBg,
  };

  const iconStyle = { fontSize: 16, lineHeight: 1 };

  const columns = [
    { title: "Código", dataIndex: "codigo", key: "codigo" },
    {
      title: "Tipo",
      key: "tipo",
      render: (record: HD_Ticket) => {
        const tipo = record.categoria?.incidencia?.tipo;
        const isReq = tipo === "requerimiento";
        const Icono = isReq ? PushpinOutlined : ExclamationCircleFilled;
        const color = isReq ? token.colorTextSecondary : token.colorWarning;
        return (
          <span style={{ color: token.colorText }}>
            <Icono style={{ ...iconStyle, color, marginRight: 6 }} />
            {tipo}
          </span>
        );
      },
    },
    {
      title: "Clasificación",
      key: "clasificacion",
      render: (record: HD_Ticket) => (
        <span style={{ color: token.colorTextSecondary }}>
          {record.categoria?.incidencia?.nombre} /{" "}
          <b style={{ color: token.colorText }}>{record.categoria?.nombre}</b>
        </span>
      ),
    },
    {
      title: "Creado por",
      key: "creado_id",
      render: (record: HD_Ticket) => (
        <div className="flex flex-col !items-start">
          <span>{`${record.creado?.nombre || ""} ${
            record.creado?.apellidos || ""
          }`}</span>
          <Tag color={record.creado?.rol_id === 3 ? "blue" : "green"}>
            {record.creado?.rol_id === 3 ? `Alumno` : `Administrativo`}
          </Tag>
        </div>
      ),
    },
    {
      title: "Prioridad",
      dataIndex: ["prioridad", "nombre"],
      key: "prioridad",
      render: (prioridad: string) => {
        const color = prioridadColor[prioridad] ?? token.colorText;
        const bg = prioridadBg[prioridad] ?? token.colorFillTertiary;
        return (
          <Tag style={{ color, background: bg, borderColor: color }}>
            {prioridad ?? "—"}
          </Tag>
        );
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
              <CheckCircleFilled
                style={{ ...iconStyle, color: token.colorSuccess }}
                aria-label="Asignado a mí"
              />
            ) : (
              <CloseCircleFilled
                style={{ ...iconStyle, color: token.colorError }} // 👈 rojo sólido, legible en dark
                aria-label="No asignado a mí"
              />
            )}
            <Tag
              style={{
                color: token.colorInfoText,
                background: token.colorInfoBg,
                borderColor: token.colorInfo,
              }}
            >
              {record.estado?.nombre || "Sin estado"}
            </Tag>
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
              color: token.colorText,
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
              style={{ color: token.colorLink }}
            >
              Ver
            </Button>
          </Link>
        ) : (
          <Tooltip title="Solo el técnico asignado puede ver este ticket">
            <Button type="link" icon={<EyeOutlined />} disabled>
              Ver
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div className="rounded-lg shadow p-4">
      <Table
        columns={columns}
        dataSource={tickets}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1000 }}
        onRow={(record) => {
          const p = record.prioridad?.nombre;
          let bg: string | undefined;
          if (p === "Alta") bg = token.colorErrorBg;
          else if (p === "Media") bg = token.colorWarningBg;
          else if (p === "Baja") bg = token.colorSuccessBg;
          return bg ? { style: { background: bg } } : {};
        }}
      />
    </div>
  );
}
