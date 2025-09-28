import { Core_Usuario } from "@/interfaces/core";

enum SexoTipo {
  M,
  F,
}

export interface TP_Ficha {
  id: number;

  usuario_id: number;
  usuario?: Core_Usuario | null;

  codigoEstudiante?: string | null;
  dni?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  nombres?: string | null;
  edad?: number | null;
  sexo?: SexoTipo | null;
  genero?: string | null;
  fechaNacimiento?: Date | null;
  domicilioActual?: string | null;
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

  createdAt?: Date | null;
  updatedAt?: Date | null;
}
