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
} from "antd";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Page() {
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
            Juan Pérez (juan@uma.edu.pe)
          </Descriptions.Item>
          <Descriptions.Item label="Descripción del problema">
            El usuario no puede acceder a su correo institucional desde el día
            de ayer.
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Title level={5}>Responder al Usuario</Title>
        <Form layout="vertical">
          <Form.Item label="Escribir respuesta">
            <TextArea
              rows={4}
              placeholder="Escribe tu mensaje de respuesta..."
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary">Enviar Respuesta</Button>
          </Form.Item>
        </Form>

        <Divider />

        <Title level={5}>Acciones Rápidas</Title>
        <div className="flex flex-wrap gap-2">
          <Button type="default">Cambiar Estado</Button>
          <Button type="default">Reasignar</Button>
          <Button type="default">Adjuntar Archivo</Button>
          <Button type="primary" danger>
            Cerrar Ticket
          </Button>
        </div>
      </Card>
    </div>
  );
}
