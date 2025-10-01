"use client";

import { Button, Flex } from "antd";
import DrawerAdministrativo from "./components/DrawerAdministrativo";
import TabsUsuario from "./components/TabsUsuario";
import useListUsuario from "./hooks/useListUsuario";
import Title from "antd/es/typography/Title";
import { PlusOutlined } from "@ant-design/icons";
import DrawerModulosUsuario from "./components/DrawerModulo";

export default function ListUsuarioView() {
  const {
    usuario_id,
    usuario,
    usuarios,
    roles,
    openAdministrativo,
    form,
    formModules,
    modules,
    areas,
    onCloseAdministrativo,
    showDrawerAdministrativo,
    onFinishAdministrativo,
    onChangeTab,
    onFinishModulos,
    openModulo,
    onCloseModulo,
    showDrawerModulo,
  } = useListUsuario();

  return (
    <div className="mx-auto p-6 rounded-xl shadow-sm">
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
        onChangeTab={onChangeTab}
        showDrawerModulo={showDrawerModulo}
      />

      <DrawerAdministrativo
        usuario={usuario}
        roles={roles}
        openAdministrativo={openAdministrativo}
        form={form}
        onCloseAdministrativo={onCloseAdministrativo}
        onFinishAdministrativo={onFinishAdministrativo}
      />

      <DrawerModulosUsuario
        usuario_id={usuario_id}
        open={openModulo}
        onClose={onCloseModulo}
        formModules={formModules}
        modules={modules}
        areas={areas}
        onFinishModulos={onFinishModulos}
      />
    </div>
  );
}
