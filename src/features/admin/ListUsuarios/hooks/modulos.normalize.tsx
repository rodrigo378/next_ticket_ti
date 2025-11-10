// src/features/admin/ListUsuarios/hooks/modulos.normalizers.ts

// ===================================================================================
// ===================================================================================
export type AdmPayload = { rol?: string };

// ===================================================================================
export type HdPayload = {
  rol?: string;
  areas_id?: number[];
  subarea_id?: number;
  area_id?: number;
};

// ===================================================================================
export type TpPayload = { rol?: string };

// ===================================================================================
export type ApiPayload = { rol?: string };

// ===================================================================================
export type HrPayload = { rol?: string; especialidades?: string[] };

// ===================================================================================
// ===================================================================================
export function normalizeADM(p?: AdmPayload) {
  if (!p?.rol) return null;
  return { rol: p.rol };
}

// ===================================================================================
export function normalizeHD(p?: HdPayload) {
  if (!p?.rol) return null;

  const rol = p.rol;
  let areas_id = Array.isArray(p.areas_id)
    ? p.areas_id.filter(Number.isFinite)
    : undefined;
  const subarea_id =
    typeof p.subarea_id === "number" ? p.subarea_id : undefined;
  const area_id = typeof p.area_id === "number" ? p.area_id : undefined;

  if (rol === "nivel_5" || rol === "N5") {
    areas_id = undefined;
  } else if (rol === "nivel_4" || rol === "N4") {
    if (!areas_id || areas_id.length === 0) areas_id = undefined;
  } else {
    if (areas_id && areas_id.length > 1) areas_id = [areas_id[0]];
    if (!areas_id || areas_id.length === 0) areas_id = undefined;
  }
  return { rol, areas_id, subarea_id, area_id };
}

// ===================================================================================
export function normalizeTP(p?: TpPayload) {
  if (!p?.rol) return null;
  return { rol: p.rol };
}

// ===================================================================================
export function normalizeAPI(p?: ApiPayload) {
  if (!p?.rol) return null;
  return { rol: p.rol };
}

// ===================================================================================
export function normalizeHR(p?: HrPayload) {
  if (!p?.rol || !p?.especialidades || p.especialidades.length === 0)
    return null;

  const rol = p.rol;
  const especialidades = Array.isArray(p.especialidades)
    ? p.especialidades.filter((e) => typeof e === "string" && e.trim() !== "")
    : [];

  if (especialidades.length === 0) return null;

  return { rol, especialidades };
}
