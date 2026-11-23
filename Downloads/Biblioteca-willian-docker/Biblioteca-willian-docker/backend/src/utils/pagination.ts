import { TIPOS_ITEM, type TipoItem } from "../domain";

export interface PageQuery {
  page: number;
  limit: number;
  search?: string;
  disponivel?: boolean;
  autorId?: number;
  genero?: string;
  ano?: number;
  tipo?: TipoItem;
}

export interface Page<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RawQuery {
  [key: string]: unknown;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function toPositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function parsePageQuery(query: RawQuery): PageQuery {
  const page = toPositiveInt(query.page, 1);
  const limit = Math.min(toPositiveInt(query.limit, DEFAULT_LIMIT), MAX_LIMIT);
  const search = typeof query.search === "string" && query.search.trim() ? query.search.trim() : undefined;

  const result: PageQuery = { page, limit };
  if (search) result.search = search;
  if (query.disponivel === "true") result.disponivel = true;
  if (query.disponivel === "false") result.disponivel = false;

  const autorId = toPositiveInt(query.autorId, 0);
  if (autorId > 0) result.autorId = autorId;
  const ano = toPositiveInt(query.ano, 0);
  if (ano > 0) result.ano = ano;
  if (typeof query.genero === "string" && query.genero.trim()) result.genero = query.genero.trim();
  const tipo = TIPOS_ITEM.find((item) => item === query.tipo);
  if (tipo) result.tipo = tipo;
  return result;
}

export function buildPage<T>(data: T[], total: number, query: PageQuery): Page<T> {
  return {
    data,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}
