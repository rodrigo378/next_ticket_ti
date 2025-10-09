// src/features/admin/ListUsuarios/modulos/hd.tsx
import { Alert, Button, Form, FormInstance, Select } from "antd";
import { HD_Area, HD_Subarea } from "@/interfaces/hd";
import { useEffect, useState } from "react";
import { getSubareas } from "@/services/hd";
import { UsuarioModuloConfigModule } from "../components/DrawerModuloUsuario";
import { HdPayload } from "../hooks/modulos.normalize";

// ===================================================================================
type Props = {
  formModules: FormInstance;
  hdModule?: UsuarioModuloConfigModule;
  areas: HD_Area[];
  roleOptions: HdPayload[];
  onSave: () => void;
  loading?: boolean;
};

// ===================================================================================
export default function HDPanel({
  formModules,
  hdModule,
  areas,
  roleOptions,
  onSave,
  loading,
}: Props) {
  // ===================================================================================
  const initialRolHd = hdModule?.rol ?? undefined;
  const initialHdSubareaId = hdModule?.subarea?.id ?? undefined;
  const initialHdAreasAdmin = hdModule?.admin_area_ids ?? [];
  const initialHdAreaId = hdModule?.subarea?.area?.id ?? undefined;

  const rolHd: string | undefined =
    Form.useWatch(["hd", "rol"], formModules) ?? initialRolHd;
  const areaIdVinculo: number | undefined =
    Form.useWatch(["hd", "area_id"], formModules) ?? initialHdAreaId;
  const subareaIdVinculo: number | undefined =
    Form.useWatch(["hd", "subarea_id"], formModules) ?? initialHdSubareaId;

  const areaOptions = areas.map((a) => ({ label: a.nombre, value: a.id }));

  const [subareas, setSubareas] = useState<HD_Subarea[]>([]);
  const [loadingSubareas, setLoadingSubareas] = useState(false);

  // ===================================================================================
  useEffect(() => {
    let cancel = false;
    const load = async (areaId?: number) => {
      if (!areaId) {
        setSubareas([]);
        return;
      }
      setLoadingSubareas(true);
      try {
        const data = await getSubareas(areaId);
        if (!cancel) setSubareas(data || []);
      } catch {
        if (!cancel) setSubareas([]);
      } finally {
        if (!cancel) setLoadingSubareas(false);
      }
    };
    load(areaIdVinculo ?? initialHdAreaId);
    return () => {
      cancel = true;
    };
  }, [areaIdVinculo, initialHdAreaId]);

  // ===================================================================================
  useEffect(() => {
    if (
      subareaIdVinculo != null &&
      subareas.length > 0 &&
      !subareas.some((s) => s.id === subareaIdVinculo)
    ) {
      formModules.setFieldValue(["hd", "subarea_id"], undefined);
    }
  }, [subareas, formModules, subareaIdVinculo]);

  // ===================================================================================
  const subareaOptions = subareas.map((s) => ({
    label: s.nombre,
    value: s.id,
  }));

  // ===================================================================================
  return (
    <div className="space-y-4">
      <Form form={formModules} layout="vertical">
        <Form.Item label="Rol" name={["hd", "rol"]} initialValue={initialRolHd}>
          <Select
            value={rolHd}
            onChange={(v) => formModules.setFieldValue(["hd", "rol"], v)}
            options={roleOptions}
            placeholder="Seleccione rol"
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Área"
          name={["hd", "area_id"]}
          initialValue={initialHdAreaId}
          tooltip="Área dueña de la subárea"
        >
          <Select
            onChange={(id) =>
              formModules.setFieldValue(["hd", "area_id"], id ?? undefined)
            }
            options={areaOptions}
            placeholder="Seleccione un área"
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Subárea"
          name={["hd", "subarea_id"]}
          initialValue={initialHdSubareaId}
          tooltip="Subárea vinculada"
        >
          <Select
            onChange={(id) =>
              formModules.setFieldValue(["hd", "subarea_id"], id ?? undefined)
            }
            options={subareaOptions}
            placeholder={
              areaIdVinculo
                ? loadingSubareas
                  ? "Cargando subáreas…"
                  : "Seleccione una subárea"
                : "Seleccione primero un área"
            }
            allowClear
            disabled={!areaIdVinculo || loadingSubareas}
            loading={loadingSubareas}
          />
        </Form.Item>

        {rolHd === "nivel_5" ? (
          <Alert
            type="info"
            showIcon
            message="Administra todas las áreas"
            description="Con el rol nivel_5 no es necesario seleccionar áreas administradas."
          />
        ) : rolHd === "nivel_4" ? (
          <Form.Item
            label="Áreas administradas"
            name={["hd", "areas_id"]}
            initialValue={initialHdAreasAdmin}
          >
            <Select
              mode="multiple"
              onChange={(ids) =>
                formModules.setFieldValue(["hd", "areas_id"], ids ?? [])
              }
              options={areaOptions}
              placeholder="Seleccione áreas"
              allowClear
              maxTagCount="responsive"
            />
          </Form.Item>
        ) : null}

        <Button type="primary" loading={loading} onClick={onSave}>
          Guardar
        </Button>
      </Form>
    </div>
  );
}
