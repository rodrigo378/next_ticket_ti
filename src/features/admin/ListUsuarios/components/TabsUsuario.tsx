import { Tabs } from "antd";
import TableUsuarioAdministrativo from "./TablaAdministrativo";
import TableUsuarioAlumno from "./TablaAlumno";
import { Core_Usuario } from "@/interface/core/core_usuario";

interface Props {
  usuarios: Core_Usuario[];
  showDrawerAdministrativo: (usuario_id: number) => void;
  onChangeTab: (tabKey: string) => void;
  showDrawerModulo: (usuario_id: number) => void;
}

export default function TabsUsuario({
  usuarios,
  showDrawerAdministrativo,
  onChangeTab,
  showDrawerModulo,
}: Props) {
  return (
    <Tabs
      defaultActiveKey="administrativos"
      onChange={onChangeTab}
      items={[
        {
          key: "administrativo",
          label: "Administrativos",
          children: (
            <TableUsuarioAdministrativo
              usuarios={usuarios}
              showDrawerAdministrativo={showDrawerAdministrativo}
              showDrawerModulo={showDrawerModulo}
            ></TableUsuarioAdministrativo>
          ),
        },
        {
          key: "alumno",
          label: "Alumnos",
          children: (
            <TableUsuarioAlumno usuarios={usuarios}></TableUsuarioAlumno>
          ),
        },
      ]}
    ></Tabs>
  );
}
