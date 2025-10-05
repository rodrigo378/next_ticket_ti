// src/services/api/usuario.ts
import { api } from "../api";

const BASE = "/api/admin/admin";

/**
 * GET /api/admin/admin/users
 * El caller define el tipo de respuesta con
 */
export const getUsuarios = async () => {
  const { data } = await api.get(`${BASE}/users`);
  return data;
};

/**
 * POST /api/admin/admin/users/:userId/token?label=...
 */
export const generarTokenUsuario = async (
  userId: number,
  label = "default"
) => {
  const { data } = await api.post(
    `${BASE}/users/${encodeURIComponent(String(userId))}/token`,
    null,
    { params: { label } }
  );
  return data;
};

/**
 * GET /api/admin/admin/items
 */
export const getItems = async () => {
  const { data } = await api.get(`${BASE}/items`);
  return data;
};

/**
 * GET /api/admin/admin/tokens
 */
export const listTokens = async () => {
  const { data } = await api.get(`${BASE}/tokens`);
  return data;
};

/**
 * POST /api/admin/admin/token-items  { token_id, item_id }
 */
export const assignTokenItem = async (token_id: number, item_id: number) => {
  const { data } = await api.post(`${BASE}/token-items`, {
    token_id,
    item_id,
  });
  return data;
};

/**
 * DELETE /api/admin/admin/token-items  { token_id, item_id }
 */
export const revokeTokenItem = async (token_id: number, item_id: number) => {
  const { data } = await api.delete(`${BASE}/token-items`, {
    data: { token_id, item_id },
  });
  return data;
};

/**
 * GET /api/admin/admin/tokens/:tokenId/item-ids  -> number[]
 */
export const getAssignedItemIdsByToken = async (
  token_id: number
): Promise<number[]> => {
  const { data } = await api.get<number[]>(
    `${BASE}/tokens/${encodeURIComponent(String(token_id))}/item-ids`
  );
  return data;
};
