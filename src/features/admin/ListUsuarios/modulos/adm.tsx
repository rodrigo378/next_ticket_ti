// src/features/admin/ListUsuarios/modulos/adm.tsx
import { Button, Form, FormInstance, Select } from "antd";

// ===================================================================================
type Props = {
  formModules: FormInstance;
  initialRolAdm?: string;
  roleOptions: { label: string; value: string }[];
  onSave: () => void;
  loading?: boolean;
};

// ===================================================================================
export default function AdmPanel({
  formModules,
  initialRolAdm,
  roleOptions,
  onSave,
  loading,
}: Props) {
  // ===================================================================================
  const rolAdm: string | undefined =
    Form.useWatch(["adm", "rol"], formModules) ?? initialRolAdm;

  // ===================================================================================
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
            onChange={(v) => formModules.setFieldValue(["adm", "rol"], v)}
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
