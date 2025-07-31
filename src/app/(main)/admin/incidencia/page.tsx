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
  Select,
} from "antd";
import { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  PlusOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { Incidencia } from "@/interface/incidencia";
import { getIncidencias } from "@/services/incidencias";
import { getAreas } from "@/services/area";
import { Area, Subarea } from "@/interface/area";

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function Page() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [filtro, setFiltro] = useState("");
  const [open, setOpen] = useState(false);
  const [formCategoria] = Form.useForm();
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] =
    useState<Incidencia | null>(null);

  // Para área, subárea y tipo
  const [areas, setAreas] = useState<Area[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState<number | null>(null);
  const [subareaSeleccionada, setSubareaSeleccionada] = useState<number | null>(
    null
  );
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(null);

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  // Fetch incidencias
  const fetchIncidencias = async () => {
    try {
      const data = await getIncidencias();
      setIncidencias(data);
    } catch (error) {
      console.error(error);
      message.error("Error al obtener las incidencias");
    }
  };

  // Fetch áreas
  const fetchAreas = async () => {
    try {
      const data = await getAreas();
      setAreas(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  useEffect(() => {
    fetchIncidencias();
    fetchAreas();
  }, []);

  // Cambiar subáreas al seleccionar área
  const onAreaChange = (areaId: number) => {
    setAreaSeleccionada(areaId);
    setSubareaSeleccionada(null);
    const area = areas.find((a) => a.id === areaId);
    setSubareas(area?.Subarea || []);
  };

  // Columnas
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
      dataIndex: ["subarea", "area", "nombre"],
      key: "area_id",
      render: (nombre: string) => <Tag color="blue">{nombre}</Tag>,
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo: string) => (
        <Tag color={tipo === "incidencia" ? "red" : "green"}>
          {tipo.toUpperCase()}
        </Tag>
      ),
    },
    // {
    //   title: "Categorías",
    //   key: "categorias",
    //   render: (_, incidencia) => (
    //     <div className="mb-2 flex flex-wrap gap-1">
    //       {incidencia.categorias.map((cat) => (
    //         <Tag key={cat.id}>{cat.nombre}</Tag>
    //       ))}
    //     </div>
    //   ),
    // },
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

  // Abrir Drawer Categorías
  const abrirDrawerCategorias = (incidencia: Incidencia) => {
    setIncidenciaSeleccionada(incidencia);
    formCategoria.resetFields();
    setModalCategoriaVisible(true);
  };

  // Guardar nueva categoría
  // const guardarCategoria = (values: any) => {
  //   if (!incidenciaSeleccionada) return;
  //   const nuevaCategoria = {
  //     id: Date.now(), // temporal
  //     nombre: values.nombre,
  //     incidencia_id: incidenciaSeleccionada.id,
  //   };
  //   // const nuevasIncidencias = incidencias.map((i) =>
  //   //   i.id === incidenciaSeleccionada.id
  //   //     ? { ...i, categorias: [...i.categorias, nuevaCategoria] }
  //   //     : i
  //   // );
  //   // setIncidencias(nuevasIncidencias);
  //   // setIncidenciaSeleccionada({
  //   //   ...incidenciaSeleccionada,
  //   //   categorias: [...incidenciaSeleccionada.categorias, nuevaCategoria],
  //   // });
  //   formCategoria.resetFields();
  //   message.success("✅ Categoría registrada");
  // };

  // Filtrar incidencias
  const incidenciasFiltradas = incidencias.filter((i) => {
    const matchTexto = `${i.nombre} ${i.descripcion}`
      .toLowerCase()
      .includes(filtro.toLowerCase());
    const matchArea = areaSeleccionada
      ? i.subarea?.area?.id === areaSeleccionada
      : true;
    const matchSubarea = subareaSeleccionada
      ? i.subarea?.id === subareaSeleccionada
      : true;
    const matchTipo = tipoSeleccionado ? i.tipo === tipoSeleccionado : true;
    return matchTexto && matchArea && matchSubarea && matchTipo;
  });

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

      {/* Filtros: Área, Subárea y Tipo */}
      <div className="flex gap-4 mb-4">
        <Select
          placeholder="Seleccione Área"
          style={{ width: 200 }}
          allowClear
          onChange={onAreaChange}
        >
          {areas.map((area) => (
            <Option key={area.id} value={area.id}>
              {area.nombre}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Seleccione Subárea"
          style={{ width: 200 }}
          allowClear
          value={subareaSeleccionada || undefined}
          onChange={(subId) => setSubareaSeleccionada(subId)}
          disabled={!areaSeleccionada}
        >
          {subareas.map((sub) => (
            <Option key={sub.id} value={sub.id}>
              {sub.nombre}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Tipo"
          style={{ width: 200 }}
          allowClear
          value={tipoSeleccionado || undefined}
          onChange={(tipo) => setTipoSeleccionado(tipo)}
        >
          <Option value="incidencia">Incidencia</Option>
          <Option value="requerimiento">Requerimiento</Option>
        </Select>
      </div>

      <Table
        rowKey="id"
        columns={columnas}
        dataSource={incidenciasFiltradas}
        bordered
        pagination={{
          pageSize: 10,
          pageSizeOptions: ["10", "20", "50", "100"],
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} incidencias`,
        }}
      />

      {/* Drawer para registrar incidencias */}
      <Drawer
        title="Registrar Incidencia"
        placement="right"
        width={500}
        onClose={onClose}
        open={open}
      >
        <p>Formulario pendiente...</p>
      </Drawer>

      {/* Drawer de categorías */}
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
        {/* <div className="mb-4">
          {incidenciaSeleccionada?.categorias.map((cat) => (
            <Tag key={cat.id} className="mb-2 mr-1">
              {cat.nombre}
            </Tag>
          ))}
        </div> */}

        <Form
          form={formCategoria}
          layout="vertical"
          // onFinish={guardarCategoria}
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
