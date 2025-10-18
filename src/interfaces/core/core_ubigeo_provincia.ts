import { Core_Ubigeo_Departamento } from "./core_ubigeo_departamento";
import { Core_Ubigeo_Distrito } from "./core_ubigeo_distrito";

export interface Core_Ubigeo_Provincia {
  id: string;
  nombre: string;
  departamento_id: string;

  departamento?: Core_Ubigeo_Departamento;
  distritos?: Core_Ubigeo_Distrito[];
}
