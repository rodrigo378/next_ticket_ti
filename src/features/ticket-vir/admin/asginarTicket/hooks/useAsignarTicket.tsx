"use client";
import { Ticket } from "@/interface/ticket_ti";
import { Usuario } from "@/interface/usuario";
import { getUsuarios } from "@/services/admin";
import { asignarTicket, getTicket, getTickets } from "@/services/ticket_ti";
import { message } from "antd";
import { useEffect, useState } from "react";

export default function useAsignarTicket() {
  // USESTATE ========================================
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticket, setTicket] = useState<Ticket>();
  const [tabKey, setTabKey] = useState("sin_asignar");
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [asignadoId, setAsignadoId] = useState<number | undefined>();
  const [prioridadId, setPrioridadId] = useState<number | undefined>();

  // FETCHS ==========================================
  const fetchTickets = async (estados_id?: string[]) => {
    try {
      setLoading(true);
      const data = await getTickets({ me: undefined, estados_id });
      setTickets(data);
    } catch (error) {
      console.error("error => ", error);
      message.error("Error al obtener los tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error("error => ", error);
    }
  };

  // USEEFECT ========================================
  useEffect(() => {
    fetchTickets(["1", "7"]);
    fetchUsuarios();
  }, []);

  // ONCHANGE ========================================
  const onChangeTabs = (key: string) => {
    setTabKey(key);
    if (key === "sin_asignar") fetchTickets(["1", "7"]);
    else if (key === "asignados") fetchTickets(["2", "3", "4"]);
  };

  const abrirDrawer = async (ticket: Ticket) => {
    try {
      const data = await getTicket(ticket.id!);
      setTicket(data);
      setAsignadoId(data.asignado_id ?? undefined);
      setPrioridadId(data.prioridad_id ?? undefined);
      setDrawerVisible(true);
    } catch (error) {
      console.error("Error al obtener detalle del ticket", error);
      message.error("❌ Error al cargar detalle del ticket");
    }
  };

  const handleActualizar = async () => {
    if (!ticket || !asignadoId || !prioridadId) {
      message.warning("Debes seleccionar soporte y prioridad");
      return;
    }

    try {
      await asignarTicket(ticket.id, {
        asignado_id: asignadoId,
        prioridad_id: prioridadId,
      });

      message.success("✅ Ticket actualizado correctamente");
      // Refrescar la pestaña "Sin asignar" para que desaparezca de esa lista
      fetchTickets(["1", "7"]);
      setDrawerVisible(false);
    } catch (error) {
      console.error("error =>", error);
      message.error("❌ Error al actualizar el ticket");
    }
  };

  return {
    tabKey,
    tickets,
    ticket,
    loading,
    drawerVisible,
    setDrawerVisible,

    asignadoId,
    setAsignadoId,

    usuarios,

    prioridadId,
    setPrioridadId,

    onChangeTabs,
    abrirDrawer,
    handleActualizar,
  };
}
