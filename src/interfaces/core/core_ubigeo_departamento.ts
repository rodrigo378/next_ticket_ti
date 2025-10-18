import { Core_Ubigeo_Distrito } from "./core_ubigeo_distrito";
import { Core_Ubigeo_Provincia } from "./core_ubigeo_provincia";

export interface Core_Ubigeo_Departamento {
  id: string;
  nombre: string;

  provincias?: Core_Ubigeo_Provincia[];
  distritos?: Core_Ubigeo_Distrito[];
}
