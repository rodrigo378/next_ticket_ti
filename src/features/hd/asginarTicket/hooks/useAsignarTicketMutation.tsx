// features/helpdesk/hooks/useAsignarTicketMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { asignarTicket } from "@services/hd";

type Payload = {
  asignado_id: number;
  prioridad_id: number;
  categoria_id?: number;
};

export function useAsignarTicketMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["asignar-ticket"],
    mutationFn: async ({
      ticketId,
      payload,
    }: {
      ticketId: number;
      payload: Payload;
    }) => {
      await asignarTicket(ticketId, payload);
    },
    onSuccess: (_data, variables) => {
      // refresca lista y detalle del ticket
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["ticket", variables.ticketId] });
    },
  });
}
