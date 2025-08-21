"use client";

import { Button, Flex } from "antd";
import DrawerAdministrativo from "./components/DrawerAdministrativo";
import TabsUsuario from "./components/TabsUsuario";
import useListUsuario from "./hooks/useListUsuario";
import Title from "antd/es/typography/Title";
import { PlusOutlined } from "@ant-design/icons";

export default function ListUsuarioView() {
  const {
    usuario,
    usuarios,
    openAdministrativo,
    form,
    roles,
    areas,
    subareas,

    onCloseAdministrativo,
    showDrawerAdministrativo,
    onFinishAdministrativo,
    fetchSubareas,
  } = useListUsuario();

  return (
    <div className="mx-auto p-6 bg-white rounded-xl shadow-sm">
      <Flex justify="space-between" align="center">
        <div className=" mb-4">
          <Title level={3} style={{ margin: 0 }}>
            Lista de usuarios
          </Title>
        </div>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showDrawerAdministrativo()}
          >
            Añadir usuario
          </Button>
        </div>
      </Flex>

      <TabsUsuario
        usuarios={usuarios}
        showDrawerAdministrativo={showDrawerAdministrativo}
      ></TabsUsuario>

      <DrawerAdministrativo
        openAdministrativo={openAdministrativo}
        onCloseAdministrativo={onCloseAdministrativo}
        form={form}
        usuario={usuario}
        onFinishAdministrativo={onFinishAdministrativo}
        roles={roles}
        areas={areas}
        subareas={subareas}
        fetchSubareas={fetchSubareas}
      ></DrawerAdministrativo>
    </div>
  );
}
