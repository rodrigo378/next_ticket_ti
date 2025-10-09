// src/features/admin/ListUsuarios/modulos/tp.tsx
import { Button, Form, FormInstance, Select } from "antd";
import { TpPayload } from "../hooks/modulos.normalize";

// ===================================================================================
type Props = {
  formModules: FormInstance;
  initialRolTp?: string;
  roleOptions: TpPayload[];
  onSave: () => void;
  loading?: boolean;
};

// ===================================================================================
export default function TPPanel({
  formModules,
  initialRolTp,
  roleOptions,
  onSave,
  loading,
}: Props) {
  // ===================================================================================
  const rolTp: string | undefined =
    Form.useWatch(["tp", "rol"], formModules) ?? initialRolTp;

  // ===================================================================================
  return (
    <div className="space-y-4">
      <Form form={formModules} layout="vertical">
        <Form.Item label="Rol" name={["tp", "rol"]} initialValue={initialRolTp}>
          <Select
            value={rolTp}
            onChange={(v) => formModules.setFieldValue(["tp", "rol"], v)}
            options={roleOptions}
            placeholder="Seleccione rol"
            allowClear
          />
        </Form.Item>

        <Button type="primary" loading={loading} onClick={onSave}>
          Guardar
        </Button>
      </Form>
    </div>
  );
}
