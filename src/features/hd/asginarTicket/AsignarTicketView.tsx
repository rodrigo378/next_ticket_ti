"use client";

import { Flex, Typography } from "antd";
import DrawerTicket from "./components/drawerTicket";
import TabsAdmin from "./components/TabAdmin";
import TicketTableAdmin from "./components/TicketTable";
import useAsignarTicket from "./hooks/useAsignarTicket";
import Title from "antd/es/typography/Title";
const { Text } = Typography;

export default function AsignarTicketView() {
  const {
    categoriaId,
    setCategoriaId,

    arbol,

    tabKey,
    tickets,
    ticket,
    loading,
    drawerVisible,
    setDrawerVisible,
    asignadoId,

    usuarios,

    prioridadId,
    setPrioridadId,

    setAsignadoId,
    onChangeTabs,
    abrirDrawer,
    handleActualizar,
  } = useAsignarTicket();

  return (
    <>
      <div className="mx-auto p-6 rounded-xl shadow-sm">
        <Flex justify="space-between" align="center">
          <div className=" mb-4">
            <Title level={3} style={{ margin: 0 }}>
              Asignar Especialista
            </Title>
            <Text type="secondary">Asignar especialista y prioridad</Text>
          </div>
        </Flex>

        <TabsAdmin tabKey={tabKey} onChangeTabs={onChangeTabs}></TabsAdmin>

        <TicketTableAdmin
          tickets={tickets}
          loading={loading}
          abrirDrawer={abrirDrawer}
        ></TicketTableAdmin>

        <DrawerTicket
          categoriaId={categoriaId}
          setCategoriaId={setCategoriaId}
          arbol={arbol}
          ticket={ticket!}
          drawerVisible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
          asignadoId={asignadoId!}
          setAsignadoId={setAsignadoId}
          usuarios={usuarios}
          prioridadId={prioridadId!}
          setPrioridadId={setPrioridadId}
          handleActualizar={handleActualizar}
        ></DrawerTicket>
      </div>
    </>
  );
}
