// components/DrawerModulosUsuario.tsx
"use client";

import { Drawer, Collapse, Select, Button, Alert, Form } from "antd";
import type { FormInstance } from "antd";
import type { HD_Area } from "@/interface/hd/hd_area";

type Props = {
  open: boolean;
  onClose: () => void;
  formModules: FormInstance;

  // Solo para prellenar (no define la UI)
  usuarioModulo: Array<{
    usuario_id: number;
    modulo_id: number;
    rol: string | null;
    perfil: unknown;
    modulo?: {
      id: number;
      nombre: string;
      codigo: string;
      estado: string;
    } | null;
    payload?: { areas_id?: number[] } | null;
  }>;

  areas: HD_Area[];

  // ⬇️ usar esta función del hook para guardar (ruta única idempotente)
  onFinishModulos: (values: {
    adm?: { rol?: string };
    hd?: { rol?: string; areas_id?: number[] };
  }) => void;
};

export default function DrawerModulosUsuario({
  open,
  onClose,
  formModules,
  usuarioModulo,
  areas,
  onFinishModulos,
}: Props) {
  // ADM y HD desde la data (solo para initialValue)
  const adm = usuarioModulo.find(
    (m) => m.modulo?.codigo === "ADM" || m.modulo_id === 1
  );
  const hd = usuarioModulo.find(
    (m) => m.modulo?.codigo === "HD" || m.modulo_id === 2
  );

  const initialRolAdm = adm?.rol ?? undefined;
  const initialRolHd = hd?.rol ?? undefined;
  const initialHdAreasId = hd?.payload?.areas_id ?? [];

  // Watch (fuente de verdad = form). Si no hay módulo, empiezan como undefined.
  const rolAdm: string | undefined =
    Form.useWatch(["adm", "rol"], formModules) ?? initialRolAdm;
  const rolHd: string | undefined =
    Form.useWatch(["hd", "rol"], formModules) ?? initialRolHd;
  const areasIdHd: number[] =
    Form.useWatch(["hd", "areas_id"], formModules) ?? initialHdAreasId;

  const areaOptions = areas.map((a) => ({ label: a.nombre, value: a.id }));

  // ADM
  const handleAdmRolChange = (next: string) => {
    formModules.setFieldValue(["adm", "rol"], next);
  };

  // HD
  const handleHdRolChange = (next: string) => {
    formModules.setFieldValue(["hd", "rol"], next);
    if (next === "nivel_5" || next === "N5") {
      formModules.setFieldValue(["hd", "areas_id"], []);
    } else if (next !== "nivel_4" && next !== "N4") {
      formModules.setFieldValue(
        ["hd", "areas_id"],
        areasIdHd.length ? [areasIdHd[0]] : []
      );
    }
  };

  const handleHdSingleAreaChange = (id?: number) => {
    formModules.setFieldValue(["hd", "areas_id"], id == null ? [] : [id]);
  };

  const roleOptions = [
    { label: "nivel_1", value: "nivel_1" },
    { label: "nivel_2", value: "nivel_2" },
    { label: "nivel_3", value: "nivel_3" },
    { label: "nivel_4", value: "nivel_4" },
    { label: "nivel_5", value: "nivel_5" },
    { label: "administrativo", value: "administrativo" },
    { label: "estudiante", value: "estudiante" },
  ];

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

            {rolHd ? (
              rolHd === "nivel_5" || rolHd === "N5" ? (
                <Alert
                  type="info"
                  showIcon
                  message="Administra todas las áreas"
                  description="Con el rol nivel_5/N5 no es necesario seleccionar áreas; tendrá acceso total."
                />
              ) : rolHd === "nivel_4" || rolHd === "N4" ? (
                <Form.Item
                  label="Áreas"
                  name={["hd", "areas_id"]}
                  initialValue={initialHdAreasId}
                >
                  <Select<number[]>
                    mode="multiple"
                    value={areasIdHd}
                    onChange={(ids) =>
                      formModules.setFieldValue(["hd", "areas_id"], ids)
                    }
                    options={areaOptions}
                    placeholder="Seleccione áreas"
                    allowClear
                    style={{ width: "100%" }}
                    maxTagCount="responsive"
                  />
                </Form.Item>
              ) : (
                <>
                  {/* 👈 Registrar el campo en el Form para que salga en onFinish */}
                  <Form.Item
                    name={["hd", "areas_id"]}
                    initialValue={initialHdAreasId}
                    hidden
                  >
                    <input />
                  </Form.Item>

                  <Form.Item label="Área">
                    <Select<number>
                      value={areasIdHd[0]}
                      onChange={(id) =>
                        formModules.setFieldValue(
                          ["hd", "areas_id"],
                          id == null ? [] : [id]
                        )
                      }
                      options={areaOptions}
                      placeholder="Seleccione un área"
                      allowClear
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </>
              )
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
