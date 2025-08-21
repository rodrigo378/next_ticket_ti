"use client";

import { Flex } from "antd";
import DrawerAdministrativo from "./components/DrawerAdministrativo";
import TabsUsuario from "./components/TabsUsuario";
import useListUsuario from "./hooks/useListUsuario";
import Title from "antd/es/typography/Title";

export default function ListUsuarioView() {
  const {
    usuarios,
    openAdministrativo,
    onCloseAdministrativo,
    showDrawerAdministrativo,
    form,
  } = useListUsuario();

  return (
    <div className="mx-auto p-6 bg-white rounded-xl shadow-sm">
      <Flex justify="space-between" align="center">
        <div className=" mb-4">
          <Title level={3} style={{ margin: 0 }}>
            Lista de usuarios
          </Title>
        </div>
      </Flex>

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
