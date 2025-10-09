// src/features/admin/ListUsuarios/components/DrawerModulosUsuario.tsx
"use client";

import { useMemo } from "react";
import { Drawer, Collapse } from "antd";
import type { FormInstance } from "antd";
import { HD_Area } from "@interfaces/hd";
import AdmPanel from "../modulos/adm";
import HDPanel from "../modulos/hd";
import TPPanel from "../modulos/tp";
import APIPanel from "../modulos/api";
import { ADM_ROLES, API_ROLES, HD_ROLES, TP_ROLES } from "@/const/rol.const";

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
type Props = {
  usuario_id: number | null;
  open: boolean;
  onClose: () => void;
  formModules: FormInstance;
  modules: UsuarioModuloConfigModule[];
  areas: HD_Area[];
  saveModulo: (code: "ADM" | "HD" | "TP" | "API") => void;
  savingByModule: Partial<Record<"ADM" | "HD" | "TP" | "API", boolean>>;
};

// ===================================================================================
export default function DrawerModulosUsuario({
  open,
  onClose,
  formModules,
  modules,
  areas,
  saveModulo,
  savingByModule,
}: Props) {
  // ===================================================================================
  const adm = useMemo(() => modules.find((m) => m.codigo === "ADM"), [modules]);
  const hd = useMemo(() => modules.find((m) => m.codigo === "HD"), [modules]);
  const tp = useMemo(() => modules.find((m) => m.codigo === "TP"), [modules]);
  const api = useMemo(() => modules.find((m) => m.codigo === "API"), [modules]);

  // ===================================================================================
  const items = [
    {
      key: "ADM",
      label: "Administrador (ADM)",
      children: (
        <AdmPanel
          formModules={formModules}
          initialRolAdm={adm?.rol ?? undefined}
          roleOptions={ADM_ROLES}
          onSave={() => saveModulo("ADM")}
          loading={!!savingByModule.ADM}
        />
      ),
    },
    {
      key: "HD",
      label: "Mesa de ayuda (HD)",
      children: (
        <HDPanel
          formModules={formModules}
          hdModule={hd}
          areas={areas}
          roleOptions={HD_ROLES}
          onSave={() => saveModulo("HD")}
          loading={!!savingByModule.HD}
        />
      ),
    },
    {
      key: "TP",
      label: "Tópico (TP)",
      children: (
        <TPPanel
          formModules={formModules}
          initialRolTp={tp?.rol ?? undefined}
          roleOptions={TP_ROLES}
          onSave={() => saveModulo("TP")}
          loading={!!savingByModule.TP}
        />
      ),
    },
    {
      key: "API",
      label: "API UMA (API)",
      children: (
        <APIPanel
          formModules={formModules}
          initialRolApi={api?.rol ?? undefined}
          roleOptions={API_ROLES}
          onSave={() => saveModulo("API")}
          loading={!!savingByModule.API}
        />
      ),
    },
  ];

  // ===================================================================================
  return (
    <Drawer
      title="Perfiles por módulo"
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
    >
      <Collapse items={items} defaultActiveKey={[]} />
    </Drawer>
  );
}
