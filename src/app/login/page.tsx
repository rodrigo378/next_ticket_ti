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

      localStorage.setItem("token", token);

      message.success("Inicio de sesión exitoso");
      router.push("/");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      message.error(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen g-gray-100"
      style={{
        height: "96vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card style={{ width: 400 }} className="shadow-lg rounded-xl">
        <div className="text-center mb-6">
          <Title level={3} style={{ marginBottom: 0 }}>
            🎫 Sistema de Tickets
          </Title>
          <p className="text-gray-500 text-sm">Inicia sesión con tu cuenta</p>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="Correo institucional"
            name="email"
            rules={[
              { required: true, message: "Por favor ingresa tu correo" },
              { type: "email", message: "Correo no válido" },
            ]}
          >
            <Input
              placeholder="ejemplo@uma.edu.pe"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: "Por favor ingresa tu contraseña" },
            ]}
          >
            <Input.Password
              placeholder="********"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              className="rounded-md bg-blue-600 hover:bg-blue-700"
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
