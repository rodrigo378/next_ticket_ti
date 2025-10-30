// src/features/admin/ListUsuarios/modulos/hr.tsx
import { Button, Form, FormInstance, Select } from "antd";
import { UsuarioModuloConfigModule } from "../components/DrawerModuloUsuario";

// ===================================================================================
type Props = {
  formModules: FormInstance;
  // initialrolHr?: string;
  hrModule?: UsuarioModuloConfigModule;
  roleOptions: { label: string; value: string }[];
  onSave: () => void;
  loading?: boolean;
};

// Data estática
const especialidades: { label: string; value: string }[] = [
  // E - INGENIERÍA Y NEGOCIOS
  { label: "E1 — ADMINISTRACIÓN DE NEGOCIOS INTERNACIONALES", value: "E1" },
  { label: "E2 — ADMINISTRACIÓN Y MARKETING", value: "E2" },
  { label: "E3 — CONTABILIDAD Y FINANZAS", value: "E3" },
  { label: "E4 — ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES", value: "E4" },
  { label: "E5 — INGENIERÍA INDUSTRIAL", value: "E5" },
  { label: "E6 — INGENIERÍA DE INTELIGENCIA ARTIFICIAL", value: "E6" },
  { label: "E7 — INGENIERÍA DE SISTEMAS", value: "E7" },
  { label: "E8 — ADMINISTRACIÓN DE EMPRESAS", value: "E8" },
  { label: "E9 — DERECHO", value: "E9" },
  // S - CIENCIAS DE LA SALUD
  { label: "S1 — ENFERMERÍA", value: "S1" },
  { label: "S2 — FARMACIA Y BIOQUÍMICA", value: "S2" },
  { label: "S3 — NUTRICIÓN Y DIETÉTICA", value: "S3" },
  { label: "S4 — PSICOLOGÍA", value: "S4" },
  {
    label: "S5 — TEC. MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN",
    value: "S5",
  },
  {
    label: "S6 — TEC. MÉDICA EN LAB. CLÍNICO Y ANATOMÍA PATOLÓGICA",
    value: "S6",
  },
  { label: "S7 — MEDICINA", value: "S7" },
];

// ===================================================================================
export default function HrPanel({
  formModules,
  hrModule,
  roleOptions,
  onSave,
  loading,
}: Props) {
  // ===================================================================================

  const initialRolHr = hrModule?.rol ?? undefined;
  const initialEspecialidadeslHr = hrModule?.especialidades ?? undefined;

  const rolHr: string | undefined =
    Form.useWatch(["hd", "rol"], formModules) ?? initialRolHr;

  const especialidadesHr: string[] | undefined =
    Form.useWatch(["hd", "especialidades"], formModules) ??
    initialEspecialidadeslHr;

  // ===================================================================================
  return (
    <div className="space-y-4">
      <Form form={formModules} layout="vertical">
        <Form.Item label="Rol" name={["hr", "rol"]} initialValue={initialRolHr}>
          <Select
            value={rolHr}
            onChange={(v) => formModules.setFieldValue(["hr", "rol"], v)}
            options={roleOptions}
            placeholder="Seleccione rol"
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Especialidades"
          name={["hr", "especialidades"]}
          initialValue={initialEspecialidadeslHr}
          rules={[
            {
              required: true,
              message: "Seleccione al menos una especialidad",
              type: "array",
            },
          ]}
        >
          <Select
            value={especialidadesHr}
            mode="multiple"
            placeholder="Seleccione especialidades"
            options={especialidades}
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
