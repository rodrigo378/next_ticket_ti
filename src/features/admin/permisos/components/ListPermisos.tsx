import { Core_Modulo } from "@interfaces/core";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
} from "antd";
import Title from "antd/es/typography/Title";

interface Props {
  modulos: Core_Modulo[];
  buscarPermisos: (values: { email: string }) => void;
  isChecked: (id: number) => boolean;
  togglePermiso: (id: number, checked: boolean) => void;
  updatePermisos: () => void;
}

export default function ListPermisos({
  modulos,
  buscarPermisos,
  isChecked,
  togglePermiso,
  updatePermisos,
}: Props) {
  return (
    <>
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

      <Card className="rounded-2xl shadow-xl">
        <Title level={3} style={{ color: "#0369a1" }}>
          Lista de Permisos
        </Title>

        {modulos.map((modulo) => (
          <div key={modulo.id} style={{ marginBottom: "2rem" }}>
            <Divider orientation="center" orientationMargin={10}>
              <strong>{modulo.nombre}</strong>
            </Divider>

            {modulo.Submodulo?.map((submod) => (
              <div key={submod.id}>
                <Divider orientation="center" orientationMargin={10}>
                  <h2>{submod.nombre}</h2>
                </Divider>

                <Title level={5} style={{ color: "#555" }}>
                  Sección de permisos
                </Title>

                <Row gutter={[16, 16]}>
                  {submod.items?.map((item) => (
                    <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                      <Checkbox
                        checked={isChecked(item.id)}
                        onChange={(e) =>
                          togglePermiso(item.id, e.target.checked)
                        }
                      >
                        {item.nombre}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </div>
        ))}

        <div style={{ textAlign: "right", marginTop: "2rem" }}>
          <Button
            type="primary"
            onClick={() => {
              updatePermisos();
            }}
          >
            Guardar Cambios
          </Button>
        </div>
      </Card>
    </>
  );
}
