// src/services/api/usuario.ts
import { api } from "../api";

const BASE = "/api/admin/admin";

/**
 * GET /api/admin/admin/users
 * El caller define el tipo de respuesta con <T>
 */
export const getUsuarios = async <T>(): Promise<T> => {
  const { data } = await api.get<T>(`${BASE}/users`);
  return data;
};

/**
 * POST /api/admin/admin/users/:userId/token?label=...
 */
export const generarTokenUsuario = async <T>(
  userId: number,
  label = "default"
): Promise<T> => {
  const { data } = await api.post<T>(
    `${BASE}/users/${encodeURIComponent(String(userId))}/token`,
    null,
    { params: { label } }
  );
  return data;
};

/**
 * GET /api/admin/admin/items
 */
export const getItems = async <T>(): Promise<T> => {
  const { data } = await api.get<T>(`${BASE}/items`);
  return data;
};

/**
 * GET /api/admin/admin/tokens
 */
export const listTokens = async <T>(): Promise<T> => {
  const { data } = await api.get<T>(`${BASE}/tokens`);
  return data;
};

/**
 * POST /api/admin/admin/token-items  { token_id, item_id }
 */
export const assignTokenItem = async <T>(
  token_id: number,
  item_id: number
): Promise<T> => {
  const { data } = await api.post<T>(`${BASE}/token-items`, {
    token_id,
    item_id,
  });
  return data;
};

/**
 * DELETE /api/admin/admin/token-items  { token_id, item_id }
 */
export const revokeTokenItem = async <T>(
  token_id: number,
  item_id: number
): Promise<T> => {
  const { data } = await api.delete<T>(`${BASE}/token-items`, {
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
