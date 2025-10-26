// features/helpdesk/hooks/useTicketForm.ts
import { useState } from "react";

export function useTicketForm() {
  const [visible, setVisible] = useState(false);
  const [asignadoId, setAsignadoId] = useState<number | undefined>();
  const [prioridadId, setPrioridadId] = useState<number | undefined>();
  const [categoriaId, setCategoriaId] = useState<number | undefined>();

  const open = (preset?: {
    asignado_id?: number;
    prioridad_id?: number;
    categoria_id?: number;
  }) => {
    setAsignadoId(preset?.asignado_id ?? undefined);
    setPrioridadId(preset?.prioridad_id ?? undefined);
    setCategoriaId(preset?.categoria_id ?? undefined);
    setVisible(true);
  };

  const close = () => setVisible(false);

  return {
    visible,
    open,
    close,
    asignadoId,
    setAsignadoId,
    prioridadId,
    setPrioridadId,
    categoriaId,
    setCategoriaId,
  };
}
