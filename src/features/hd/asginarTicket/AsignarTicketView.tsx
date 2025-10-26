// features/helpdesk/components/AsignarTicketView.tsx
"use client";

import React from "react";
import { Flex, Typography } from "antd";
import Title from "antd/es/typography/Title";

import type { HD_Ticket } from "@interfaces/hd";
import { message } from "antd";
import { useAsignarTabs } from "./hooks/useAsignarTabs";
import { useTicketsQuery } from "./hooks/useTicketsQuery";
import { useUsuariosSoporteQuery } from "./hooks/useUsuariosSoporteQuery";
import { useTicketForm } from "./hooks/useTicketForm";
import { useTicketDetalleQuery } from "./hooks/useTicketDetalleQuery";
import { useArbolIncidenciasQuery } from "./hooks/useArbolIncidenciasQuery";
import { useAsignarTicketMutation } from "./hooks/useAsignarTicketMutation";
import TabsAdmin from "./components/TabAdmin";
import TicketTableAdmin from "./components/TicketTable";
import DrawerTicket from "./components/drawerTicket";

const { Text } = Typography;

export default function AsignarTicketView() {
  // 1) Tabs (estado local)
  const { tabKey, estados_id, onChangeTabs } = useAsignarTabs();

  // 2) Tickets (server state con useQuery)
  const { data: tickets = [], isLoading } = useTicketsQuery(estados_id);

  // 3) Usuarios soporte
  const { data: usuarios = [] } = useUsuariosSoporteQuery(1);

  // 4) Form (UI Drawer)
  const form = useTicketForm();

  // 5) Ticket seleccionado (detalle con useQuery)
  const [ticketId, setTicketId] = React.useState<number | undefined>(undefined);
  const { data: ticket } = useTicketDetalleQuery(ticketId);

  // 6) Árbol por área del ticket
  const areaId = ticket?.area_id || 0;
  const { data: arbol = [] } = useArbolIncidenciasQuery(areaId);

  // 7) Mutación asignar
  const asignarMut = useAsignarTicketMutation();

  // abrir drawer
  const abrirDrawer = (t: HD_Ticket) => {
    setTicketId(t.id!);
    form.open({
      asignado_id: t.asignado_id ?? undefined,
      prioridad_id: t.prioridad_id ?? undefined,
      categoria_id: t.categoria_id ?? undefined,
    });
  };

  // validar y asignar
  const handleActualizar = async () => {
    if (!ticket || !form.asignadoId || !form.prioridadId) {
      message.warning("Debes seleccionar soporte y prioridad");
      return;
    }

    const esDerivado =
      Array.isArray(ticket?.derivacionesComoDestino) &&
      ticket.derivacionesComoDestino.length > 0;
    const esTicketEstudiante = ticket?.titular?.rol_id === 3;
    const sinCategoria = !ticket?.categoria_id;
    const requiereCategoria = esDerivado || esTicketEstudiante || sinCategoria;

    if (requiereCategoria && typeof form.categoriaId !== "number") {
      message.warning("Selecciona una categoría para poder asignar.");
      return;
    }

    try {
      await asignarMut.mutateAsync({
        ticketId: ticket.id!,
        payload: {
          asignado_id: form.asignadoId,
          prioridad_id: form.prioridadId,
          ...(typeof form.categoriaId === "number"
            ? { categoria_id: form.categoriaId }
            : {}),
        },
      });
      message.success("✅ Ticket actualizado correctamente");
      form.close();
    } catch {
      message.error("❌ Error al actualizar el ticket");
    }
  };

  return (
    <div className="mx-auto p-6 rounded-xl shadow-sm">
      <Flex justify="space-between" align="center">
        <div className="mb-4">
          <Title level={3} style={{ margin: 0 }}>
            Asignar Especialista
          </Title>
          <Text type="secondary">Asignar especialista y prioridad</Text>
        </div>
      </Flex>

      <TabsAdmin tabKey={tabKey} onChangeTabs={onChangeTabs} />

      <TicketTableAdmin
        tickets={tickets}
        loading={isLoading}
        abrirDrawer={abrirDrawer}
      />

      {ticket && (
        <DrawerTicket
          arbol={arbol}
          ticket={ticket}
          drawerVisible={form.visible}
          setDrawerVisible={(v) => (v ? form.open() : form.close())}
          asignadoId={form.asignadoId!}
          setAsignadoId={form.setAsignadoId}
          usuarios={usuarios}
          prioridadId={form.prioridadId!}
          setPrioridadId={form.setPrioridadId}
          categoriaId={form.categoriaId}
          setCategoriaId={form.setCategoriaId}
          handleActualizar={handleActualizar}
        />
      )}
    </div>
  );
}
