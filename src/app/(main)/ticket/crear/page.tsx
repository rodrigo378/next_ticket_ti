"use client";

import { Form, Input, Select, Typography, Button } from "antd";
import { useState } from "react";

const { Title } = Typography;
const { TextArea } = Input;

export default function Page() {
  const [tipo, setTipo] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);

  const data = {
    incidencia: {
      Redes: ["Internet lento", "Corte de red", "No accede al WiFi"],
      "Correo institucional": ["No puedo ingresar", "Error al enviar correos"],
    },
    requerimiento: {
      Hardware: ["Solicitar mouse", "Agregar monitor", "Nueva PC"],
      Software: ["Instalar Office", "Activar antivirus"],
    },
  };

  const getAreas = () => {
    if (!tipo) return [];
    return Object.keys(data[tipo as "incidencia" | "requerimiento"]);
  };

  const getItems = () => {
    if (!tipo || !area) return [];
    return data[tipo as "incidencia" | "requerimiento"][area] || [];
  };

  const onFinish = (values: any) => {
    console.log("📥 Datos enviados:", values);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow border">
      <Title level={3} className="text-center mb-6">
        🎫 Crear Ticket
      </Title>

      <Form layout="vertical" onFinish={onFinish}>
        {/* Tipo */}
        <Form.Item
          label="Tipo de solicitud"
          name="tipo"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Selecciona tipo"
            onChange={(value) => {
              setTipo(value);
              setArea(null);
            }}
          >
            <Select.Option value="incidencia">Incidencia</Select.Option>
            <Select.Option value="requerimiento">Requerimiento</Select.Option>
          </Select>
        </Form.Item>

        {/* Área */}
        <Form.Item label="Área" name="area" rules={[{ required: true }]}>
          <Select
            placeholder="Selecciona área"
            onChange={(value) => setArea(value)}
            disabled={!tipo}
          >
            {getAreas().map((area) => (
              <Select.Option key={area} value={area}>
                {area}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Item */}
        <Form.Item label="Categoria" name="item" rules={[{ required: true }]}>
          <Select placeholder="Selecciona el problema" disabled={!area}>
            {getItems().map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item className="text-end">
          <Button type="primary" htmlType="submit">
            Crear Ticket
          </Button>
        </Form.Item>

        {/* Título */}
        <Form.Item label="Título" name="titulo" rules={[{ required: true }]}>
          <Input placeholder="Ej. Problema con impresora" />
        </Form.Item>

        {/* Descripción */}
        <Form.Item
          label="Descripción"
          name="descripcion"
          rules={[{ required: true }]}
        >
          <TextArea rows={3} placeholder="Describe el problema..." />
        </Form.Item>
      </Form>
    </div>
  );
}
