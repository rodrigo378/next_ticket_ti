// components/DrawerModulo.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Drawer, Collapse, Select, Button, Alert, Form } from "antd";
import type { FormInstance } from "antd";
import { getSubareas } from "@/features/hd/service/area";
import { HD_Area } from "@interfaces/hd";

export interface UsuarioModuloConfigModule {
  codigo: string; // "ADM" | "HD" | otros
  nombre: string;
  acceso: boolean;
  rol: string | null;
  subarea?: {
    id: number;
    nombre: string;
    area: { id: number; nombre: string; abreviado: string };
  } | null;
  admin_area_ids?: number[]; // áreas administrables para HD
}
export interface UsuarioModuloConfig {
  user: { id: number; nombre: string; apellidos: string; email: string };
  modules: UsuarioModuloConfigModule[];
}

/** Subárea local simple */
export interface HD_Subarea {
  id: number;
  nombre: string;
  area_id: number;
  area?: { id: number; nombre: string; abreviado: string };
}

type Props = {
  open: boolean;
  onClose: () => void;
  formModules: FormInstance;

  /** del endpoint nuevo */
  modules: UsuarioModuloConfigModule[];
  areas: HD_Area[];

  onFinishModulos: (values: {
    adm?: { rol?: string };
    hd?: {
      rol?: string;
      area_id?: number;
      subarea_id?: number;
      areas_id?: number[];
    };
  }) => void;
};

export default function DrawerModulosUsuario({
  open,
  onClose,
  formModules,
  modules,
  areas,
  onFinishModulos,
}: Props) {
  // Busca módulos por código (si viene vacío no crashea)
  const adm = useMemo(() => modules.find((m) => m.codigo === "ADM"), [modules]);
  const hd = useMemo(() => modules.find((m) => m.codigo === "HD"), [modules]);

  // console.log("=============");
  // console.log("adm => ", adm);
  // console.log("hd => ", hd);
  // console.log("=============");

  const initialRolAdm = adm?.rol ?? undefined;
  const initialRolHd = hd?.rol ?? undefined;
  const initialHdSubareaId = hd?.subarea?.id ?? undefined;
  const initialHdAreasAdmin = hd?.admin_area_ids ?? [];

  // Deriva el área inicial desde la subárea o desde el objeto subarea.area
  const initialHdAreaId = hd?.subarea?.area?.id ?? undefined;

  // Watch (la fuente de verdad es el form)
  const rolAdm: string | undefined =
    Form.useWatch(["adm", "rol"], formModules) ?? initialRolAdm;
  const rolHd: string | undefined =
    Form.useWatch(["hd", "rol"], formModules) ?? initialRolHd;

  // Vinculación principal (un área + una subárea)
  const areaIdVinculo: number | undefined =
    Form.useWatch(["hd", "area_id"], formModules) ?? initialHdAreaId;
  const subareaIdVinculo: number | undefined =
    Form.useWatch(["hd", "subarea_id"], formModules) ?? initialHdSubareaId;

  // Áreas administradas (sólo si N4 normalmente)
  const areasAdminIds: number[] =
    Form.useWatch(["hd", "areas_id"], formModules) ?? initialHdAreasAdmin;

  const areaOptions = areas.map((a) => ({ label: a.nombre, value: a.id }));

  // --- SUBÁREAS: vienen filtradas desde el backend por área ---
  const [subareas, setSubareas] = useState<HD_Subarea[]>([]);
  const [loadingSubareas, setLoadingSubareas] = useState(false);

  // Cargar subáreas cuando cambia el área, o al abrir con valor inicial
  useEffect(() => {
    let cancel = false;

    const load = async (areaId?: number) => {
      if (!areaId) {
        setSubareas([]);
        return;
      }
      setLoadingSubareas(true);
      try {
        const data = await getSubareas(areaId); // <-- tu servicio ya devuelve filtrado
        if (!cancel) setSubareas(data || []);
      } catch (e) {
        if (!cancel) setSubareas([]);
        console.error("getSubareas error => ", e);
      } finally {
        if (!cancel) setLoadingSubareas(false);
      }
    };

    // preferimos el valor del form; si no, el initial
    load(areaIdVinculo ?? initialHdAreaId);

    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaIdVinculo, initialHdAreaId]);

  const subareaOptions = subareas.map((s) => ({
    label: s.nombre,
    value: s.id,
  }));

  // Si la subárea actual ya no pertenece a la lista recibida del back, limpiarla
  useEffect(() => {
    if (
      subareaIdVinculo != null &&
      subareas.length > 0 &&
      !subareas.some((s) => s.id === subareaIdVinculo)
    ) {
      formModules.setFieldValue(["hd", "subarea_id"], undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subareas]);

  const roleOptions = [
    { label: "nivel_1", value: "nivel_1" },
    { label: "nivel_2", value: "nivel_2" },
    { label: "nivel_3", value: "nivel_3" },
    { label: "nivel_4", value: "nivel_4" },
    { label: "nivel_5", value: "nivel_5" },
    { label: "administrativo", value: "administrativo" },
    { label: "estudiante", value: "estudiante" },
  ];

  // ADM
  const handleAdmRolChange = (next: string) => {
    formModules.setFieldValue(["adm", "rol"], next);
  };

  // HD
  const handleHdRolChange = (next: string) => {
    formModules.setFieldValue(["hd", "rol"], next);

    // N5: admin de todas las áreas → no necesita "Áreas administradas"
    if (next === "nivel_5" || next === "N5") {
      formModules.setFieldValue(["hd", "areas_id"], []);
      return;
    }
    // otras reglas se gestionan en UI
  };

  // Cambio de área (vínculo)
  const handleHdAreaVinculoChange = (id?: number) => {
    formModules.setFieldValue(["hd", "area_id"], id ?? undefined);
    // al cambiar área, subárea puede volverse inválida, pero se limpia en el efecto de subáreas
  };

  // Cambio de subárea (vínculo)
  const handleHdSubareaVinculoChange = (subId?: number) => {
    formModules.setFieldValue(["hd", "subarea_id"], subId ?? undefined);
  };

  // Cambio de "Áreas administradas"
  const handleHdAreasAdminChange = (ids: number[] | undefined) => {
    formModules.setFieldValue(["hd", "areas_id"], ids ?? []);
  };

  const items = [
    {
      key: "ADM",
      label: "Administrador (ADM)",
      children: (
        <div className="space-y-4">
          <Form form={formModules} layout="vertical" onFinish={onFinishModulos}>
            <Form.Item
              label="Rol"
              name={["adm", "rol"]}
              initialValue={initialRolAdm}
            >
              <Select<string>
                value={rolAdm}
                onChange={handleAdmRolChange}
                options={roleOptions}
                placeholder="Seleccione rol"
                allowClear
              />
            </Form.Item>

            <Button type="primary" onClick={() => formModules.submit()}>
              Guardar
            </Button>
          </Form>
        </div>
      ),
    },
    {
      key: "HD",
      label: "Mesa de ayuda (HD)",
      children: (
        <div className="space-y-4">
          <Form form={formModules} layout="vertical" onFinish={onFinishModulos}>
            {/* 1) ROL */}
            <Form.Item
              label="Rol"
              name={["hd", "rol"]}
              initialValue={initialRolHd}
            >
              <Select<string>
                value={rolHd}
                onChange={handleHdRolChange}
                options={roleOptions}
                placeholder="Seleccione rol"
                allowClear
              />
            </Form.Item>

            {/* 2) VINCULACIÓN: ÁREA (una) */}
            <Form.Item
              label="Área"
              name={["hd", "area_id"]}
              initialValue={initialHdAreaId}
              tooltip="Área a la que pertenece la subárea del usuario"
            >
              <Select<number>
                // value={areaIdVinculo}
                onChange={(id) => handleHdAreaVinculoChange(id)}
                options={areaOptions}
                placeholder="Seleccione un área"
                allowClear
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* 3) VINCULACIÓN: SUBÁREA (una) */}
            <Form.Item
              label="Subárea"
              name={["hd", "subarea_id"]}
              initialValue={initialHdSubareaId}
              tooltip="Subárea específica del usuario (se carga desde el backend según el área)"
            >
              <Select<number>
                // value={subareaIdVinculo}
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

            {/* 4) ÁREAS ADMINISTRADAS */}
            {rolHd === "nivel_5" || rolHd === "N5" ? (
              <Alert
                type="info"
                showIcon
                message="Administra todas las áreas"
                description="Con el rol nivel_5/N5 no es necesario seleccionar áreas administradas."
              />
            ) : rolHd === "nivel_4" || rolHd === "N4" ? (
              <Form.Item
                label="Áreas administradas"
                name={["hd", "areas_id"]}
                initialValue={initialHdAreasAdmin}
              >
                <Select<number[]>
                  mode="multiple"
                  value={areasAdminIds}
                  onChange={handleHdAreasAdminChange}
                  options={areaOptions}
                  placeholder="Seleccione áreas"
                  allowClear
                  style={{ width: "100%" }}
                  maxTagCount="responsive"
                />
              </Form.Item>
            ) : null}

            <Button type="primary" onClick={() => formModules.submit()}>
              Guardar
            </Button>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <Drawer
      title="Perfiles por módulo"
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
    >
      <Collapse items={items} defaultActiveKey={items.map((i) => i.key)} />
    </Drawer>
  );
}
