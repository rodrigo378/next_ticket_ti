import { Button, Form, FormInstance, Select, message } from "antd";
import { useState } from "react";
import { upsertUsuarioModulo } from "@/services/core/usuario";

type Props = {
  usuario_id: number | null;
  formModules: FormInstance;
  initialRolApi?: string;
  roleOptions: { label: string; value: string }[];
};

export default function APIPanel({
  usuario_id,
  formModules,
  initialRolApi,
  roleOptions,
}: Props) {
  const [saving, setSaving] = useState(false);

  const rolApi: string | undefined =
    Form.useWatch(["tp", "rol"], formModules) ?? initialRolApi;

  const handleTpRolChange = (next: string) => {
    formModules.setFieldValue(["tp", "rol"], next);
  };

  const handleSave = async () => {
    if (!usuario_id) {
      message.error("Primero selecciona un usuario.");
      return;
    }
    const rol = formModules.getFieldValue(["tp", "rol"]) as string | undefined;
    if (!rol) {
      message.info("No hay cambios por guardar.");
      return;
    }
    try {
      setSaving(true);
      await upsertUsuarioModulo(usuario_id, "API", { rol });
      message.success("Rol de API actualizado.");
    } catch (e) {
      console.error(e);
      message.error("No se pudo actualizar el rol de API.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Form form={formModules} layout="vertical">
        <Form.Item
          label="Rol"
          name={["api", "api"]}
          initialValue={initialRolApi}
        >
          <Select
            value={rolApi}
            onChange={handleTpRolChange}
            options={roleOptions}
            placeholder="Seleccione rol"
            allowClear
          />
        </Form.Item>

        <Button type="primary" loading={saving} onClick={handleSave}>
          Guardar
        </Button>
      </Form>
    </div>
  );
}
