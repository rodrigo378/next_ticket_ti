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
  1: [2], // Abierto → Asignado
  2: [3], // Asignado → En Proceso
  3: [4, 5], // En Proceso → Pendiente Usuario o Resuelto
  4: [3, 5], // Pendiente Usuario → En Proceso o Resuelto
  5: [6], // Resuelto → Cerrado
  7: [3], // Reabierto → En Proceso
};
const items = [
  {
    key: "mis_tickets",
    label: "🎧 Asignados a mí",
  },
  {
    key: "grupo",
    label: "👥 Del grupo",
  },
  {
    key: "finalizados",
    label: "✅ Finalizados",
  },
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
      const filtros = { me, estados_id };

      setLoading(true);
      const data = await getTickets(filtros);
      console.log("data => ", data);

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

  const handleEstadoChange = async (ticketId: number, estadoId: number) => {
    try {
      console.log(ticketId, estadoId);
      // await updateEstadoTicket(ticketId, estadoId);
      message.success("Estado actualizado correctamente");
      fetchTickets();
    } catch (error) {
      console.error("error => ", error);
      message.error("Error al actualizar estado");
    }
  };

  const onChange = (key: string) => {
    console.log(key);
    setTabKey(key);

    switch (key) {
      case "mis_tickets":
        fetchTickets("true");
        break;
      case "grupo":
        fetchTickets(undefined, ["1", "2", "3", "7"]);
        break;
      case "finalizados":
        fetchTickets(undefined, ["5"]);
        break;
    }
  };

  useEffect(() => {
    fetchEstados();
    fetchPrioridades();
    fetchTickets("true", ["1", "2", "3", "7"]);
    // const intervalo = setInterval(() => {
    //   setTiempoActual(Date.now());
    // }, 1000);
    // return () => clearInterval(intervalo);
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
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Asunto",
      dataIndex: "titulo",
      key: "titulo",
    },
    {
      title: "Incidencia",
      dataIndex: ["incidencia", "nombre"],
      key: "incidencia",
      render: (nombre: string) => <Tag color="blue">{nombre}</Tag>,
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
      title: "Estado",
      key: "estado",
      render: (record: Ticket) => {
        const estadoActualId = record.estado?.id;
        const transicionesValidas = transiciones[estadoActualId!] || [];

        const opcionesFiltradas = estados.filter(
          (estado) =>
            estado.id === estadoActualId ||
            transicionesValidas.includes(estado.id)
        );

        return (
          <Select
            value={estadoActualId}
            onChange={(value) => handleEstadoChange(record.id!, value)}
            style={{ width: 150 }}
            disabled={opcionesFiltradas.length <= 1} // desactiva si no hay transiciones posibles
          >
            {opcionesFiltradas.map((estado) => (
              <Option key={estado.id} value={estado.id}>
                {estado.nombre}
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "Asignado a mí",
      key: "asignado_a_mi",
      render: (record: Ticket) =>
        record.asignado_id === usuario?.id ? (
          <CheckCircleTwoTone twoToneColor="#52c41a" />
        ) : (
          <CloseCircleTwoTone twoToneColor="#ff4d4f" />
        ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (record: Ticket) => (
        <Space>
          <Link href={`/ticket/soporte/${record.id}`}>
            <Button
              type="link"
              icon={<EyeOutlined />}
              className="text-blue-600"
            >
              Ver
            </Button>
          </Link>
        </Space>
      ),
    },
    // {
    //   title: "SLA",
    //   key: "sla",
    //   render: (record: TicketTi) => {
    //     const sla = record.slaTicket;

    //     if (!sla) {
    //       return <Tag color="default">No definido</Tag>;
    //     }

    //     const ahora = tiempoActual;
    //     const limite = new Date(sla.tiempo_estimado_respuesta).getTime();
    //     const tiempoRestante = limite - ahora;

    //     const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
    //     const minutos = Math.floor(
    //       (tiempoRestante % (1000 * 60 * 60)) / (1000 * 60)
    //     );
    //     const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);

    //     let color = "green";
    //     if (tiempoRestante <= 0) {
    //       color = "red";
    //     } else if (tiempoRestante <= 2 * 60 * 60 * 1000) {
    //       color = "orange";
    //     }

    //     return (
    //       <Tag color={color}>
    //         {tiempoRestante <= 0
    //           ? "Vencido"
    //           : `Restan ${horas}h ${minutos}min ${segundos}s`}
    //       </Tag>
    //     );
    //   },
    // },
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
        />
      </div>
    </div>
  );
}
