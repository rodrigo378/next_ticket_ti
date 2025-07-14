"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Typography,
  Input,
  Drawer,
  Form,
  Select,
  message,
} from "antd";
import { SearchOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { createUsuario, getUsuarios, updateUsuario } from "@/services/admin";
import { CreateUsuario, Usuario } from "@/interface/usuario";
import { getAreas } from "@/services/area";
import { Area } from "@/interface/area";
import { Rol } from "@/interface/rol";
import { getRoles } from "@/services/rol";

const { Title, Paragraph } = Typography;

export default function Page() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);

  const [filtro, setFiltro] = useState("");
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const showDrawer = (usuario?: Usuario) => {
    console.log("se abrio el drawer");

    if (usuario) {
      console.log("se abrio para editar", usuario);
      setUsuarioSeleccionado(usuario);
      form.setFieldsValue({
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        genero: usuario.genero,
        grado: usuario.grado,
        estado: usuario.estado,
        area_id: usuario.area_id,
        roles: usuario.roles.map((ur) => ur.rol_id),
      });
    } else {
      setUsuarioSeleccionado(null);
      form.resetFields();
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };

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
      message.error("");
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.log("error => ", error);
      message.error("");
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchAreas();
    fetchRoles();
  }, []);

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
      title: "Rol",
      key: "rol",
      render: (usuario: Usuario) => {
        const rolesHTML = usuario.roles
          .map((usuarioRol) => usuarioRol.rol.nombre)
          .join("<br/>");

        return <span dangerouslySetInnerHTML={{ __html: rolesHTML }} />;
      },
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
          <Button icon={<EyeOutlined />} onClick={() => showDrawer(record)} />
        </div>
      ),
    },
  ];

  const usuariosFiltrados = usuarios.filter((u) =>
    `${u.nombre} ${u.apellidos || ""} ${u.email}`
      .toLowerCase()
      .includes(filtro.toLowerCase())
  );

  const onFinish = async (values: CreateUsuario) => {
    try {
      if (usuarioSeleccionado) {
        console.log("update => ", values);
        const res = await updateUsuario(usuarioSeleccionado.id, values);
        console.log("res => ", res);
        message.success("✅ Usuario actualizado correctamente");
      } else {
        await createUsuario(values);
        message.success("✅ Usuario registrado correctamente");
      }

      onClose();
      fetchUsuarios();
    } catch (error) {
      console.error("❌ Error al guardar usuario", error);
      message.error("No se pudo guardar el usuario");
    }
  };

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
            onClick={() => showDrawer()}
          >
            Añadir usuario
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        columns={columnas}
        dataSource={usuariosFiltrados}
        pagination={{ pageSize: 20 }}
        bordered
      />
      <Drawer
        title={usuarioSeleccionado ? "Editar Usuario" : "Registrar Usuario"}
        placement="right"
        width={500}
        onClose={onClose}
        open={open}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input placeholder="Ej. Juan" />
          </Form.Item>

          <Form.Item
            name="apellidos"
            label="Apellidos"
            rules={[{ required: true }]}
          >
            <Input placeholder="Ej. Pérez" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Correo"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="correo@ejemplo.com" />
          </Form.Item>

          <Form.Item name="genero" label="Género" rules={[{ required: true }]}>
            <Select placeholder="Seleccione género">
              <Select.Option value="masculino">Masculino</Select.Option>
              <Select.Option value="femenino">Femenino</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="grado" label="Grado" rules={[{ required: true }]}>
            <Input placeholder="Ej. Manager" />
          </Form.Item>

          <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
            <Select placeholder="Seleccione estado">
              <Select.Option value="A">Activo</Select.Option>
              <Select.Option value="I">Inactivo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              !usuarioSeleccionado
                ? { required: true, message: "La contraseña es obligatoria" }
                : {},
            ]}
          >
            <Input.Password placeholder="Ingrese una contraseña" />
          </Form.Item>

          <Form.Item name="area_id" label="Areas" rules={[{ required: true }]}>
            <Select placeholder="Seleccione un area" allowClear>
              {areas.map((area) => (
                <Select.Option key={area.id} value={area.id}>
                  {area.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="roles" label="Roles" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              placeholder="Seleccione uno o más roles"
              allowClear
            >
              {roles.map((rol) => (
                <Select.Option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end">
            <Button type="primary" htmlType="submit">
              {usuarioSeleccionado ? "Editar Usuario" : "Crear Usuario"}
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
