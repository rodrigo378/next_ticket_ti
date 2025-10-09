// src/features/admin/ListUsuarios/modulos/api.tsx
import { Button, Form, FormInstance, Select } from "antd";
import { ApiPayload } from "../hooks/modulos.normalize";

// ===================================================================================
type Props = {
  formModules: FormInstance;
  initialRolApi?: string;
  roleOptions: ApiPayload[];
  onSave: () => void;
  loading?: boolean;
};

// ===================================================================================
export default function APIPanel({
  formModules,
  initialRolApi,
  roleOptions,
  onSave,
  loading,
}: Props) {
  // ===================================================================================
  const rolApi: string | undefined =
    Form.useWatch(["api", "rol"], formModules) ?? initialRolApi;

  // ===================================================================================
  return (
    <div className="space-y-4">
      <Form form={formModules} layout="vertical">
        <Form.Item
          label="Rol"
          name={["api", "rol"]}
          initialValue={initialRolApi}
        >
          <Select
            value={rolApi}
            onChange={(v) => formModules.setFieldValue(["api", "rol"], v)}
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
