"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Button,
  Drawer,
  Tag,
  Form,
  InputNumber,
  message,
  Input,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import { getSla, updateSla } from "@/features/hd/service/sla";
import { HD_SLA } from "@/interface/hd/hd_sla";

const { Title, Paragraph } = Typography;

export default function Page() {
  const [slas, setSlas] = useState<HD_SLA[]>([]);
  const [filtro, setFiltro] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [form] = Form.useForm();
  const [slaSeleccionado, setSlaSeleccionado] = useState<HD_SLA | null>(null);

  const fetchSlas = async () => {
    try {
      const data = await getSla();
      console.log("data => ", data);

      setSlas(data);
    } catch (error) {
      console.error(error);
      message.error("Error al obtener SLA");
    }
  };

  useEffect(() => {
    fetchSlas();
  }, []);

  const convertirMinutos = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const min = minutos % 60;
    return `${horas}h ${min}m`;
  };

  const abrirDrawerEditar = (sla: HD_SLA) => {
    setSlaSeleccionado(sla);
    form.setFieldsValue({
      tiempo_respuesta: sla.tiempo_respuesta,
      tiempo_resolucion: sla.tiempo_resolucion,
    });
    setOpenDrawer(true);
  };

  const guardarEdicion = async (values: object) => {
    if (!slaSeleccionado) return;
    try {
      await updateSla(Number(slaSeleccionado.id), values);
      message.success("SLA actualizado correctamente");
      setOpenDrawer(false);
      setSlaSeleccionado(null);
      form.resetFields();
      fetchSlas();
    } catch (error) {
      console.error(error);
      message.error("Error al actualizar SLA");
    }
  };

  const columnas: ColumnsType<HD_SLA> = [
    {
      title: "Categoria",
      dataIndex: ["categoria", "nombre"],
      key: "categoria",
    },
    {
      title: "Prioridad",
      dataIndex: ["prioridad", "nombre"],
      key: "prioridad",
      render: (nombre) => {
        const color =
          nombre === "Alta" ? "red" : nombre === "Media" ? "orange" : "green";
        return <Tag color={color}>{nombre}</Tag>;
      },
    },
    {
      title: "Tiempo de Respuesta",
      dataIndex: "tiempo_respuesta",
      key: "respuesta",
      render: convertirMinutos,
    },
    {
      title: "Tiempo de Resolución",
      dataIndex: "tiempo_resolucion",
      key: "resolucion",
      render: convertirMinutos,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => abrirDrawerEditar(record)}
        >
          Editar
        </Button>
      ),
    },
  ];

  const slasFiltradas = slas.filter((sla) =>
    sla.categoria?.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4}>Configuración SLA</Title>
          <Paragraph type="secondary">
            Visualiza y actualiza los tiempos por prioridad
          </Paragraph>
        </div>
        <Input
          placeholder="Buscar incidencia..."
          prefix={<SearchOutlined />}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-64"
        />
      </div>

      <Table
        rowKey="id"
        columns={columnas}
        dataSource={slasFiltradas}
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Drawer
        title={`Editar SLA - ${slaSeleccionado?.categoria?.nombre} (${slaSeleccionado?.prioridad?.nombre})`}
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false);
          setSlaSeleccionado(null);
          form.resetFields();
        }}
        width={400}
      >
        <Form layout="vertical" form={form} onFinish={guardarEdicion}>
          <Form.Item
            name="tiempo_respuesta"
            label="Tiempo de Respuesta (min)"
            rules={[
              { required: true, message: "Ingrese el tiempo de respuesta" },
            ]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            name="tiempo_resolucion"
            label="Tiempo de Resolución (min)"
            rules={[
              { required: true, message: "Ingrese el tiempo de resolución" },
            ]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <div className="flex justify-end">
            <Button htmlType="submit" type="primary">
              Guardar cambios
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
