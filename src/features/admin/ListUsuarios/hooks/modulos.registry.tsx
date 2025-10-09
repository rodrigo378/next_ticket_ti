// src/features/admin/ListUsuarios/hooks/modulos.registry.ts

import {
  normalizeADM,
  normalizeAPI,
  normalizeHD,
  normalizeTP,
} from "./modulos.normalize";

// ===================================================================================
export type FormValues = {
  adm?: { rol?: string };
  hd?: {
    rol?: string;
    areas_id?: number[];
    subarea_id?: number;
    area_id?: number;
  };
  tp?: { rol?: string };
  api?: { rol?: string };
};

// ===================================================================================
export const MODULO_REGISTRY = {
  ADM: {
    code: "ADM",
    extract: (v: FormValues) => v.adm,
    normalize: normalizeADM,
  },
  HD: { code: "HD", extract: (v: FormValues) => v.hd, normalize: normalizeHD },
  TP: { code: "TP", extract: (v: FormValues) => v.tp, normalize: normalizeTP },
  API: {
    code: "API",
    extract: (v: FormValues) => v.api,
    normalize: normalizeAPI,
  },
} as const;

export type ModCodigo = keyof typeof MODULO_REGISTRY;
