"use client";

import {
  Table,
  Tag,
  Button,
  Typography,
  Space,
  message,
  Select,
  Tabs,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getTickets } from "@/services/ticket_ti";
import { useUsuario } from "@/context/UserContext";
import { getEstados } from "@/services/estado";
import { getPrioridades } from "@/services/prioridad";
import { Ticket } from "@/interface/ticket_ti";
import { EstadoTicket } from "@/interface/estado";
import { PrioridadTicket } from "@/interface/prioridad";

const { Title } = Typography;
const { Option } = Select;

export const transiciones: Record<number, number[]> = {
  1: [2],
  2: [3],
  3: [4, 5],
  4: [3, 5],
  5: [6],
  7: [3],
};

const items = [
  { key: "mis_tickets", label: "🎧 Asignados a mí" },
  { key: "grupo", label: "👥 Del grupo" },
  { key: "finalizados", label: "✅ Finalizados" },
];

export default function Page() {
  const [ticketsTi, setTicketsTi] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState<EstadoTicket[]>([]);
  const [prioridades, setPrioridades] = useState<PrioridadTicket[]>([]);
  const { usuario } = useUsuario();
  const [tabKey, setTabKey] = useState("mis_tickets");
  const [filtros, setFiltros] = useState<{
    estado_id?: number;
    prioridad_id?: number;
  }>({});

  const fetchTickets = async (me?: string, estados_id?: string[]) => {
    try {
      setLoading(true);
      const data = await getTickets({ me, estados_id });
      setTicketsTi(data);
    } catch (error) {
      console.error("error => ", error);
      message.error("Error al cargar los tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchEstados = async () => {
    try {
      const data = await getEstados();
      setEstados(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const fetchPrioridades = async () => {
    try {
      const data = await getPrioridades();
      setPrioridades(data);
    } catch (error) {
      console.error("Error al cargar prioridades", error);
    }
  };

  const onChange = (key: string) => {
    setTabKey(key);
    if (key === "mis_tickets") fetchTickets("true");
    else if (key === "grupo") fetchTickets(undefined, ["1", "2", "3", "7"]);
    else if (key === "finalizados") fetchTickets(undefined, ["5"]);
  };

  useEffect(() => {
    fetchEstados();
    fetchPrioridades();
    fetchTickets("true", ["1", "2", "3", "7"]);
  }, []);

  const ticketsFiltrados = ticketsTi.filter((ticket) => {
    const coincideEstado =
      !filtros.estado_id || ticket.estado?.id === filtros.estado_id;
    const coincidePrioridad =
      !filtros.prioridad_id || ticket.prioridad?.id === filtros.prioridad_id;
    return coincideEstado && coincidePrioridad;
  });

  const columns = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
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
      title: "Clasificación",
      key: "clasificacion",
      render: (record: Ticket) => {
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
      render: (record: Ticket) => {
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
      render: (record: Ticket) => (
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
      render: (record: Ticket) => (
        <Link href={`/ticket/soporte/${record.id}`}>
          <Button type="link" icon={<EyeOutlined />} className="text-blue-600">
            Ver
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white min-h-screen">
      <Title level={3}>🎧 Tickets Asignados a Soporte</Title>

      <Tabs
        activeKey={tabKey}
        onChange={onChange}
        items={items}
        className="mb-4"
      />

      <Space className="mb-4">
        <Select
          allowClear
          placeholder="Filtrar por estado"
          style={{ width: 200 }}
          value={filtros.estado_id ?? undefined}
          onChange={(value) =>
            setFiltros((prev) => ({ ...prev, estado_id: value ?? undefined }))
          }
        >
          {estados.map((estado) => (
            <Option key={estado.id} value={estado.id}>
              {estado.nombre}
            </Option>
          ))}
        </Select>

        <Select
          allowClear
          placeholder="Filtrar por prioridad"
          style={{ width: 200 }}
          value={filtros.prioridad_id ?? undefined}
          onChange={(value) =>
            setFiltros((prev) => ({
              ...prev,
              prioridad_id: value ?? undefined,
            }))
          }
        >
          {prioridades.map((prioridad) => (
            <Option key={prioridad.id} value={prioridad.id}>
              {prioridad.nombre}
            </Option>
          ))}
        </Select>
      </Space>

      <div className="bg-white rounded-lg shadow p-4">
        <Table
          columns={columns}
          dataSource={ticketsFiltrados}
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
    </div>
  );
}
