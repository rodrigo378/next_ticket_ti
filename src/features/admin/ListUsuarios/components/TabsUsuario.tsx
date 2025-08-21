import { Tabs } from "antd";
import TableUsuarioAdministrativo from "./TablaAdministrativo";
import { Usuario } from "@/interface/usuario";

interface Props {
  usuarios: Usuario[];
  showDrawerAdministrativo: () => void;
}

export default function TabsUsuario({
  usuarios,
  showDrawerAdministrativo,
}: Props) {
  return (
    <Tabs
      defaultActiveKey="administrativos"
      items={[
        {
          key: "administrativos",
          label: "Administrativos",
          children: (
            <TableUsuarioAdministrativo
              usuarios={usuarios}
              showDrawerAdministrativo={showDrawerAdministrativo}
            ></TableUsuarioAdministrativo>
          ),
        },
        {
          key: "Alumnos",
          label: "alumnos",
          children: <h1>alumnos</h1>,
        },
      ]}
    ></Tabs>
  );
}
