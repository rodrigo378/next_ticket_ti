import { Tabs } from "antd";
import TableUsuarioAdministrativo from "./TablaAdministrativo";
import { Usuario } from "@/interface/usuario";
import TableUsuarioAlumno from "./TablaAlumno";

interface Props {
  usuarios: Usuario[];
  showDrawerAdministrativo: (usuario_id: number) => void;
  onChangeTab: (tabKey: string) => void;
}

export default function TabsUsuario({
  usuarios,
  showDrawerAdministrativo,
  onChangeTab,
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
