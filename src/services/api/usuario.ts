// src/services/api/usuario.ts
import axios from "axios";

const API_UMA_URL = process.env.NEXT_PUBLIC_API_UMA_URL!;

// ===================================================================================
export const getUsuarios = async () => {
  const response = await axios.get(`${API_UMA_URL}/admin/users`, {
    withCredentials: true, // Basic via cookie/sesión
  });
  return response.data;
};

// ===================================================================================
export const generarTokenUsuario = async (
  userId: number,
  label = "default"
) => {
  const response = await axios.post(
    `${API_UMA_URL}/admin/users/${userId}/token`,
    null,
    {
      params: { label },
      withCredentials: true,
    }
  );
  return response.data;
};

// ===================================================================================
export const getItems = async () => {
  const response = await axios.get(`${API_UMA_URL}/admin/items`, {
    withCredentials: true,
  });
  return response.data;
};

// ===================================================================================
export const listTokens = async () => {
  const response = await axios.get(`${API_UMA_URL}/admin/tokens`, {
    withCredentials: true,
  });
  return response.data;
};

// ===================================================================================
export const assignTokenItem = async (token_id: number, item_id: number) => {
  const response = await axios.post(
    `${API_UMA_URL}/admin/token-items`,
    { token_id, item_id },
    { withCredentials: true }
  );
  return response.data;
};

// ===================================================================================
export const revokeTokenItem = async (token_id: number, item_id: number) => {
  const response = await axios.delete(`${API_UMA_URL}/admin/token-items`, {
    data: { token_id, item_id },
    withCredentials: true,
  });
  return response.data;
};

// ===================================================================================
export const getAssignedItemIdsByToken = async (token_id: number) => {
  const response = await axios.get(
    `${API_UMA_URL}/admin/tokens/${token_id}/item-ids`,
    { withCredentials: true }
  );
  return response.data as number[];
};
