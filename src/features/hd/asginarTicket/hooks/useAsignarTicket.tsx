"use client";
import { useUsuario } from "@/context/UserContext";
import { Core_Usuario } from "@interfaces/core";
import { HD_Ticket, TreeNode } from "@interfaces/hd";
import { message } from "antd";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  asignarTicket,
  getArbol,
  getSoporte,
  getTicket,
  getTickets,
} from "@services/hd";

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
    title: c.nombre,
    value: `CAT-${c.id}`,
    selectable: false,
    children: (c.incidencias ?? []).map((i) => ({
      title: `${i.nombre} (${i.tipo === "requerimiento" ? "REQ" : "INC"})`,
      value: `INC-${i.id}`,
      selectable: false,
      children: (i.categorias ?? []).map((k) => ({
        title: k.nombre,
        value: k.id,
        selectable: true,
      })),
    })),
  }));
}

export default function useAsignarTicket() {
  // WS refs
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomsRef = useRef<string[]>([]);
  const tabRef = useRef<string>("sin_asignar");

  // Context (usuario/hd/isReadyApp)
  const { usuario, hd, isReadyApp } = useUsuario();

  // STATE ========================================
  const [tickets, setTickets] = useState<HD_Ticket[]>([]);
  const [ticket, setTicket] = useState<HD_Ticket>();
  const [tabKey, setTabKey] = useState("sin_asignar");
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [usuarios, setUsuarios] = useState<Core_Usuario[]>([]);
  const [asignadoId, setAsignadoId] = useState<number | undefined>();
  const [prioridadId, setPrioridadId] = useState<number | undefined>();

  const [arbol, setArbol] = useState<TreeNode[]>([]);
  const [categoriaId, setCategoriaId] = useState<number>();

  // FETCHS ========================================
  const fetchTickets = async (estados_id?: string[]) => {
    console.log("se fetchTickets => ", estados_id);

    try {
      setLoading(true);
      const data = await getTickets({ me: undefined, estados_id });
      console.log("data => ", data);

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
      const data = await getSoporte(1);
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

  // WS helpers ====================================
  const connectWS = () => {
    if (socketRef.current) return socketRef.current;
    const URL =
      process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000/hd/ws/ticket"; // namespace incluido
    const s = io(URL, { transports: ["websocket"], autoConnect: true });
    socketRef.current = s;
    return s;
  };

  const subscribeCreated = () => {
    const s = connectWS();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (t: any) => {
      console.log("ticket.created =>", t);
      if (tabRef.current === "sin_asignar") {
        setTickets((prev) => [t, ...prev]);
      }
    };
    s.on("ticket.created", handler);
    return () => s.off("ticket.created", handler);
  };

  // Efecto: conectar una vez y preparar rejoin tras reconexión
  useEffect(() => {
    const s = connectWS();

    const onConnect = () => {
      if (joinedRoomsRef.current.length) {
        s.emit("tickets:join", { rooms: joinedRoomsRef.current });
        console.log(
          "[WS] Re-joined rooms tras reconexión =>",
          joinedRoomsRef.current
        );
      }
    };
    s.on("connect", onConnect);

    const unsubCreated = subscribeCreated();

    return () => {
      unsubCreated();
      s.off("connect", onConnect);
      s.disconnect();
      socketRef.current = null;
      joinedRoomsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto: cuando IAM está listo, unirse a las rooms del módulo HD
  useEffect(() => {
    if (!isReadyApp) return;

    const rooms = (hd?.extras?.rooms ?? []).filter(Boolean);
    console.log("Usuario desde contexto =>", usuario);
    console.log("HD rooms =>", rooms);
    console.log("HD áreas =>", hd?.extras?.areas);

    if (!rooms.length) return;
    const s = connectWS();
    s.emit("tickets:join", { rooms });
    joinedRoomsRef.current = rooms;
    console.log("[WS] Joined rooms =>", rooms);
  }, [isReadyApp, hd, usuario]);

  // Efecto: data HTTP (no WS). Re-carga por pestaña.
  useEffect(() => {
    fetchTickets(["1"]);
    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantener tabRef sincronizado para listeners WS
  useEffect(() => {
    tabRef.current = tabKey;
  }, [tabKey]);

  // ONCHANGE ======================================
  const onChangeTabs = (key: string) => {
    console.log("se cambio el tab => ", key);

    setTabKey(key);
    if (key === "sin_asignar") fetchTickets(["1"]);
    else if (key === "asignados") fetchTickets(["2", "3", "4"]);
  };

  const abrirDrawer = async (t: HD_Ticket) => {
    try {
      const data = await getTicket(t.id!);
      setTicket(data);
      setAsignadoId(data.asignado_id ?? undefined);
      setPrioridadId(data.prioridad_id ?? undefined);
      setCategoriaId(data.categoria_id ?? undefined);
      fetchIncidenciaArbol(t.area_id || 0);
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

    const esDerivado =
      Array.isArray(ticket?.derivacionesComoDestino) &&
      ticket.derivacionesComoDestino.length > 0;

    const esTicketEstudiante = ticket?.creado?.rol_id === 3;
    const sinCategoria = !ticket?.categoria_id;

    // Requerir categoría en estos casos
    const requiereCategoria = esDerivado || esTicketEstudiante || sinCategoria;

    if (requiereCategoria && typeof categoriaId !== "number") {
      message.warning("Selecciona una categoría para poder asignar.");
      return;
    }

    const payload: {
      asignado_id: number;
      prioridad_id: number;
      categoria_id?: number;
    } = {
      asignado_id: asignadoId,
      prioridad_id: prioridadId,
      // Si el usuario eligió categoría, envíala SIEMPRE
      ...(typeof categoriaId === "number" ? { categoria_id: categoriaId } : {}),
    };

    console.log("PUT /hd/ticket/asignar payload =>", payload);

    try {
      await asignarTicket(ticket.id, payload);
      message.success("✅ Ticket actualizado correctamente");
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
