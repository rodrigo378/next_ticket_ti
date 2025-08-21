/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { CreateUsuario, UpdateUsuario, Usuario } from "@/interface/usuario";
import { getAreas } from "@/services/area";
import { Area, Subarea } from "@/interface/area";
import { Rol } from "@/interface/rol";
import { getRoles } from "@/services/rol";

const { Title, Paragraph } = Typography;

export default function Page() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);

  const [rolSeleccionado, setRolSeleccionado] = useState<number | null>(null);
  const [subareas, setSubareas] = useState<Subarea[]>([]);

  const [filtro, setFiltro] = useState("");
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const showDrawer = (usuario?: Usuario) => {
    console.log("usuario => ", usuario);

    if (usuario) {
      setUsuarioSeleccionado(usuario);
      form.setFieldsValue({
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        genero: usuario.genero,
        grado: usuario.grado,
        estado: usuario.estado,
        area_id: usuario.subarea?.area_id,
        rol_id: usuario.rol?.id,
        subarea_id: usuario.subarea?.id,
      });
      console.log("=> ", usuario.rol);
      console.log("=> ", usuario.rol?.nivel || 0);
      setRolSeleccionado(usuario.rol?.nivel || 0);

      // Cargar subáreas de su área
      if (usuario.subarea?.area_id) {
        const area = areas.find((a) => a.id === usuario.subarea?.area_id);
        setSubareas(area?.Subarea || []);
      }
    } else {
      setUsuarioSeleccionado(null);
      form.resetFields();
      setRolSeleccionado(null);
      setSubareas([]);
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
    setSubareas([]);
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
      message.error("Error al cargar áreas");
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.log("error => ", error);
      message.error("Error al cargar roles");
    }
  };

  const onRolChange = (rolId: number) => {
    const rol = roles.find((r) => r.id === rolId);
    setRolSeleccionado(rol?.nivel || null);
    setSubareas([]);
  };

  const onAreaChange = (areaId: number) => {
    const area = areas.find((a) => a.id === areaId);
    setSubareas(area?.Subarea || []);
    form.setFieldsValue({ subarea_id: undefined });
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
      dataIndex: ["rol", "nombre"],
      key: "rol",
    },
    {
      title: "Área",
      key: "area",
      render: (record: Usuario) => {
        return record.subarea?.area?.nombre || "—";
      },
    },
    {
      title: "Áreas Administradas",
      key: "areas_admin",
      render: (record: Usuario) => {
        if (record.rol?.nivel === 5) {
          return <Tag color="geekblue">Todas las áreas</Tag>;
        }
        if (record.rol?.nivel === 4) {
          return (
            <div className="flex flex-wrap gap-1">
              {record.UsuarioArea?.length
                ? record.UsuarioArea.map((ua) => (
                    <Tag key={ua.area?.id} color="blue">
                      {ua.area?.nombre}
                    </Tag>
                  ))
                : "—"}
            </div>
          );
        }
        return "—";
      },
    },

    {
      title: "Subarea",
      dataIndex: ["subarea", "nombre"],
      key: "subarea",
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
        // Construir el objeto `data` solo con los campos válidos
        const data: UpdateUsuario = {
          nombre: values.nombre,
          apellidos: values.apellidos,
          password: values.password,
          grado: values.grado,
          genero: values.genero,
          estado: values.estado,
          rol_id: values.rol_id,
          subarea_id: values.subarea_id,
          areas_id: values.areas_id,
        };

        // const response = await updateUsuario(usuarioSeleccionado.id, data);
        const response = await updateUsuario(
          String(usuarioSeleccionado.id),
          data
        );
        message.success("✅ Usuario actualizado correctamente");
        console.log("Usuario actualizado => ", response);
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
          {/* Input Nombre */}
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input placeholder="Ej. Juan" />
          </Form.Item>

          {/* Input Apellido */}
          <Form.Item
            name="apellidos"
            label="Apellidos"
            rules={[{ required: true }]}
          >
            <Input placeholder="Ej. Pérez" />
          </Form.Item>

          {/* Input Email */}
          <Form.Item
            name="email"
            label="Correo"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="correo@ejemplo.com" />
          </Form.Item>

          {/* Select Genero */}
          <Form.Item name="genero" label="Género" rules={[{ required: true }]}>
            <Select placeholder="Seleccione género">
              <Select.Option value="masculino">Masculino</Select.Option>
              <Select.Option value="femenino">Femenino</Select.Option>
            </Select>
          </Form.Item>

          {/* Input Grado */}
          <Form.Item name="grado" label="Grado" rules={[{ required: true }]}>
            <Input placeholder="Ej. Manager" />
          </Form.Item>

          {/* Select Estado */}
          <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
            <Select placeholder="Seleccione estado">
              <Select.Option value="A">Activo</Select.Option>
              <Select.Option value="I">Inactivo</Select.Option>
            </Select>
          </Form.Item>

          {/*Input Contraseña */}
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

          {/* Rol */}
          <Form.Item name="rol_id" label="Rol" rules={[{ required: true }]}>
            <Select placeholder="Seleccione un rol" onChange={onRolChange}>
              {roles.map((rol) => (
                <Select.Option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Estudiante */}

          {/* Nivel 5 */}
          {rolSeleccionado === 5 && (
            <>
              <div className="mb-2">
                <Tag color="geekblue">Administra todas las áreas</Tag>
              </div>
              <Form.Item name="area_id" label="Área">
                <Select
                  placeholder="Seleccione un área"
                  allowClear
                  onChange={onAreaChange}
                >
                  {areas.map((area) => (
                    <Select.Option key={area.id} value={area.id}>
                      {area.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="subarea_id" label="Subárea">
                <Select placeholder="Seleccione subárea">
                  {subareas.map((sub) => (
                    <Select.Option key={sub.id} value={sub.id}>
                      {sub.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          {/* Nivel 4 */}
          {rolSeleccionado === 4 && (
            <>
              {/* Áreas administradas */}
              <Form.Item
                name="areas_id"
                label="Áreas administradas"
                rules={[{ required: true }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Seleccione áreas"
                  onChange={(ids) => {
                    // Si la subárea actual no pertenece a las áreas seleccionadas, resetearla
                    const subarea = subareas.find(
                      (s) => s.id === form.getFieldValue("subarea_id")
                    );
                    const areaIds = areas
                      .filter((a) => ids.includes(a.id))
                      .flatMap((a) => a.Subarea?.map((s) => s.id));
                    if (subarea && !areaIds.includes(subarea.id)) {
                      // form.setFieldsValue({ subarea_id: undefined });
                    }
                  }}
                >
                  {areas.map((area) => (
                    <Select.Option key={area.id} value={area.id}>
                      {area.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Área y subárea asignada */}
              <Form.Item
                name="area_id"
                label="Área principal"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Seleccione un área"
                  onChange={onAreaChange}
                >
                  {areas.map((area) => (
                    <Select.Option key={area.id} value={area.id}>
                      {area.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="subarea_id"
                label="Subárea principal"
                rules={[{ required: true }]}
              >
                <Select placeholder="Seleccione subárea">
                  {subareas.map((sub) => (
                    <Select.Option key={sub.id} value={sub.id}>
                      {sub.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          {/* Niveles 1-3 */}
          {rolSeleccionado !== null && rolSeleccionado < 4 && (
            <>
              <Form.Item
                name="area_id"
                label="Área"
                rules={[{ required: true }]}
              >
                <Select placeholder="Seleccione área" onChange={onAreaChange}>
                  {areas.map((area) => (
                    <Select.Option key={area.id} value={area.id}>
                      {area.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="subarea_id"
                label="Subárea"
                rules={[{ required: true }]}
              >
                <Select placeholder="Seleccione subárea">
                  {subareas.map((sub) => (
                    <Select.Option key={sub.id} value={sub.id}>
                      {sub.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

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
