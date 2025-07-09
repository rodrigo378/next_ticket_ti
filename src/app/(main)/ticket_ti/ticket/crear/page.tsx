"use client";

import { IncidenciaArea } from "@/interface/incidencia";
import { Prioridad } from "@/interface/prioridad";
import { getIncidencias } from "@/services/incidencias";
import { getPrioridad } from "@/services/prioridad";
import { createTicketTi } from "@/services/ticket_ti";
import { Form, Input, Select, Typography, Button } from "antd";
import { useEffect, useState } from "react";
import { message } from "antd";
import { useRouter } from "next/navigation";
const { Title } = Typography;
const { TextArea } = Input;

export default function Page() {
  const [incidencias, setIncidencias] = useState<IncidenciaArea[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);

  const router = useRouter(); // Inicializa el router

  const fetchIncidencias = async () => {
    try {
      const data = await getIncidencias();
      setIncidencias(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const fetchPrioridades = async () => {
    try {
      const data = await getPrioridad();
      setPrioridades(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      await fetchPrioridades();
      await fetchIncidencias();
    };
    fetch();
  }, []);

  const onFinish = async (values: {
    titulo: string;
    descripcion: string;
    prioridad_id: number;
    incidencia_id: number;
  }) => {
    console.log("click finish => ", values);
    const response = await createTicketTi(values);
    console.log("response => ", response);

    message.success("✅ Ticket creado correctamente");

    setTimeout(() => {
      router.push("/ticket_ti/ticket"); // <-- cambia esta ruta según necesites
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-md border border-gray-100">
      <Title level={3} className="text-center mb-8">
        🎫 Crear Nuevo Ticket
      </Title>

      <Form layout="vertical" onFinish={onFinish}>
        {/* Título */}
        <Form.Item label="Título del ticket" name="titulo">
          <Input placeholder="Ej. Problema con la conexión Wi-Fi" />
        </Form.Item>

        {/* Descripción */}
        <Form.Item label="Descripción detallada" name="descripcion">
          <TextArea
            rows={4}
            placeholder="Describe el problema con claridad y detalle..."
          />
        </Form.Item>

        {/* Prioridad */}
        <Form.Item label="Prioridad" name="prioridad_id">
          <Select placeholder="Selecciona una prioridad">
            {prioridades.map((prioridad) => (
              <Select.Option key={prioridad.id} value={prioridad.id}>
                {prioridad.nombre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Incidencia */}
        <Form.Item label="Categoría de Incidencia" name="incidencia_id">
          <Select placeholder="Selecciona una categoría">
            {incidencias.map((area) => (
              <Select.Option key={area.id} value={area.id}>
                {area.nombre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Adjuntos */}
        {/* <Form.Item label="Adjuntar archivos (opcional)" name="documentos">
          <Upload multiple beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>Seleccionar Archivos</Button>
          </Upload>
        </Form.Item> */}

        {/* Botón */}
        <Form.Item className="text-end">
          <Button type="primary" htmlType="submit">
            Crear Ticket
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
