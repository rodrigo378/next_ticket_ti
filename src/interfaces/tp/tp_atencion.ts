import { Core_Usuario } from "@/interfaces/core";
import { TP_AtencionDetalle } from "./tp_atencionDetalle";
import { TP_Consentimiento } from "./tp_consentimiento";
enum PersonaTipo {
  ADMINISTRATIVO,
  ALUMNO,
  TERCERO,
}

enum SexoTipo {
  M,
  F,
}

export interface TP_Atencion {
  id: number;

  tipoPersona: PersonaTipo;

  usuario_id?: number | null;
  usuario?: Core_Usuario | null;

  nombre: string;
  apellidos: string;
  dni: string;
  sexo?: SexoTipo | null;
  edad?: number | null;

  fecha: Date;
  hora: Date;
  escalaDolor?: number | null;

  tiempoEnfermedad?: string | null;
  motivoConsulta?: string | null;
  antecedentes?: string | null;

  pa?: string | null;
  fc?: string | null;
  fr?: string | null;
  sat_o2?: string | null;
  temp?: string | null;

  medicacion?: string | null;
  indicaciones?: string | null;

  firmaPersonalSalud?: string | null;
  firmaPaciente?: string | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;

  detalles?: TP_AtencionDetalle[];
  consentimientos?: TP_Consentimiento[];
}
