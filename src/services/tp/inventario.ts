import { TP_Inventario, TP_InventarioLote } from "@interfaces/tp";
import { api } from "../api";

export const createInventario = async (data: Partial<TP_Inventario>) => {
  const response = await api.post(`/tp/inventario`, data);
  return response.data;
};

export const getInventarios = async () => {
  const response = await api.get(`/tp/inventario`);
  return response.data;
};

export const getInventario = async (inventario_id: number) => {
  const response = await api.get(`/tp/inventario/${inventario_id}`);
  return response.data;
};

export const updateInventario = async (
  inventario_id: number,
  data: Partial<TP_Inventario>
) => {
  const response = await api.put(`/tp/inventario/${inventario_id}`, data);
  return response.data;
};

export const getLotesByInventario = async (inventario_id: number) => {
  const response = await api.get(`/tp/inventario/lote/${inventario_id}`);
  return response.data;
};

export const createLote = async (data: Partial<TP_InventarioLote>) => {
  const response = await api.post(`/tp/inventario/lote`, data);
  return response.data;
};

export const updateLote = async (
  lote_id: number,
  data: Partial<TP_InventarioLote>
) => {
  const response = await api.put(`/tp/inventario/lote/${lote_id}`, data);
  return response.data;
};
