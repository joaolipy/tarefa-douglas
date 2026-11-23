import type { Page, PageQuery } from "../utils/pagination";

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

export interface TokenService {
  sign(userId: number): string;
  verify(token: string): number;
}

export interface CrudService<TRecord, TCreate, TUpdate> {
  list(query: PageQuery): Promise<Page<TRecord>>;
  getById(id: number): Promise<TRecord>;
  create(input: TCreate): Promise<TRecord>;
  update(id: number, input: TUpdate): Promise<TRecord>;
  remove(id: number): Promise<void>;
}

export interface UserResponse {
  id: number;
  nome: string;
  email: string;
  cpf: string;
}

export interface LoginResult {
  token: string;
  user: UserResponse;
}
