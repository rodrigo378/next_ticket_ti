import { Core_Usuario } from "@/interfaces/core";

export enum SexoTipo {
  M = "V",
  F = "F",
}

export enum GeneroTipo {
  M = "M",
  F = "F",
  O = "O",
}

export interface TP_Ficha {
  id: number;

  usuario_id: number;
  usuario?: Core_Usuario | null;

  codigoEstudiante: string; // requerido y único
  dni?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  nombres?: string | null;

  sexo?: SexoTipo | null;
  genero?: GeneroTipo | null;
  fechaNacimiento?: string | Date | null;

  domicilioActual?: string | null;
  departamento?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  ubigeo?: string | null;

  distritoResidencia?: string | null;
  telefonoPersonal?: string | null;
  carreraProfesional?: string | null;
  cicloEstudios?: string | null;

  contactoEmergencia1?: string | null;
  parentescoEmergencia1?: string | null;
  telefonoEmergencia1?: string | null;

  contactoEmergencia2?: string | null;
  parentescoEmergencia2?: string | null;
  telefonoEmergencia2?: string | null;

  tipoSeguro?: string | null;
  seguroOtro?: string | null;

  sufreEnfermedad: boolean;
  enfermedades?: string | null;
  antecedentesFamiliares?: string | null;
  alergias: boolean;
  alergiasDetalle?: string | null;

  peso?: number | null;
  estatura?: number | null;

  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}
