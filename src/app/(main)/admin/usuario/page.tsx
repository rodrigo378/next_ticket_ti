"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Typography,
  Input,
  Modal,
  Form,
  Select,
  Row,
  Col,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";

import { getUsuarios, updateUsuario } from "@/services/admin";
import { getAreas } from "@/services/area";
import { signup } from "@/services/auth";
import { Usuario, SignUp } from "@/interface/usuario";
import { Area } from "@/interface/area";

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function Page() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [filtro, setFiltro] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editarUsuario, setEditarUsuario] = useState<Usuario | null>(null);
  const [form] = Form.useForm();

  const fetchUsuarios = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const data = await getAreas();
      setAreas(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      await fetchUsuarios();
      await fetchAreas();
    };
    fetch();
  }, []);

  const abrirModal = (usuario?: Usuario) => {
    setEditarUsuario(usuario || null);
    setModalVisible(true);
    if (usuario) {
      form.setFieldsValue(usuario);
    } else {
      form.resetFields();
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditarUsuario(null);
    form.resetFields();
  };

  const manejarEnvioFormulario = async (valores: SignUp & { id?: number }) => {
    try {
      if (editarUsuario) {
        console.log("actualizado => ", valores);

        const response = await updateUsuario(valores.id!, valores);
        console.log("response => ", response);

        message.success("Usuario actualizado");
      } else {
        await signup(valores);
        message.success("Usuario creado");
      }
      await fetchUsuarios();
      cerrarModal();
    } catch (err) {
      console.log("error => ", err);
      message.error("Error al guardar usuario => ");
    }
  };

  const columnas: ColumnsType<Usuario> = [
    {
      title: "Usuario",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700">
              {record.nombre}
            </span>
            <span className="text-sm text-slate-500">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Grado",
      dataIndex: "grado",
      key: "grado",
      sorter: (a, b) => a.grado.localeCompare(b.grado),
    },
    {
      title: "Área",
      dataIndex: "area_id",
      key: "area_id",
      sorter: (a, b) => a.area_id - b.area_id,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado: string) => {
        const color = estado === "A" ? "green" : "volcano";
        const label = estado === "A" ? "Activo" : "Inactivo";
        return <Tag color={color}>{label}</Tag>;
      },
      sorter: (a, b) => a.estado.localeCompare(b.estado),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (record: Usuario) => (
        <div className="flex gap-2">
          <Button icon={<EyeOutlined />} onClick={() => abrirModal(record)} />
        </div>
      ),
    },
  ];

  const usuariosFiltrados = usuarios.filter((u) =>
    `${u.nombre} ${u.apellidos || ""} ${u.email}`
      .toLowerCase()
      .includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4}>Lista de usuarios</Title>
          <Paragraph type="secondary">Lista de usuarios registrados</Paragraph>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar..."
            prefix={<SearchOutlined />}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-64"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => abrirModal()}
          >
            Añadir usuario
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        columns={columnas}
        dataSource={usuariosFiltrados}
        pagination={{ pageSize: 5 }}
        bordered
      />

      <Modal
        title={editarUsuario ? "Editar Usuario" : "Añadir Usuario"}
        open={modalVisible}
        onCancel={cerrarModal}
        footer={null}
        closeIcon={<CloseOutlined />}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={manejarEnvioFormulario}
          initialValues={{ estado: "A" }}
        >
          {editarUsuario && (
            <Form.Item name="id" hidden>
              <Input type="hidden" />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nombre"
                label="Nombre"
                rules={[{ required: true }]}
              >
                <Input placeholder="Ej. Juan" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="apellidos"
                label="Apellidos Completos"
                rules={[{ required: true }]}
              >
                <Input placeholder="Ej. Pérez" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input placeholder="correo@ejemplo.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="genero"
                label="Género"
                rules={[{ required: true }]}
              >
                <Select placeholder="Seleccione género">
                  <Option value="masculino">Masculino</Option>
                  <Option value="femenino">Femenino</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="grado"
                label="Grado"
                rules={[{ required: true }]}
              >
                <Input placeholder="Ej. Manager" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="estado"
                label="Estado"
                rules={[{ required: true }]}
              >
                <Select placeholder="Seleccione estado">
                  <Option value="A">Activo</Option>
                  <Option value="I">Inactivo</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="area_id"
                label="Área"
                rules={[{ required: true }]}
              >
                <Select placeholder="Seleccione área">
                  {areas.map((area) => (
                    <Option key={area.id} value={area.id}>
                      {area.nombre}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="password"
                label="Contraseña"
                rules={
                  editarUsuario
                    ? []
                    : [
                        {
                          required: true,
                          message: "La contraseña es obligatoria",
                        },
                      ]
                }
              >
                <Input.Password
                  placeholder={
                    editarUsuario
                      ? "Dejar en blanco si no desea cambiar la contraseña"
                      : "Ingrese contraseña"
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={cerrarModal}>Cancelar</Button>
            <Button type="primary" htmlType="submit">
              {editarUsuario ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
