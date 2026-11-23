import type { Page, PageQuery } from "../../utils/pagination";
import type { AutorInput, AutorRecord, EmprestimoChanges, EmprestimoRecord, LeitorInput, LeitorRecord, LivroInput, LivroRecord, NewEmprestimo, NewUser, UserChanges, UserRecord } from "./records";

export type TransactionContext = object;

export interface UnitOfWork {
  run<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T>;
}

export interface Repository<TRecord, TCreate, TUpdate> {
  findPage(query: PageQuery): Promise<Page<TRecord>>;
  findById(id: number): Promise<TRecord | null>;
  create(values: TCreate, tx?: TransactionContext): Promise<TRecord>;
  update(id: number, values: TUpdate, tx?: TransactionContext): Promise<TRecord | null>;
  delete(id: number, tx?: TransactionContext): Promise<boolean>;
}

export interface UserRepository {
  findById(id: number): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findByCpf(cpf: string): Promise<UserRecord | null>;
  create(values: NewUser): Promise<UserRecord>;
  update(id: number, values: UserChanges): Promise<UserRecord | null>;
}

export interface AutorRepository extends Repository<AutorRecord, AutorInput, AutorInput> {
  countLivros(autorId: number): Promise<number>;
  findByNome(nome: string): Promise<AutorRecord | null>;
}

export interface LivroRepository extends Repository<LivroRecord, LivroInput, LivroInput> {
  setDisponivel(id: number, disponivel: boolean, tx?: TransactionContext): Promise<void>;
  countEmprestimos(livroId: number): Promise<number>;
}

export interface LeitorRepository extends Repository<LeitorRecord, LeitorInput, LeitorInput> {
  findByEmail(email: string): Promise<LeitorRecord | null>;
  findByCpf(cpf: string): Promise<LeitorRecord | null>;
}

export interface EmprestimoRepository extends Repository<EmprestimoRecord, NewEmprestimo, EmprestimoChanges> {
  countAtivosByLeitor(leitorId: number): Promise<number>;
  countByLeitor(leitorId: number): Promise<number>;
}
