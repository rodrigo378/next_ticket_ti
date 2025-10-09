// src/features/admin/ListUsuarios/ListUsuarioView.tsx
"use client";

import { Button, Card, Col, Flex, Input, Row, Tag } from "antd";
import Title from "antd/es/typography/Title";
import { PlusOutlined } from "@ant-design/icons";

import useUsuariosList, { TabKey } from "./hooks/useUsuariosList";
import useUsuarioForm from "./hooks/useUsuarioForm";
import useUsuarioModuloConfig from "./hooks/useUsuarioModuloConfig";
import TabsUsuario from "./components/TabsUsuario";
import DrawerAdministrativo from "./components/DrawerAdministrativo";
import DrawerModulosUsuario from "./components/DrawerModuloUsuario";
import { CoreRol } from "@/const/rol.const";

const { Search } = Input;

export default function ListUsuarioView() {
  const {
    usuarios,
    usuariosFiltrados,
    roles,
    isLoadingUsuarios,
    onChangeTab,
    refetchUsuarios,
    q,
    onSearchChange,
  } = useUsuariosList([CoreRol.SUPERADMIN, CoreRol.ADMINISTRATIVO]);

  const {
    usuario,
    openAdministrativo,
    form,
    showDrawerAdministrativo,
    onCloseAdministrativo,
    onFinishAdministrativo,
    isSavingUsuario,
  } = useUsuarioForm({
    onSaved: () => refetchUsuarios(),
  });

  const {
    usuario_id,
    openModulo,
    showDrawerModulo,
    onCloseModulo,
    formModules,
    areas,
    modules,
    saveModulo,
    savingByModule,
  } = useUsuarioModuloConfig();

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <Card className="mb-4 rounded-2xl">
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} md={12}>
            <Flex vertical gap={4}>
              <Title level={3} style={{ margin: 0 }}>
                Lista de usuarios
              </Title>
              <div className="text-slate-500 text-sm">
                Total cargados: <Tag color="default">{usuarios.length}</Tag> •
                Mostrando:{" "}
                <Tag color="processing">{usuariosFiltrados.length}</Tag>
              </div>
            </Flex>
          </Col>

          <Col xs={24} md={8}>
            <Search
              placeholder="Buscar por nombre, correo, rol…"
              allowClear
              value={q}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ width: "100%" }}
              size="middle"
            />
          </Col>

          <Col xs={24} md={4}>
            <Flex justify="end">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showDrawerAdministrativo()}
                className="w-full md:w-auto"
              >
                Añadir usuario
              </Button>
            </Flex>
          </Col>
        </Row>
      </Card>

      {/* Contenido principal */}
      <Card className="rounded-2xl" bodyStyle={{ padding: 16 }}>
        <TabsUsuario
          usuarios={usuariosFiltrados}
          loading={isLoadingUsuarios}
          onChangeTab={(k: TabKey) => onChangeTab(k)}
          showDrawerAdministrativo={showDrawerAdministrativo}
          showDrawerModulo={showDrawerModulo}
        />
      </Card>

      {/* Drawers */}
      <DrawerAdministrativo
        usuario={usuario}
        roles={roles}
        openAdministrativo={openAdministrativo}
        form={form}
        onCloseAdministrativo={onCloseAdministrativo}
        onFinishAdministrativo={onFinishAdministrativo}
        confirmLoading={isSavingUsuario}
      />

      <DrawerModulosUsuario
        usuario_id={usuario_id}
        open={openModulo}
        onClose={onCloseModulo}
        formModules={formModules}
        modules={modules}
        areas={areas}
        saveModulo={saveModulo}
        savingByModule={savingByModule}
      />
    </div>
  );
}
