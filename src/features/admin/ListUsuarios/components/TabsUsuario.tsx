// src/features/admin/ListUsuarios/components/TabsUsuario.tsx
"use client";

import { Tabs } from "antd";
import TableUsuarioAdministrativo from "./TablaAdministrativo";
import TableUsuarioAlumno from "./TablaAlumno";
import { Core_Usuario } from "@interfaces/core";
import { TabKey } from "../hooks/useUsuariosList";

// ===================================================================================
interface Props {
  usuarios: Core_Usuario[];
  loading?: boolean;
  onChangeTab: (tabKey: TabKey) => void;
  showDrawerAdministrativo: (usuario_id?: number) => void;
  showDrawerModulo: (usuario_id: number) => void;
}

// ===================================================================================
export default function TabsUsuario({
  usuarios,
  loading,
  onChangeTab,
  showDrawerAdministrativo,
  showDrawerModulo,
}: Props) {
  // ===================================================================================
  return (
    <Tabs
      defaultActiveKey="administrativo"
      onChange={(k) => onChangeTab(k as TabKey)}
      items={[
        {
          key: "administrativo",
          label: "Administrativos",
          children: (
            <TableUsuarioAdministrativo
              usuarios={usuarios}
              loading={loading}
              showDrawerAdministrativo={showDrawerAdministrativo}
              showDrawerModulo={showDrawerModulo}
            />
          ),
        },
        {
          key: "alumno",
          label: "Alumnos",
          children: (
            <TableUsuarioAlumno usuarios={usuarios} loading={loading} />
          ),
        },
      ]}
    />
  );
}
