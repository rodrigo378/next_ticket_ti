import { Area, Subarea } from "@/interface/area";
import { Rol } from "@/interface/rol";
import { CreateUsuario, Usuario } from "@/interface/usuario";
import { Button, Drawer, Form, FormInstance, Input, Select, Tag } from "antd";

interface Props {
  usuario: Usuario | undefined;
  openAdministrativo: boolean;
  form: FormInstance;
  roles: Rol[];
  areas: Area[];
  subareas: Subarea[];

  onCloseAdministrativo: () => void;
  onFinishAdministrativo: (values: CreateUsuario) => void;
  fetchSubareas: (area_id: number) => void;
}

export default function DrawerAdministrativo({
  openAdministrativo,
  form,
  roles,
  areas,
  subareas,

  onCloseAdministrativo,
  onFinishAdministrativo,
  fetchSubareas,
}: Props) {
  const rol_id = Form.useWatch("rol_id", form);
  const area_id = Form.useWatch("area_id", form);

  // HANDLES =================================================
  const handleAreaChange = (area_id: number) => {
    form.setFieldsValue({ subarea_id: undefined });
    fetchSubareas(area_id);
  };

  return (
    <Drawer
      title="Drawer"
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
            <Select.Option value="I">Inactivo</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="password" label="Password">
          <Input.Password placeholder="Ingrese una contraseña"></Input.Password>
        </Form.Item>

        <Form.Item name="rol_id" label="Rol" rules={[{ required: true }]}>
          <Select placeholder="Seleccione un rol">
            {roles.map((rol) => (
              <Select.Option key={rol.id} value={rol.id}>
                {rol.nombre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {rol_id === 1 && (
          <>
            <div className="mb-2">
              <Tag color="geekblue">Administra todas las áreas</Tag>
            </div>

            <Form.Item name="area_id" label="Area">
              <Select
                placeholder="Seleccione un area"
                onChange={handleAreaChange}
              >
                {areas.map((area) => (
                  <Select.Option key={area.id} value={area.id}>
                    {area.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="subarea_id" label="Subárea">
              <Select
                placeholder="Seleccione subárea"
                disabled={!area_id}
                allowClear
              >
                {subareas.map((sub) => (
                  <Select.Option key={sub.id} value={sub.id}>
                    {sub.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}

        {rol_id === 2 && (
          <>
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
            <Form.Item name="area_id" label="Area">
              <Select
                placeholder="Seleccione un area"
                onChange={handleAreaChange}
              >
                {areas.map((area) => (
                  <Select.Option key={area.id} value={area.id}>
                    {area.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="subarea_id" label="Subárea">
              <Select
                placeholder="Seleccione subárea"
                disabled={!area_id}
                allowClear
              >
                {subareas.map((sub) => (
                  <Select.Option key={sub.id} value={sub.id}>
                    {sub.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}

        {[3, 4, 5, 7].includes(rol_id) && (
          <>
            <Form.Item name="area_id" label="Area">
              <Select
                placeholder="Seleccione un area"
                onChange={handleAreaChange}
              >
                {areas.map((area) => (
                  <Select.Option key={area.id} value={area.id}>
                    {area.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="subarea_id" label="Subárea">
              <Select
                placeholder="Seleccione subárea"
                disabled={!area_id}
                allowClear
              >
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
            Crear
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}
