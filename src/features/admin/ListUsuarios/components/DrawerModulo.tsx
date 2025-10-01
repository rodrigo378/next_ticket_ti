// components/DrawerModulo.tsx
"use client";

import { useMemo } from "react";
import { Drawer, Collapse } from "antd";
import type { FormInstance } from "antd";
import { HD_Area } from "@interfaces/hd";
import AdmPanel from "../modulos/adm";
import HDPanel from "../modulos/hd";
import TPPanel from "../modulos/tp";

// ===================================================================================
export interface UsuarioModuloConfigModule {
  codigo: string;
  nombre: string;
  acceso: boolean;
  rol: string | null;
  subarea?: {
    id: number;
    nombre: string;
    area: { id: number; nombre: string; abreviado: string };
  } | null;
  admin_area_ids?: number[];
}

// ===================================================================================
// export interface UsuarioModuloConfig {
//   user: { id: number; nombre: string; apellidos: string; email: string };
//   modules: UsuarioModuloConfigModule[];
// }

type Props = {
  usuario_id: number | null;
  open: boolean;
  onClose: () => void;
  formModules: FormInstance;

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

// ===================================================================================
export default function DrawerModulosUsuario({
  usuario_id,
  open,
  onClose,
  formModules,
  modules,
  areas,
}: Props) {
  const adm = useMemo(() => modules.find((m) => m.codigo === "ADM"), [modules]);
  const hd = useMemo(() => modules.find((m) => m.codigo === "HD"), [modules]);
  const tp = useMemo(() => modules.find((m) => m.codigo === "TP"), [modules]);

  console.log("=========================================================");
  console.log("adm => ", adm);
  console.log("hd => ", hd);
  console.log("tp => ", tp);
  console.log("=========================================================");

  const roleOptionsADM = [
    { label: "Administrativo", value: "administrativo" },
    { label: "Estudiante", value: "estudiante" },
  ];

  const roleOptionsHD = [
    { label: "nivel_1", value: "nivel_1" },
    { label: "nivel_2", value: "nivel_2" },
    { label: "nivel_3", value: "nivel_3" },
    { label: "nivel_4", value: "nivel_4" },
    { label: "nivel_5", value: "nivel_5" },
    { label: "Administrativo", value: "administrativo" },
    { label: "Estudiante", value: "estudiante" },
  ];

  const roleOptionsTP = [
    { label: "Supervisor", value: "supervisor" },
    { label: "Personal de salud", value: "per_salud" },
    { label: "Administrativo", value: "administrativo" },
    { label: "Estudiante", value: "estudiante" },
  ];

  const items = [
    {
      key: "ADM",
      label: "Administrador (ADM)",
      children: (
        <AdmPanel
          usuario_id={usuario_id}
          formModules={formModules}
          initialRolAdm={adm?.rol ?? undefined}
          roleOptions={roleOptionsADM}
        />
      ),
    },
    {
      key: "HD",
      label: "Mesa de ayuda (HD)",
      children: (
        <HDPanel
          usuario_id={usuario_id}
          formModules={formModules}
          hdModule={hd}
          areas={areas}
          roleOptions={roleOptionsHD}
        />
      ),
    },
    {
      key: "TP",
      label: "Topico (TP)",
      children: (
        <TPPanel
          usuario_id={usuario_id}
          formModules={formModules}
          initialRolTp={tp?.rol ?? undefined}
          roleOptions={roleOptionsTP}
        />
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
