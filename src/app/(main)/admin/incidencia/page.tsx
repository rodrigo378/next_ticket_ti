"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Button,
  Tag,
  Input,
  Drawer,
  message,
  Form,
  Input as AntInput,
  Space,
} from "antd";
import { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  PlusOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { Incidencia } from "@/interface/incidencia";
import { getIncidencias } from "@/services/incidencias";

const { Title, Paragraph } = Typography;

export default function Page() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [filtro, setFiltro] = useState("");
  const [open, setOpen] = useState(false);
  const [formCategoria] = Form.useForm();
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] =
    useState<Incidencia | null>(null);

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  const fetchIncidencias = async () => {
    try {
      const data = await getIncidencias();
      console.log("data => ", data.length);

      // const filtradas = data.filter((i: Incidencia) => i.tipo === "incidencia");
      setIncidencias(data);
    } catch (error) {
      console.error(error);
      message.error("Error al obtener las incidencias");
    }
  };

  useEffect(() => {
    fetchIncidencias();
  }, []);

  const abrirDrawerCategorias = (incidencia: Incidencia) => {
    setIncidenciaSeleccionada(incidencia);
    formCategoria.resetFields();
    setModalCategoriaVisible(true);
  };

  const guardarCategoria = (values: any) => {
    if (!incidenciaSeleccionada) return;

    console.log("Nueva categoría:", values.nombre);
    console.log("Para incidencia:", incidenciaSeleccionada.nombre);

    const nuevaCategoria = {
      id: Date.now(), // temporal
      nombre: values.nombre,
      incidencia_id: incidenciaSeleccionada.id,
    };

    const nuevasIncidencias = incidencias.map((i) =>
      i.id === incidenciaSeleccionada.id
        ? {
            ...i,
            categorias: [...i.categorias, nuevaCategoria],
          }
        : i
    );

    setIncidencias(nuevasIncidencias);
    setIncidenciaSeleccionada({
      ...incidenciaSeleccionada,
      categorias: [...incidenciaSeleccionada.categorias, nuevaCategoria],
    });

    formCategoria.resetFields();
    message.success("✅ Categoría registrada");
  };

  const columnas: ColumnsType<Incidencia> = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "Área",
      dataIndex: ["area", "nombre"],
      key: "area_id",
      render: (nombre) => <Tag color="blue">Área {nombre}</Tag>,
    },
    {
      title: "Categorías",
      key: "categorias",
      render: (_, incidencia) => (
        <div>
          <div className="mb-2 flex flex-wrap gap-1">
            {incidencia.categorias.map((cat) => (
              <Tag key={cat.id}>{cat.nombre}</Tag>
            ))}
          </div>
          {/* <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => abrirDrawerCategorias(incidencia)}
          >
            Gestionar
          </Button> */}
        </div>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (record: Incidencia) => (
        <Space>
          <Button
            icon={<FolderOpenOutlined />}
            onClick={() => abrirDrawerCategorias(record)}
          >
            Categorías
          </Button>
        </Space>
      ),
    },
  ];

  const incidenciasFiltradas = incidencias.filter((i) =>
    `${i.nombre} ${i.descripcion}`.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4}>Gestión de Incidencias</Title>
          <Paragraph type="secondary">
            Visualiza y administra las incidencias registradas
          </Paragraph>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar..."
            prefix={<SearchOutlined />}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-64"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={showDrawer}>
            Nueva Incidencia
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        columns={columnas}
        dataSource={incidenciasFiltradas}
        bordered
        pagination={{
          pageSize: 10, // valor por defecto
          pageSizeOptions: ["10", "20", "50", "100"],
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} incidencias`,
        }}
      />

      <Drawer
        title="Registrar Incidencia"
        placement="right"
        width={500}
        onClose={onClose}
        open={open}
      >
        <p>Formulario pendiente...</p>
      </Drawer>

      <Drawer
        title={`Categorías para "${incidenciaSeleccionada?.nombre}"`}
        placement="right"
        width={400}
        onClose={() => {
          setModalCategoriaVisible(false);
          setIncidenciaSeleccionada(null);
        }}
        open={modalCategoriaVisible}
      >
        <div className="mb-4">
          {incidenciaSeleccionada?.categorias.map((cat) => (
            <Tag key={cat.id} className="mb-2 mr-1">
              {cat.nombre}
            </Tag>
          ))}
        </div>

        <Form
          form={formCategoria}
          layout="vertical"
          onFinish={guardarCategoria}
        >
          <Form.Item
            name="nombre"
            label="Nueva categoría"
            rules={[{ required: true, message: "Ingrese un nombre" }]}
          >
            <AntInput placeholder="Ej. VPN, WiFi, etc." />
          </Form.Item>

          <div className="flex justify-end">
            <Button type="primary" htmlType="submit">
              Agregar categoría
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
