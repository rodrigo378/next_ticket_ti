"use client";

import { Categoria, Incidencia } from "@/interface/incidencia";
import { TicketTi } from "@/interface/ticket_ti";
import { getIncidencias } from "@/services/incidencias";
import { createTicketTi } from "@/services/ticket_ti";
import {
  Form,
  Input,
  Select,
  Typography,
  Button,
  Upload,
  message,
  Row,
  Col,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";

const { Title } = Typography;
const { TextArea } = Input;

export default function Page() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [tipo, setTipo] = useState<string | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fileList, setFileList] = useState<unknown[]>([]);

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
    setIncidencias([]);
    setCategorias([]);
    form.setFieldsValue({
      incidencia_id: undefined,
      categoria_id: undefined,
    });
    fetchIncidencias(value);
  };

  const handleIncidenciaChange = (id: number) => {
    const incidencia = incidencias.find((i) => i.id === id);
    const nuevasCategorias = incidencia?.categorias || [];
    setCategorias(nuevasCategorias);
    form.setFieldsValue({
      categoria_id: undefined,
    });
  };

  const onFinish = async (values: Partial<TicketTi>) => {
    try {
      console.log("📥 Datos enviados:", values);
      // Aquí puedes enviar `fileList` como FormData si deseas subir los archivos
      const response = await createTicketTi(values);
      console.log("response => ", response);
      message.success("Ticket creado exitosamente");
      router.push("/ticket");
    } catch (error) {
      console.log("error => ", error);
      message.error("Error al crear el ticket");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow border">
      <Title level={3} className="text-center mb-6">
        📝 Crear nuevo ticket
      </Title>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tipo de solicitud"
              name="tipo"
              rules={[{ required: true, message: "Selecciona el tipo" }]}
            >
              <Select placeholder="Selecciona tipo" onChange={handleTipoChange}>
                <Select.Option value="incidencia">Incidencia</Select.Option>
                <Select.Option value="requerimiento">
                  Requerimiento
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
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
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
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
          </Col>

          <Col span={12}>
            <Form.Item
              label="Título"
              name="titulo"
              rules={[{ required: true, message: "Ingresa un título" }]}
            >
              <Input placeholder="Ej. Problema con impresora" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Descripción detallada"
          name="descripcion"
          rules={[{ required: true, message: "Describe el problema" }]}
        >
          <TextArea
            rows={4}
            placeholder="Describe con detalle el problema o requerimiento..."
          />
        </Form.Item>

        {/* Subir Archivos */}
        <Form.Item label="Adjuntar archivos (opcional)">
          <Upload
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            maxCount={5}
          >
            <Button icon={<UploadOutlined />}>Seleccionar archivos</Button>
          </Upload>
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
