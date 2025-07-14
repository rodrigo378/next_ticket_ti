"use client";

import { Categoria, Incidencia } from "@/interface/incidencia";
import { getIncidencias } from "@/services/incidencias";
import { Form, Input, Select, Typography, Button } from "antd";
import { useEffect, useState } from "react";

const { Title } = Typography;
const { TextArea } = Input;

export default function Page() {
  const [tipo, setTipo] = useState<string | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const fetchIncidencias = async (tipoSeleccionado: string) => {
    try {
      const data = await getIncidencias(tipoSeleccionado);
      setIncidencias(data);
    } catch (error) {
      console.error("Error al obtener incidencias:", error);
    }
  };

  const handleTipoChange = (value: string) => {
    setTipo(value);
    fetchIncidencias(value);
  };

  const handleIncidenciaChange = (id: number) => {
    const incidencia = incidencias.find((i) => i.id === id);
    setCategorias(incidencia?.categorias || []);
  };

  useEffect(() => {}, []);

  const onFinish = (values: unknown) => {
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
          rules={[
            { required: true, message: "Selecciona el tipo de solicitud" },
          ]}
        >
          <Select placeholder="Selecciona tipo" onChange={handleTipoChange}>
            <Select.Option value="incidencia">Incidencia</Select.Option>
            <Select.Option value="requerimiento">Requerimiento</Select.Option>
          </Select>
        </Form.Item>

        {/* Incidencia */}
        <Form.Item
          label="Problema"
          name="incidencia_id"
          rules={[{ required: true, message: "Selecciona un problema" }]}
        >
          <Select
            placeholder="Selecciona una incidencia"
            disabled={!tipo}
            onChange={handleIncidenciaChange}
          >
            {incidencias.map((incidencia) => (
              <Select.Option key={incidencia.id} value={incidencia.id}>
                {incidencia.nombre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Categoría */}
        <Form.Item
          label="Categoría"
          name="categoria_id"
          rules={[{ required: true, message: "Selecciona una categoría" }]}
        >
          <Select
            placeholder="Selecciona una categoría"
            disabled={categorias.length === 0}
          >
            {categorias.map((categoria) => (
              <Select.Option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Título */}
        <Form.Item
          label="Título"
          name="titulo"
          rules={[{ required: true, message: "Ingresa un título" }]}
        >
          <Input placeholder="Ej. Problema con impresora" />
        </Form.Item>

        {/* Descripción */}
        <Form.Item
          label="Descripción"
          name="descripcion"
          rules={[{ required: true, message: "Describe el problema" }]}
        >
          <TextArea rows={3} placeholder="Describe el problema..." />
        </Form.Item>

        <Form.Item className="text-end">
          <Button type="primary" htmlType="submit">
            Crear Ticket
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
