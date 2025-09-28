import { Alert, Button, Form, FormInstance, Select, message } from "antd";
import { UsuarioModuloConfigModule } from "../components/DrawerModulo";
import { HD_Area, HD_Subarea } from "@/interfaces/hd";
import { useEffect, useState } from "react";
import { getSubareas } from "@/services/hd";
import { upsertUsuarioModulo } from "@/services/core/usuario";

type Props = {
  usuario_id: number | null;
  formModules: FormInstance;
  hdModule?: UsuarioModuloConfigModule;
  areas: HD_Area[];
  roleOptions: { label: string; value: string }[];
};

export default function HDPanel({
  usuario_id,
  formModules,
  hdModule,
  areas,
  roleOptions,
}: Props) {
  const [saving, setSaving] = useState(false);

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
      } catch (e) {
        if (!cancel) setSubareas([]);
        console.error("getSubareas error => ", e);
      } finally {
        if (!cancel) setLoadingSubareas(false);
      }
    };
    load(areaIdVinculo ?? initialHdAreaId);
    return () => {
      cancel = true;
    };
  }, [areaIdVinculo, initialHdAreaId]);

  useEffect(() => {
    if (
      subareaIdVinculo != null &&
      subareas.length > 0 &&
      !subareas.some((s) => s.id === subareaIdVinculo)
    ) {
      formModules.setFieldValue(["hd", "subarea_id"], undefined);
    }
  }, [subareas, formModules, subareaIdVinculo]);

  const subareaOptions = subareas.map((s) => ({
    label: s.nombre,
    value: s.id,
  }));

  const handleHdRolChange = (next: string) => {
    formModules.setFieldValue(["hd", "rol"], next);
    if (next === "nivel_5") {
      formModules.setFieldValue(["hd", "areas_id"], []); // N5: no requiere áreas admin
    }
  };

  const handleHdAreaVinculoChange = (id?: number) => {
    formModules.setFieldValue(["hd", "area_id"], id ?? undefined);
  };

  const handleHdSubareaVinculoChange = (subId?: number) => {
    formModules.setFieldValue(["hd", "subarea_id"], subId ?? undefined);
  };

  const handleHdAreasAdminChange = (ids: number[] | undefined) => {
    formModules.setFieldValue(["hd", "areas_id"], ids ?? []);
  };

  const buildHdPayload = () => {
    const rol = formModules.getFieldValue(["hd", "rol"]) as string | undefined;
    const area_id = formModules.getFieldValue(["hd", "area_id"]) as
      | number
      | undefined;
    const subarea_id = formModules.getFieldValue(["hd", "subarea_id"]) as
      | number
      | undefined;
    let areas_id = formModules.getFieldValue(["hd", "areas_id"]) as
      | number[]
      | undefined;

    // Normaliza por reglas
    if (rol === "nivel_5") {
      areas_id = undefined;
    } else if (rol === "nivel_4") {
      if (!areas_id || areas_id.length === 0) areas_id = undefined;
    } else {
      if (areas_id && areas_id.length > 1) areas_id = [areas_id[0]];
      if (!areas_id || areas_id.length === 0) areas_id = undefined;
    }

    // Construye payload SOLO con claves definidas
    const payload: Record<string, unknown> = {};
    if (rol) payload.rol = rol;
    if (typeof area_id === "number") payload.area_id = area_id;
    if (typeof subarea_id === "number") payload.subarea_id = subarea_id;
    if (areas_id) payload.areas_id = areas_id;

    return payload;
  };

  const handleSave = async () => {
    if (!usuario_id) {
      message.error("Primero selecciona un usuario.");
      return;
    }
    const payload = buildHdPayload();
    if (Object.keys(payload).length === 0) {
      message.info("No hay cambios por guardar.");
      return;
    }
    try {
      setSaving(true);

      await upsertUsuarioModulo(usuario_id, "HD", payload); // <-- SOLO HD
      message.success("Configuración de HD actualizada.");
    } catch (e) {
      console.error(e);
      message.error("No se pudo actualizar el módulo HD.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Form form={formModules} layout="vertical">
        <Form.Item label="Rol" name={["hd", "rol"]} initialValue={initialRolHd}>
          <Select
            value={rolHd}
            onChange={handleHdRolChange}
            options={roleOptions}
            placeholder="Seleccione rol"
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="Área"
          name={["hd", "area_id"]}
          initialValue={initialHdAreaId}
          tooltip="Área a la que pertenece la subárea del usuario"
        >
          <Select
            onChange={(id) => handleHdAreaVinculoChange(id)}
            options={areaOptions}
            placeholder="Seleccione un área"
            allowClear
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label="Subárea"
          name={["hd", "subarea_id"]}
          initialValue={initialHdSubareaId}
          tooltip="Subárea específica del usuario (se carga desde el backend según el área)"
        >
          <Select
            onChange={(id) => handleHdSubareaVinculoChange(id)}
            options={subareaOptions}
            placeholder={
              areaIdVinculo
                ? loadingSubareas
                  ? "Cargando subáreas…"
                  : "Seleccione una subárea"
                : "Seleccione primero un área"
            }
            allowClear
            style={{ width: "100%" }}
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
              onChange={handleHdAreasAdminChange}
              options={areaOptions}
              placeholder="Seleccione áreas"
              allowClear
              style={{ width: "100%" }}
              maxTagCount="responsive"
            />
          </Form.Item>
        ) : null}

        <Button type="primary" loading={saving} onClick={handleSave}>
          Guardar
        </Button>
      </Form>
    </div>
  );
}
