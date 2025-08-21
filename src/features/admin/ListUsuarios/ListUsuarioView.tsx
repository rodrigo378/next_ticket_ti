"use client";

import DrawerAdministrativo from "./components/DrawerAdministrativo";
import TabsUsuario from "./components/TabsUsuario";
import useListUsuario from "./hooks/useListUsuario";

export default function ListUsuarioView() {
  const {
    usuarios,
    openAdministrativo,
    onCloseAdministrativo,
    showDrawerAdministrativo,
  } = useListUsuario();

  return (
    <div className="mx-auto p-6 bg-white rounded-xl shadow-sm">
      <TabsUsuario
        usuarios={usuarios}
        showDrawerAdministrativo={showDrawerAdministrativo}
      ></TabsUsuario>
      <DrawerAdministrativo
        openAdministrativo={openAdministrativo}
        onCloseAdministrativo={onCloseAdministrativo}
      ></DrawerAdministrativo>
    </div>
  );
}
