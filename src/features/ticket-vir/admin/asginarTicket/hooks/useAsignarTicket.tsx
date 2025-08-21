"use client";
import { TreeNode } from "@/interface/incidencia";
import { Ticket } from "@/interface/ticket_ti";
import { Usuario } from "@/interface/usuario";
import { getUsuarios } from "@/services/admin";
import { getArbol } from "@/services/incidencias";
import { asignarTicket, getTicket, getTickets } from "@/services/ticket_ti";
import { message } from "antd";
import { useEffect, useState } from "react";

export type IncTreeNode = {
  title: string;
  value: string | number;
  selectable?: boolean;
  children?: IncTreeNode[];
};

type ArbolRespuesta = Array<{
  id: number;
  nombre: string;
  area: { id: number; nombre: string } | null;
  incidencias: Array<{
    id: number;
    nombre: string;
    tipo: "incidencia" | "requerimiento";
    categorias: Array<{ id: number; nombre: string }>;
  }>;
}>;

export function buildTreeData(cats: ArbolRespuesta): IncTreeNode[] {
  return (cats ?? []).map((c) => ({
    title: c.nombre, // 🔹 sin área
    value: `CAT-${c.id}`,
    selectable: false,
    children: (c.incidencias ?? []).map((i) => ({
      title: `${i.nombre} (${i.tipo === "requerimiento" ? "REQ" : "INC"})`,
      value: `INC-${i.id}`,
      selectable: false,
      children: (i.categorias ?? []).map((k) => ({
        title: k.nombre,
        value: k.id, // 🔹 hoja = id categoría
        selectable: true,
      })),
    })),
  }));
}

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

  const [arbol, setArbol] = useState<TreeNode[]>([]);
  const [categoriaId, setCategoriaId] = useState<number>();

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

  const fetchIncidenciaArbol = async (area_id: number) => {
    try {
      const data = await getArbol(area_id);
      setArbol(buildTreeData(data));
    } catch (error) {
      console.error("error => ", error);
    }
  };

  // USEEFECT ========================================
  useEffect(() => {
    fetchTickets(["1"]);
    fetchUsuarios();
  }, []);

  // ONCHANGE ========================================
  const onChangeTabs = (key: string) => {
    setTabKey(key);
    if (key === "sin_asignar") fetchTickets(["1"]);
    else if (key === "asignados") fetchTickets(["2", "3", "4"]);
  };

  const abrirDrawer = async (ticket: Ticket) => {
    console.log("se abrio drawer");

    try {
      const data = await getTicket(ticket.id!);
      console.log("data => ", data);

      setTicket(data);
      setAsignadoId(data.asignado_id ?? undefined);
      setPrioridadId(data.prioridad_id ?? undefined);

      fetchIncidenciaArbol(ticket.area_id || 0);

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

    // ✅ Detecta si el ticket es derivado (tiene orígenes)
    const isDerivado =
      Array.isArray(ticket?.DerivacionesComoDestino) &&
      ticket.DerivacionesComoDestino.length > 0;

    // ✅ Si es derivado, categoría es obligatoria
    if (isDerivado && !categoriaId) {
      message.warning("Selecciona la categoría para el ticket derivado.");
      return;
    }

    try {
      await asignarTicket(ticket.id, {
        asignado_id: asignadoId,
        prioridad_id: prioridadId,
        // Solo manda categoria_id cuando es derivado
        ...(isDerivado ? { categoria_id: categoriaId } : {}),
      });

      message.success("✅ Ticket actualizado correctamente");
      // Refresca según la pestaña actual
      fetchTickets(tabKey === "sin_asignar" ? ["1"] : ["2", "3", "4"]);
      setDrawerVisible(false);
    } catch (error) {
      console.error("error =>", error);
      message.error("❌ Error al actualizar el ticket");
    }
  };

  return {
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
    setAsignadoId,

    usuarios,

    prioridadId,
    setPrioridadId,

    onChangeTabs,
    abrirDrawer,
    handleActualizar,
  };
}
