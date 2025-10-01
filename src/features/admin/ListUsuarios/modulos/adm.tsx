import { Button, Form, FormInstance, Select, message } from "antd";
import { useState } from "react";
import { upsertUsuarioModulo } from "@/services/core/usuario";

type Props = {
  usuario_id: number | null;
  formModules: FormInstance;
  initialRolAdm?: string;
  roleOptions: { label: string; value: string }[];
};

export default function AdmPanel({
  usuario_id,
  formModules,
  initialRolAdm,
  roleOptions,
}: Props) {
  const [saving, setSaving] = useState(false);

  const rolAdm: string | undefined =
    Form.useWatch(["adm", "rol"], formModules) ?? initialRolAdm;

  const handleAdmRolChange = (next: string) => {
    formModules.setFieldValue(["adm", "rol"], next);
  };

  const handleSave = async () => {
    if (!usuario_id) {
      message.error("Primero selecciona un usuario.");
      return;
    }
    const rol = formModules.getFieldValue(["adm", "rol"]) as string | undefined;
    if (!rol) {
      message.info("No hay cambios por guardar.");
      return;
    }
    try {
      setSaving(true);
      await upsertUsuarioModulo(usuario_id, "ADM", { rol });
      message.success("Rol de ADM actualizado.");
    } catch (e) {
      console.error(e);
      message.error("No se pudo actualizar el rol de ADM.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Form form={formModules} layout="vertical">
        <Form.Item
          label="Rol"
          name={["adm", "rol"]}
          initialValue={initialRolAdm}
        >
          <Select
            value={rolAdm}
            onChange={handleAdmRolChange}
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
