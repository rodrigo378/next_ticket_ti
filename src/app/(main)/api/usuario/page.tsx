"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Table,
  Input,
  Card,
  Button,
  Modal,
  Tooltip,
  App,
  Space,
  Form,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  generarTokenUsuario,
  getUsuarios,
  setBasicAuth,
} from "@/services/api/usuario";

const { Search } = Input;

interface User {
  id: number;
  email: string;
  is_superadmin: boolean;
  created_at: string;
  token_activo: boolean;
}

type Creds = { email: string; password: string };

export default function Page() {
  const { modal, message } = App.useApp();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal Token
  const [modalVisible, setModalVisible] = useState(false);
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null);
  const [usuarioActual, setUsuarioActual] = useState<User | null>(null);

  // Modal Basic Auth
  const [authVisible, setAuthVisible] = useState(false);
  const [authForm] = Form.useForm();
  // resolver para “pausar” hasta que el usuario envíe credenciales
  const credResolverRef = useRef<((c: Creds) => void) | null>(null);

  // --- helpers ---
  const isAuthRequired = (err: unknown) => {
    // axios error shape: err.response.status === 401 && err.response.data.detail === "Basic auth requerido"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyErr = err as { response?: { status?: number; data?: any } };
    return (
      anyErr?.response?.status === 401 &&
      anyErr?.response?.data?.detail?.toString?.() === "Basic auth requerido"
    );
  };

  const askForCreds = (): Promise<Creds> =>
    new Promise((resolve) => {
      credResolverRef.current = resolve;
      setAuthVisible(true);
      // limpiar formulario
      authForm.setFieldsValue({ email: "", password: "" });
    });

  const withAuth = async <T,>(action: () => Promise<T>): Promise<T> => {
    try {
      return await action();
    } catch (err) {
      if (!isAuthRequired(err)) throw err;

      // pedir credenciales
      const { email, password } = await askForCreds();
      setBasicAuth(email, password);

      // reintentar
      return await action();
    }
  };

  // --- efectos ---
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await withAuth(() => getUsuarios());
        setUsuarios(data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        message.error("No se pudieron obtener los usuarios.");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- acciones UI ---
  const mostrarToken = (token: string, user: User) => {
    setTokenGenerado(token);
    setUsuarioActual(user);
    setModalVisible(true);
  };

  const manejarGenerarToken = (user: User) => {
    modal.confirm({
      title: user.token_activo
        ? "¿Deseas regenerar el token?"
        : "¿Deseas generar el token?",
      content: user.token_activo
        ? "Esto invalidará el token anterior y generará uno nuevo. ¿Estás seguro?"
        : "Se creará un nuevo token único para este usuario.",
      okText: user.token_activo ? "Regenerar" : "Generar",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const data = await withAuth(() => generarTokenUsuario(user.id));
          mostrarToken(data.token_plain, user);
          setUsuarios((prev) =>
            prev.map((u) =>
              u.id === user.id ? { ...u, token_activo: true } : u
            )
          );
          message.success("Token generado con éxito.");
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error("Error al generar token:", error);
          const detail = error?.response?.data?.detail;
          message.error(
            detail
              ? `No se pudo generar el token: ${detail}`
              : "No se pudo generar el token."
          );
        }
      },
    });
  };

  const columnas: ColumnsType<User> = [
    { title: "ID", dataIndex: "id", key: "id", responsive: ["md"] },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-blue-600">{text}</span>,
    },
    {
      title: "Rol",
      key: "is_superadmin",
      dataIndex: "is_superadmin",
      render: (is_superadmin) =>
        is_superadmin ? (
          <span className="text-green-600 font-medium">Superadmin</span>
        ) : (
          <span className="text-gray-600">Operador</span>
        ),
    },
    {
      title: "Token",
      key: "token_activo",
      dataIndex: "token_activo",
      render: (_, record) => (
        <Tooltip
          title={
            record.token_activo
              ? "Este usuario ya tiene un token asignado"
              : "No tiene token"
          }
        >
          <span
            className={record.token_activo ? "text-green-500" : "text-red-500"}
          >
            {record.token_activo ? "Activo" : "No generado"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Acción",
      key: "accion",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            danger={record.token_activo}
            onClick={() => manejarGenerarToken(record)}
          >
            {record.token_activo ? "Regenerar" : "Generar"}
          </Button>

          {record.token_activo && (
            <Link href={`/api/usuario/${record.id}`} passHref>
              <Button size="small">Permisos</Button>
            </Link>
          )}
        </Space>
      ),
    },
    {
      title: "Creado el",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) =>
        new Date(date).toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
  ];

  const usuariosFiltrados = usuarios.filter((u) =>
    u.email.toLowerCase().includes(filtro.toLowerCase())
  );

  // --- render ---
  return (
    <div className="p-6">
      <Card title="Lista de Usuarios" className="shadow-md">
        <div className="mb-4">
          <Search
            placeholder="Buscar por email"
            allowClear
            onChange={(e) => setFiltro(e.target.value)}
            enterButton
          />
        </div>
        <Table
          columns={columnas}
          dataSource={usuariosFiltrados}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          bordered
        />
      </Card>

      {/* Modal Token */}
      <Modal
        title="Token generado"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <p>
          Copia este token y guárdalo en un lugar seguro. Por seguridad,{" "}
          <strong>no volverá a mostrarse</strong>.
        </p>
        <pre className="bg-gray-100 p-3 rounded text-sm break-all mt-3">
          {tokenGenerado}
        </pre>
        <p className="text-xs text-gray-500 mt-2">
          Usuario: {usuarioActual?.email}
        </p>
      </Modal>

      {/* Modal Basic Auth */}
      <Modal
        title="Autenticación requerida"
        open={authVisible}
        okText="Continuar"
        cancelText="Cancelar"
        onCancel={() => {
          setAuthVisible(false);
          credResolverRef.current = null; // cancelar flujo
        }}
        onOk={async () => {
          const values = await authForm.validateFields();
          const creds: Creds = {
            email: values.email,
            password: values.password,
          };
          setAuthVisible(false);
          // resolver promesa del withAuth
          credResolverRef.current?.(creds);
          credResolverRef.current = null;
        }}
      >
        <Form
          form={authForm}
          layout="vertical"
          initialValues={{ email: "", password: "" }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Ingresa tu email" },
              { type: "email", message: "Email no válido" },
            ]}
          >
            <Input placeholder="tu@dominio.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: "Ingresa tu contraseña" }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
