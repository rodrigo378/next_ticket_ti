import { Usuario } from "@/interface/usuario";
import { Drawer, Form, FormInstance, Input, Select } from "antd";

interface Props {
  openAdministrativo: boolean;
  onCloseAdministrativo: () => void;
  form: FormInstance;
  usuario: Usuario | undefined;
}

export default function DrawerAdministrativo({
  openAdministrativo,
  onCloseAdministrativo,
  form,
}: Props) {
  return (
    <Drawer
      title="Drawer"
      placement="right"
      width={500}
      onClose={onCloseAdministrativo}
      open={openAdministrativo}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
          <Input placeholder="Ej. Juan"></Input>
        </Form.Item>

        <Form.Item
          name="apellido"
          label="Apellidos"
          rules={[{ required: true }]}
        >
          <Input placeholder="Ej. Perez"></Input>
        </Form.Item>

        <Form.Item name="genero" label="Género" rules={[{ required: true }]}>
          <Select placeholder="Seleccione género">
            <Select.Option value="masculino">Masculino</Select.Option>
            <Select.Option value="femenino">Femenino</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="grado" label="Grado" rules={[{ required: true }]}>
          <Input placeholder="Ej. Doc"></Input>
        </Form.Item>

        <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
          <Select placeholder="Seleccione un estado">
            <Select.Option value="A">Activo</Select.Option>
            <Select.Option value="I">Activo</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="password" label="Password">
          <Input.Password placeholder="Ingrese una contraseña"></Input.Password>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
