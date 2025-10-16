export interface HdArea {
  id: number;

  nombre: string;

  abreviado: string;
}

export interface HdConfig {
  areas: HdArea[];

  rooms: string[];
}

export interface HdModule {
  codigo: string;
  name: string;
  role: string;
  perfil?: Record<string, unknown>;
  configuracion: HdConfig;
}

export const HdConfigDefault: HdConfig = {
  areas: [],
  rooms: [],
};
