"use client";

import {
  Card,
  Typography,
  Tag,
  Descriptions,
  Button,
  Divider,
  Input,
  Form,
  Upload,
  message,
  List,
  Modal,
} from "antd";
import {
  UploadOutlined,
  PaperClipOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

const mensajes = [
  {
    autor: "usuario@uma.edu.pe",
    fecha: "2025-07-10 10:30",
    contenido: "No puedo acceder a mi correo institucional.",
  },
  {
    autor: "soporte@uma.edu.pe",
    fecha: "2025-07-10 11:00",
    contenido: "¿Ya intentaste cambiar la contraseña?",
  },
];

const archivos = [
  {
    nombre: "captura-error.png",
    url: "http://localhost:4000/uploads/tickets/1/captura-error.png",
  },
];

export default function Page() {
  const [respuesta, setRespuesta] = useState("");

  const enviarRespuesta = () => {
    if (!respuesta.trim()) {
      message.warning("Debes escribir una respuesta.");
      return;
    }
    message.success("✅ Respuesta enviada al usuario");
    setRespuesta("");
  };

  const cerrarTicket = () => {
    confirm({
      title: "¿Estás seguro de cerrar el ticket?",
      icon: <ExclamationCircleOutlined />,
      content: "Una vez cerrado, no podrás modificarlo.",
      okText: "Sí, cerrar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk() {
        message.success("✅ Ticket cerrado");
      },
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-10 px-4 bg-gray-50">
      <Card className="w-full max-w-4xl shadow-md rounded-xl border border-gray-200">
        <div className="mb-6">
          <Title level={3}>🎫 Detalle del Ticket</Title>
          <Text type="secondary">
            Información completa del ticket asignado al soporte
          </Text>
        </div>

        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Código">TCK-00123</Descriptions.Item>
          <Descriptions.Item label="Asunto">
            Problema con el acceso al correo
          </Descriptions.Item>
          <Descriptions.Item label="Prioridad">
            <Tag color="red">Alta</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color="processing">En Proceso</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de creación">
            2025-07-10
          </Descriptions.Item>
          <Descriptions.Item label="Solicitante">
            Juan Pérez ( juan@uma.edu.pe )
          </Descriptions.Item>
          <Descriptions.Item label="Descripción del problema">
            El usuario no puede acceder a su correo institucional desde el día
            de ayer.
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Title level={5}>📎 Archivos Adjuntos</Title>
        {archivos.length > 0 ? (
          <List
            dataSource={archivos}
            renderItem={(archivo) => (
              <List.Item>
                <a href={archivo.url} target="_blank" rel="noopener noreferrer">
                  <PaperClipOutlined /> {archivo.nombre}
                </a>
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">No hay archivos adjuntos.</Text>
        )}

        <Divider />

        <Title level={5}>💬 Conversación</Title>
        <List
          dataSource={mensajes}
          renderItem={(msg) => (
            <List.Item>
              <div>
                <Text strong>{msg.autor}</Text>
                <div className="text-gray-500 text-sm">{msg.fecha}</div>
                <div className="mt-1">{msg.contenido}</div>
              </div>
            </List.Item>
          )}
        />

        <Divider />

        <Title level={5}>Responder al Usuario</Title>
        <Form layout="vertical">
          <Form.Item label="Escribir respuesta">
            <TextArea
              rows={4}
              placeholder="Escribe tu mensaje de respuesta..."
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={enviarRespuesta}>
              Enviar Respuesta
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <Title level={5}>Adjuntar Archivo</Title>
        <Upload beforeUpload={() => false} multiple>
          <Button icon={<UploadOutlined />}>Seleccionar Archivos</Button>
        </Upload>

        <Divider />

        <Title level={5}>Acciones Rápidas</Title>
        <div className="flex flex-wrap gap-2">
          <Button type="default">Cambiar Estado</Button>
          <Button type="default">Reasignar</Button>
          <Button type="default">Marcar como Necesita info</Button>
          <Button type="primary" danger onClick={cerrarTicket}>
            Cerrar Ticket
          </Button>
        </div>
      </Card>
    </div>
  );
}
