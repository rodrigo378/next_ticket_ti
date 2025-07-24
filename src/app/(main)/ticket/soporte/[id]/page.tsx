"use client";

import {
  Card,
  Descriptions,
  Tag,
  Typography,
  List,
  Input,
  Button,
  Select,
} from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TicketTi } from "@/interface/ticket_ti";
import { createMensaje, getTicket, updateTicket } from "@/services/ticket_ti";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { Area } from "@/interface/area";
import { getAreas } from "@/services/area";
import { Estado } from "@/interface/estado";
import { getEstados } from "@/services/estado";

dayjs.extend(relativeTime);
dayjs.locale("es");

const transiciones: Record<number, number[]> = {
  1: [2], // Abierto → Asignado
  2: [3], // Asignado → En Proceso
  3: [4, 5], // En Proceso → Pendiente Usuario o Resuelto
  4: [3, 5], // Pendiente Usuario → En Proceso o Resuelto
  5: [6], // Resuelto → Cerrado
  7: [3], // Reabierto → En Proceso
};

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const [ticketTi, setTicketTi] = useState<TicketTi | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);

  const fetchTicketTi = async (id: string) => {
    try {
      const data = await getTicket(Number(id));
      setTicketTi(data);
      console.log("ticket => ", data);
    } catch (error) {
      console.error("Error al obtener ticket:", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const data = await getAreas();
      setAreas(data);
    } catch (error) {
      console.error("Error al obtener áreas:", error);
    }
  };

  const fechEstados = async () => {
    try {
      const data = await getEstados();
      setEstados(data);
      console.log("data => ", data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const handleEnviarMensaje = async () => {
    try {
      await createMensaje({
        ticket_id: Number(id),
        contenido: nuevoMensaje,
      });
      const res = await getTicket(Number(id));
      setTicketTi(res);
      setNuevoMensaje("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  const cambiarEstado = async (values: number) => {
    console.log("aca value => ", values);
    console.log("id => ", id);

    try {
      const response = await updateTicket(Number(id), {
        estado_id: Number(values),
      });
      fetchTicketTi(id);
      console.log("response => ", response);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  useEffect(() => {
    fetchAreas();
    fechEstados();
    fetchTicketTi(id);
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4 bg-white rounded-xl shadow-sm">
      {/* Opciones rápidas */}
      <div className="sticky- top-0 z-10 bg-white border border-gray-200 rounded-md p-4 mb-6 shadow-sm">
        <Title level={4}>⚙️ Opciones Rápidas</Title>
        <div className="flex flex-wrap items-center gap-6">
          {/* Cambiar estado */}
          <div className="flex flex-col">
            <Text strong>Estado</Text>

            {ticketTi && (
              <Select
                className="min-w-[180px]"
                value={ticketTi.estado_id}
                onChange={cambiarEstado}
              >
                {estados
                  .filter(
                    (estado) =>
                      estado.id === ticketTi.estado_id || // mantener el actual
                      transiciones[ticketTi.estado_id!]?.includes(estado.id)
                  )
                  .map((estado) => (
                    <Option key={estado.id} value={estado.id}>
                      {estado.nombre}
                    </Option>
                  ))}
              </Select>
            )}
          </div>

          {/* Derivar a área */}
          <div className="flex flex-col">
            <Text strong>Derivar a área</Text>
            <Select
              placeholder="Seleccionar área"
              className="min-w-[220px]"
              onChange={(value) => {
                console.log("Área seleccionada:", value);
                // Aquí lógica para derivar el ticket
              }}
            >
              {areas.map((area) => (
                <Option key={area.id.toString()} value={area.id.toString()}>
                  {area.nombre}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Detalle del ticket */}
      <Title level={3}>🎟️ Detalle del Ticket</Title>
      <Card className="mb-6">
        <Descriptions column={1} size="middle" bordered>
          <Descriptions.Item label="Título">
            {ticketTi?.titulo}
          </Descriptions.Item>
          <Descriptions.Item label="Descripción">
            {ticketTi?.descripcion}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color="orange">{ticketTi?.estado.nombre}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Prioridad">
            <Tag color="red">{ticketTi?.prioridad?.nombre}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de creación">
            {dayjs(ticketTi?.createdAt).fromNow()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Archivos adjuntos */}
      <Card title="📎 Archivos Adjuntos" className="mb-6">
        {ticketTi?.documentos?.length ? (
          <List
            dataSource={ticketTi.documentos}
            renderItem={(doc) => {
              const fileUrl = `http://localhost:4000${doc.url.replace(
                /\\/g,
                "/"
              )}`;
              return (
                <List.Item>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <PaperClipOutlined /> {doc.nombre}
                  </a>
                </List.Item>
              );
            }}
          />
        ) : (
          <Text type="secondary">No hay archivos adjuntos</Text>
        )}
      </Card>

      {/* Conversación */}
      <Card title="💬 Conversación">
        <div className="mb-4 max-h-96 overflow-y-auto pr-2">
          {ticketTi?.mensajes.map((mensaje) => (
            <div key={mensaje.id} className="mb-4">
              <Text strong>{mensaje.emisor.nombre}</Text>
              <div className="text-gray-500 text-sm">
                {dayjs(ticketTi.createdAt).fromNow()}
              </div>
              {/* {dayjs(ticketTi?.createdAt).fromNow()} */}
              <div className="mt-1">{mensaje.contenido}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <TextArea
            rows={3}
            placeholder="Escribe un mensaje..."
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
          />
          <Button type="primary" className="mt-2" onClick={handleEnviarMensaje}>
            Enviar
          </Button>
        </div>
      </Card>
    </div>
  );
}
