import { api } from "../api/axios";
import type { Page } from "../types";

export interface ListParams {
  page: number;
  limit: number;
  search?: string;
  [extra: string]: string | number | boolean | undefined;
}

export function createResourceService<T extends { id: number }>(path: string) {
  return {
    async listar(params: ListParams): Promise<Page<T>> {
      const resposta = await api.get<Page<T>>(path, { params });
      return resposta.data;
    },
    async buscar(id: number): Promise<T> {
      const resposta = await api.get<T>(`${path}/${id}`);
      return resposta.data;
    },
    async criar(payload: Record<string, unknown>): Promise<T> {
      const resposta = await api.post<T>(path, payload);
      return resposta.data;
    },
    async atualizar(id: number, payload: Record<string, unknown>): Promise<T> {
      const resposta = await api.put<T>(`${path}/${id}`, payload);
      return resposta.data;
    },
    async remover(id: number): Promise<void> {
      await api.delete(`${path}/${id}`);
    },
  };
}
