import { Core_Ubigeo_Departamento } from "./core_ubigeo_departamento";
import { Core_Ubigeo_Provincia } from "./core_ubigeo_provincia";

export interface Core_Ubigeo_Distrito {
  id: string;
  nombre?: string | null;
  provincia_id?: string | null;
  departamento_id?: string | null;

  provincia?: Core_Ubigeo_Provincia | null;
  departamento?: Core_Ubigeo_Departamento | null;
}
