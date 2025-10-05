// src/services/api/usuario.ts
import axios from "axios";

/* =============================
 * Usuarios
 * ============================= */

// Obtener todos los usuarios
export const getUsuarios = async () => {
  const response = await axios.get("http://localhost:8000/admin/users", {
    withCredentials: true, // Basic via cookie/sesión
  });
  return response.data;
};

// Generar/Reemitir token único por usuario
export const generarTokenUsuario = async (
  userId: number,
  label = "default"
) => {
  const response = await axios.post(
    `http://localhost:8000/admin/users/${userId}/token`,
    null, // body vacío; el label va como query param
    {
      params: { label },
      withCredentials: true, // requiere Basic (superadmin)
    }
  );
  return response.data; // { id, token_plain, label, owner_user_id, created_at }
};

/* =============================
 * Permisos (Items) y Token-Items
 * ============================= */

// Listar todos los ítems de permiso
export const getItems = async () => {
  const response = await axios.get("http://localhost:8000/admin/items", {
    withCredentials: true,
  });
  return response.data; // ItemOut[]
};

// Listar tokens (metadatos: id, label, owner_user_id, created_at)
export const listTokens = async () => {
  const response = await axios.get("http://localhost:8000/admin/tokens", {
    withCredentials: true,
  });
  return response.data; // TokenOut[]
};

// Asignar permiso a un token
export const assignTokenItem = async (token_id: number, item_id: number) => {
  const response = await axios.post(
    "http://localhost:8000/admin/token-items",
    { token_id, item_id },
    { withCredentials: true }
  );
  return response.data; // TokenItemOut
};

// Revocar permiso de un token
export const revokeTokenItem = async (token_id: number, item_id: number) => {
  const response = await axios.delete(
    "http://localhost:8000/admin/token-items",
    {
      data: { token_id, item_id },
      withCredentials: true,
    }
  );
  return response.data; // { deleted: number }
};

export const getAssignedItemIdsByToken = async (token_id: number) => {
  const response = await axios.get(
    `http://localhost:8000/admin/tokens/${token_id}/item-ids`,
    { withCredentials: true }
  );
  return response.data as number[]; // [item_id, ...]
};

/* =============================
 * (Opcional) Obtener items asignados por token
 * Si agregas en backend: GET /admin/tokens/{token_id}/items -> [item_id,...]
 * ============================= */
// export const getAssignedItemsByToken = async (token_id: number) => {
//   const response = await axios.get(
//     `http://localhost:8000/admin/tokens/${token_id}/items`,
//     { withCredentials: true }
//   );
//   return response.data as number[];
// };
