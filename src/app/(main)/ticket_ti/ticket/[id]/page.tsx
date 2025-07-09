"use client";

import {
  Card,
  Descriptions,
  Tag,
  Typography,
  List,
  Avatar,
  Upload,
  Button,
} from "antd";
import { PaperClipOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getTicketMe } from "@/services/ticket_ti";
import { useParams } from "next/navigation";
import { TicketTi } from "@/interface/ticket_ti";

const { Title, Text } = Typography;

// Simulando historial de mensajes
const mensajes = [
  {
    id: 1,
    autor: "usuario@uma.edu.pe",
    fecha: "2025-07-06 10:30",
    contenido: "Tengo problemas con el Wi-Fi desde ayer.",
  },
  {
    id: 2,
    autor: "soporte@uma.edu.pe",
    fecha: "2025-07-06 11:00",
    contenido:
      "¿Puedes confirmar si otros dispositivos también tienen el problema?",
  },
];

export default function Page() {
  const params = useParams();
  const id = params.id as string;

  const [ticketTi, setTicketTi] = useState<TicketTi | null>(null);

  const fetchTicketTi = async (id: string) => {
    try {
      const data = await getTicketMe(id);
      console.log("data => ", data);

      setTicketTi(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      await fetchTicketTi(id);
    };
    fetch();
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4 bg-white rounded-xl shadow-sm">
      <Title level={3}>🎟️ Detalle del Ticket</Title>

      {/* Información general */}
      <Card className="mb-6">
        <Descriptions column={1} size="middle" bordered>
          <Descriptions.Item label="Título">
            {ticketTi?.titulo}
          </Descriptions.Item>
          <Descriptions.Item label="Descripción">
            {ticketTi?.descripcion}
          </Descriptions.Item>

          <Descriptions.Item label="Estado">
            <Tag color="orange">{ticketTi?.estado_id}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Prioridad">
            <Tag color="red">{ticketTi?.prioridad_id}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de creación">
            {ticketTi?.createdAt
              ? new Date(ticketTi.createdAt).toLocaleDateString("es-PE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",

                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Sin fecha"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Adjuntos */}
      <Card title="📎 Archivos Adjuntos" className="mb-6">
        <Upload beforeUpload={() => false} multiple>
          <Button icon={<UploadOutlined />}>Subir archivo</Button>
        </Upload>
        <List
          className="mt-4"
          size="small"
          dataSource={["captura_wifi.png", "log_red.txt"]}
          renderItem={(item) => (
            <List.Item>
              <PaperClipOutlined className="mr-2" />
              <a href="#">{item}</a>
            </List.Item>
          )}
        />
      </Card>

      {/* Mensajes */}
      <Card title="💬 Conversación" className="mb-6">
        <List
          itemLayout="horizontal"
          dataSource={mensajes}
          renderItem={(msg) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{msg.autor.charAt(0).toUpperCase()}</Avatar>}
                title={
                  <span>
                    <strong>{msg.autor}</strong> —{" "}
                    <Text type="secondary">{msg.fecha}</Text>
                  </span>
                }
                description={msg.contenido}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
