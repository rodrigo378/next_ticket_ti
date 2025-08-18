"use client";

import { Modulo } from "@/interface/modulo";
import { Permiso } from "@/interface/permisos";
import { getModulos, getPermisosTo, updatePermisos } from "@/services/admin";
import {
  Input,
  Button,
  Card,
  Typography,
  Divider,
  Checkbox,
  Row,
  Col,
  Space,
  Form,
  message,
} from "antd";
import { useEffect, useState } from "react";

const { Title } = Typography;

export default function PermisosPage() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [checkedPermisos, setCheckedPermisos] = useState<number[]>([]);
  const [boolPermisos, setBoolPermisos] = useState(false);
  const [usuario_id, setUsuario_id] = useState<number | null>(null);

  const fetchModulos = async () => {
    try {
      const data = await getModulos();
      setModulos(data);
      console.log("response => ", data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      await fetchModulos();
    };
    fetch();
  }, []);

  const buscarPermisos = async (values: { email: string }) => {
    try {
      const data = await getPermisosTo(values.email);
      setUsuario_id(data.usuario_id);

      const activos = data.permisos
        .filter((p: Permiso) => p.estado === "A")
        .map((p: Permiso) => p.item_id);

      setCheckedPermisos(activos);
      setBoolPermisos(true);
    } catch (error) {
      message.error("Este email no existe");
      console.log("Error al buscar permisos:", error);
      setBoolPermisos(false);
    }
  };

  const isChecked = (id: number) => checkedPermisos.includes(id);

  const togglePermiso = (id: number, checked: boolean) => {
    if (checked) {
      setCheckedPermisos([...checkedPermisos, id]);
    } else {
      setCheckedPermisos(checkedPermisos.filter((pid) => pid !== id));
    }
  };

  const actualizarPermisos = async () => {
    console.log("usuario_id => ", usuario_id);
    console.log("✅ Permisos seleccionados:", checkedPermisos);

    try {
      const response = await updatePermisos(usuario_id!, checkedPermisos);
      console.log("response => ", response);
      message.success("Se actualizo los permisos");
    } catch (error) {
      message.error("Error al actualizar los permisos");
      console.log("error => ", error);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      {/* 🔍 Barra de búsqueda */}
      <Space className="mb-8" direction="horizontal">
        <Form layout="inline" onFinish={buscarPermisos}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Por favor ingresa un email" },
              { type: "email", message: "Correo invalido" },
            ]}
          >
            <Input placeholder="Email" style={{ width: 300 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Buscar
            </Button>
          </Form.Item>
        </Form>
      </Space>

      {/* 🗂️ Tarjeta de Permisos */}
      {boolPermisos && (
        <Card className="rounded-2xl shadow-xl">
          <Title level={3} style={{ color: "#0369a1" }}>
            Lista de Permisos
          </Title>

          {modulos.map((modulo) => (
            <div key={modulo.id} style={{ marginBottom: "2rem" }}>
              <Divider orientation="center" orientationMargin={10}>
                <strong>{modulo.nombre}</strong>
              </Divider>

              <Title level={5} style={{ color: "#555" }}>
                Sección de permisos
              </Title>

              <Row gutter={[16, 16]}>
                {modulo.items?.map((item) => (
                  <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                    <Checkbox
                      checked={isChecked(item.id)}
                      onChange={(e) => togglePermiso(item.id, e.target.checked)}
                    >
                      {item.nombre}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </div>
          ))}

          {/* Botón Guardar */}
          <div style={{ textAlign: "right", marginTop: "2rem" }}>
            <Button
              type="primary"
              onClick={() => {
                actualizarPermisos();
              }}
            >
              Guardar Cambios
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
