import { Core_Rol } from "@/interface/core/core_rol";
import { Core_Usuario } from "@/interface/core/core_usuario";
import { Button, Drawer, Form, FormInstance, Input, Select } from "antd";

interface Props {
  usuario: Core_Usuario | undefined;
  roles: Core_Rol[];

  openAdministrativo: boolean;
  form: FormInstance;

  onCloseAdministrativo: () => void;
  onFinishAdministrativo: (values: Core_Usuario) => void;
}

export default function DrawerAdministrativo({
  usuario,
  roles,

  openAdministrativo,
  form,

  onCloseAdministrativo,
  onFinishAdministrativo,
}: Props) {
  return (
    <Drawer
      title={usuario ? `Actualizar Usuario` : "Crear Usuario"}
      placement="right"
      width={500}
      onClose={onCloseAdministrativo}
      open={openAdministrativo}
    >
      <Form form={form} layout="vertical" onFinish={onFinishAdministrativo}>
        <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
          <Input placeholder="Ej. Juan"></Input>
        </Form.Item>

        <Form.Item
          name="apellidos"
          label="Apellidos"
          rules={[{ required: true }]}
        >
          <Input placeholder="Ej. Perez"></Input>
        </Form.Item>

        <Form.Item
          name="email"
          label="Correo"
          rules={[{ required: true, type: "email" }]}
        >
          <Input placeholder="correo@uma.edu.pe" />
        </Form.Item>

        <Form.Item name="grado" label="Grado" rules={[{ required: true }]}>
          <Input placeholder="Ej. Doc"></Input>
        </Form.Item>

        <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
          <Select placeholder="Seleccione un estado">
            <Select.Option value="A">Activo</Select.Option>
            <Select.Option value="I">Inactivo</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="rol_id" label="Rol" rules={[{ required: true }]}>
          <Select placeholder="Seleccione un rol">
            {roles.map((rol) => (
              <Select.Option value={rol.id} key={rol.id}>
                {rol.nombre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div className="flex justify-end">
          <Button type="primary" htmlType="submit">
            {usuario ? `Actualizar` : "Crear"}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}
