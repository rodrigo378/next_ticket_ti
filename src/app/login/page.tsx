"use client";

import { signin } from "@/services/auth";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

const { Title } = Typography;

export default function LoginPage() {
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const response = await signin(values);
      const { token } = response.data;

      // Guardar token en localStorage
      localStorage.setItem("token", token);

      message.success("Inicio de sesión exitoso");

      // Redirigir a la página principal o dashboard
      router.push("/");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      message.error(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <div className="text-center mb-6">
          <Title level={3}>🔐 Iniciar Sesión</Title>
          <p className="text-gray-500">Accede al sistema de tickets</p>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Correo institucional"
            name="email"
            rules={[
              { required: true, message: "Por favor ingresa tu correo" },
              { type: "email", message: "Correo no válido" },
            ]}
          >
            <Input placeholder="ejemplo@uma.edu.pe" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: "Por favor ingresa tu contraseña" },
            ]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>

          <Form.Item className="mt-4">
            <Button type="primary" htmlType="submit" block>
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
