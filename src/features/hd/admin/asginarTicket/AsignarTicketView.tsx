"use client";

import DrawerTicket from "./components/drawerTicket";
import TabsAdmin from "./components/TabAdmin";
import TicketTableAdmin from "./components/TicketTable";
import useAsignarTicket from "./hooks/useAsignarTicket";

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
      <div className="mx-auto p-6 bg-white rounded-xl shadow-sm">
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
