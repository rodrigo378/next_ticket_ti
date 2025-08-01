"use client";

import { Card, Descriptions, Tag, Typography, List, Input, Button } from "antd";
import {
  PaperClipOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createMensaje, getTicket } from "@/services/ticket_ti";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { Ticket } from "@/interface/ticket_ti";
dayjs.extend(relativeTime);
dayjs.locale("es");

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const [ticketTi, setTicketTi] = useState<Ticket | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loadingMensaje, setLoadingMensaje] = useState(false);

  const fetchTicketTi = async (id: string) => {
    try {
      const data = await getTicket(Number(id));
      setTicketTi(data);
      console.log("data => ", data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;
    setLoadingMensaje(true);
    try {
      await createMensaje({
        ticket_id: Number(id),
        contenido: nuevoMensaje,
      });
      setNuevoMensaje("");
      const res = await getTicket(Number(id));
      setTicketTi(res);
    } catch (error) {
      console.log("error => ", error);
    } finally {
      setLoadingMensaje(false);
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith(".pdf"))
      return <FilePdfOutlined style={{ color: "red" }} />;
    if (filename.endsWith(".doc") || filename.endsWith(".docx"))
      return <FileWordOutlined style={{ color: "blue" }} />;
    if (filename.endsWith(".png") || filename.endsWith(".jpg"))
      return <FileImageOutlined style={{ color: "green" }} />;
    return <PaperClipOutlined />;
  };

  useEffect(() => {
    fetchTicketTi(id);
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4 bg-white rounded-xl shadow-sm">
      <Title level={3}>🎟️ Detalle del Ticket</Title>

      {/* Información general */}
      <Card className="mb-6">
        <Descriptions column={1} size="middle" bordered>
          <Descriptions.Item label="Codigo">
            {ticketTi?.codigo}
          </Descriptions.Item>
          <Descriptions.Item label="Area">
            {ticketTi?.incidencia.subarea.area.nombre}
          </Descriptions.Item>
          <Descriptions.Item label="Codigo">
            {ticketTi?.codigo}
          </Descriptions.Item>
          <Descriptions.Item label="Descripción">
            {ticketTi?.descripcion}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag
              color={
                ticketTi?.estado?.nombre === "Cerrado"
                  ? "green"
                  : ticketTi?.estado?.nombre === "En progreso"
                  ? "orange"
                  : "red"
              }
            >
              {ticketTi?.estado?.nombre}
            </Tag>
          </Descriptions.Item>
          {/* <Descriptions.Item label="Prioridad">
            <Tag color="red">{ticketTi?.prioridad?.nombre}</Tag>
          </Descriptions.Item> */}
          <Descriptions.Item label="Fecha de creación">
            {dayjs(ticketTi?.createdAt).fromNow()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Archivos Adjuntos */}
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
                  {getFileIcon(doc.nombre)}{" "}
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    {doc.nombre}
                  </a>
                </List.Item>
              );
            }}
          />
        ) : (
          <Text type="secondary">No hay archivos adjuntos</Text>
        )}
      </Card>

      {/* Mensajes */}
      <Card title="💬 Conversación">
        <div className="mb-4 max-h-96 overflow-y-auto pr-2">
          {ticketTi?.mensajes.map((mensaje) => (
            <div key={mensaje.id} className={`mb-4 p-3 rounded-lg max-w-sm `}>
              <div className="flex items-center gap-2 mb-1">
                <Text strong>{mensaje.emisor.nombre}</Text>
              </div>
              <div className="text-gray-500 text-xs">
                {dayjs(mensaje.createdAt).fromNow()}
              </div>
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
          <Button
            type="primary"
            className="mt-2"
            onClick={handleEnviarMensaje}
            loading={loadingMensaje}
          >
            Enviar
          </Button>
        </div>
      </Card>
    </div>
  );
}
