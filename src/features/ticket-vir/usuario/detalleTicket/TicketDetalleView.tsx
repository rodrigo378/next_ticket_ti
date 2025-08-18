"use client";

import CardArchivos from "@/features/ticket-vir/usuario/detalleTicket/components/CardArchivos";
import CardDetalle from "@/features/ticket-vir/usuario/detalleTicket/components/CardDetalle";
import CardMensaje from "@/features/ticket-vir/usuario/detalleTicket/components/CardMensaje";
import CardCalificacion from "@/features/ticket-vir/usuario/detalleTicket/components/CardCalificacion";
import useDetalleTicket from "@/features/ticket-vir/usuario/detalleTicket/hooks/useDetalleTicket";

export default function TicketDetalleView() {
  const {
    ticket,
    nuevoMensaje,
    setNuevoMensaje,
    loadingMensaje,
    handleEnviarMensaje,
    crearCalificacion,
  } = useDetalleTicket();

  const valorCalificado = ticket?.CalificacionTicket?.calificacion ?? 0;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4 bg-white rounded-xl shadow-sm">
      <CardCalificacion
        ticket={ticket}
        valorCalificado={valorCalificado}
        crearCalificacion={crearCalificacion}
      ></CardCalificacion>

      <CardDetalle ticket={ticket}></CardDetalle>

      <CardArchivos ticket={ticket}></CardArchivos>

      <CardMensaje
        ticket={ticket}
        nuevoMensaje={nuevoMensaje}
        loadingMensaje={loadingMensaje}
        setNuevoMensaje={setNuevoMensaje}
        handleEnviarMensaje={() => handleEnviarMensaje()}
      ></CardMensaje>
    </div>
  );
}
