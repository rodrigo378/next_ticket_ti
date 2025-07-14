"use client";

import { useEffect, useState } from "react";
import { Table, Typography, Button, Drawer, Form, Input, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { Prioridad } from "@/interface/prioridad";
import { getPrioridades } from "@/services/prioridad";
const { Title, Paragraph } = Typography;

export default function Page() {
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [prioridadSeleccionada, setPrioridadSeleccionada] =
    useState<Prioridad | null>(null);

  const fetchPrioridades = async () => {
    try {
      const data = await getPrioridades();
      setPrioridades(data);
    } catch (error) {
      console.log("error => ", error);
      message.error("Error al obtener prioridades");
    }
  };

  useEffect(() => {
    fetchPrioridades();
  }, []);

  const abrirDrawer = (prioridad?: Prioridad) => {
    setModoEdicion(!!prioridad);
    setPrioridadSeleccionada(prioridad || null);
    form.setFieldsValue(prioridad || {});
    setDrawerVisible(true);
  };

  const cerrarDrawer = () => {
    setDrawerVisible(false);
    setPrioridadSeleccionada(null);
    form.resetFields();
  };

  const guardarPrioridad = async (values: unknown) => {
    console.log("click => ", values);

    // try {
    //   if (modoEdicion && prioridadSeleccionada) {
    //     await updatePrioridad(prioridadSeleccionada.id, values);
    //     message.success("✅ Prioridad actualizada");
    //   } else {
    //     await createPrioridad(values);
    //     message.success("✅ Prioridad registrada");
    //   }
    //   fetchPrioridades();
    //   cerrarDrawer();
    // } catch (error) {
    //   console.log("error => ", error);
    //   message.error("Error al guardar prioridad");
    // }
  };

  const columnas: ColumnsType<Prioridad> = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Button type="link" onClick={() => abrirDrawer(record)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4}>Gestión de Prioridades</Title>
          <Paragraph type="secondary">
            Agrega o edita niveles de prioridad
          </Paragraph>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => abrirDrawer()}
        >
          Nueva Prioridad
        </Button>
      </div>

      <Table rowKey="id" columns={columnas} dataSource={prioridades} bordered />

      <Drawer
        title={modoEdicion ? "Editar Prioridad" : "Nueva Prioridad"}
        open={drawerVisible}
        onClose={cerrarDrawer}
        width={400}
      >
        <Form layout="vertical" form={form} onFinish={guardarPrioridad}>
          <Form.Item
            name="nombre"
            label="Nombre de la Prioridad"
            rules={[{ required: true, message: "Ingrese un nombre" }]}
          >
            <Input placeholder="Ej. Alta, Media, Baja" />
          </Form.Item>

          <div className="flex justify-end">
            <Button htmlType="submit" type="primary">
              {modoEdicion ? "Actualizar" : "Registrar"}
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
