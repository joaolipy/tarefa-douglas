import type {
  AutorInput,
  AutorRecord,
  EmprestimoChanges,
  EmprestimoRecord,
  LeitorInput,
  LeitorRecord,
  LivroInput,
  LivroRecord,
  NewEmprestimo,
  NewUser,
  UserChanges,
  UserRecord,
} from "../repositories/contracts/records";
import type {
  AutorRepository,
  EmprestimoRepository,
  LeitorRepository,
  LivroRepository,
  Repository,
  UnitOfWork,
  UserRepository,
} from "../repositories/contracts/Repository";
import type { PasswordHasher, TokenService } from "../services/contracts";
import { buildPage, type Page, type PageQuery } from "../utils/pagination";
import { normalizarTexto } from "../utils/texto";

export abstract class MemoryRepository<R extends { id: number }, C, U> implements Repository<R, C, U> {
  rows: R[] = [];
  #sequence = 0;

  protected abstract build(id: number, values: C): R;
  protected abstract merge(row: R, values: U): R;

  async findPage(query: PageQuery): Promise<Page<R>> {
    const start = (query.page - 1) * query.limit;
    return buildPage(this.rows.slice(start, start + query.limit), this.rows.length, query);
  }

  async findById(id: number): Promise<R | null> {
    return this.rows.find((row) => row.id === id) ?? null;
  }

  async create(values: C): Promise<R> {
    this.#sequence += 1;
    const row = this.build(this.#sequence, values);
    this.rows.push(row);
    return row;
  }

  async update(id: number, values: U): Promise<R | null> {
    const index = this.rows.findIndex((row) => row.id === id);
    if (index < 0) return null;
    const merged = this.merge(this.rows[index] as R, values);
    this.rows[index] = merged;
    return merged;
  }

  async delete(id: number): Promise<boolean> {
    const before = this.rows.length;
    this.rows = this.rows.filter((row) => row.id !== id);
    return this.rows.length < before;
  }
}

export class MemoryAutores extends MemoryRepository<AutorRecord, AutorInput, AutorInput> implements AutorRepository {
  livros: MemoryLivros | null = null;
  protected build(id: number, values: AutorInput): AutorRecord {
    return { id, ...values };
  }
  protected merge(row: AutorRecord, values: AutorInput): AutorRecord {
    return { ...row, ...values };
  }
  async countLivros(autorId: number): Promise<number> {
    return this.livros?.rows.filter((l) => l.autorId === autorId).length ?? 0;
  }
  async findByNome(nome: string): Promise<AutorRecord | null> {
    return this.rows.find((a) => normalizarTexto(a.nome) === normalizarTexto(nome)) ?? null;
  }
}

export class MemoryLivros extends MemoryRepository<LivroRecord, LivroInput, LivroInput> implements LivroRepository {
  emprestimos: MemoryEmprestimos | null = null;
  constructor(private readonly autores: MemoryAutores) {
    super();
  }
  protected build(id: number, values: LivroInput): LivroRecord {
    const autor = this.autores.rows.find((a) => a.id === values.autorId);
    const record: LivroRecord = { id, disponivel: true, ...values };
    if (autor) record.autor = { id: autor.id, nome: autor.nome };
    return record;
  }
  protected merge(row: LivroRecord, values: LivroInput): LivroRecord {
    return { ...row, ...values };
  }
  async setDisponivel(id: number, disponivel: boolean): Promise<void> {
    const row = this.rows.find((r) => r.id === id);
    if (row) row.disponivel = disponivel;
  }
  async countEmprestimos(livroId: number): Promise<number> {
    return this.emprestimos?.rows.filter((e) => e.livroId === livroId).length ?? 0;
  }
}

export class MemoryLeitores extends MemoryRepository<LeitorRecord, LeitorInput, LeitorInput> implements LeitorRepository {
  protected build(id: number, values: LeitorInput): LeitorRecord {
    return { id, ...values };
  }
  protected merge(row: LeitorRecord, values: LeitorInput): LeitorRecord {
    return { ...row, ...values };
  }
  async findByEmail(email: string): Promise<LeitorRecord | null> {
    return this.rows.find((r) => r.email === email) ?? null;
  }
  async findByCpf(cpf: string): Promise<LeitorRecord | null> {
    return this.rows.find((r) => r.cpf === cpf) ?? null;
  }
}

export class MemoryEmprestimos
  extends MemoryRepository<EmprestimoRecord, NewEmprestimo, EmprestimoChanges>
  implements EmprestimoRepository
{
  protected build(id: number, values: NewEmprestimo): EmprestimoRecord {
    return { id, ...values, dataDevolucao: null, multa: 0, valorAluguel: 0 };
  }
  protected merge(row: EmprestimoRecord, values: EmprestimoChanges): EmprestimoRecord {
    return { ...row, ...values } as EmprestimoRecord;
  }
  async countAtivosByLeitor(leitorId: number): Promise<number> {
    return this.rows.filter((r) => r.leitorId === leitorId && r.dataDevolucao === null).length;
  }
  async countByLeitor(leitorId: number): Promise<number> {
    return this.rows.filter((r) => r.leitorId === leitorId).length;
  }
}

export class MemoryUsers implements UserRepository {
  rows: UserRecord[] = [];
  #sequence = 0;
  async findById(id: number): Promise<UserRecord | null> {
    return this.rows.find((r) => r.id === id) ?? null;
  }
  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.rows.find((r) => r.email === email) ?? null;
  }
  async findByCpf(cpf: string): Promise<UserRecord | null> {
    return this.rows.find((r) => r.cpf === cpf) ?? null;
  }
  async create(values: NewUser): Promise<UserRecord> {
    this.#sequence += 1;
    const row = { id: this.#sequence, ...values };
    this.rows.push(row);
    return row;
  }
  async update(id: number, values: UserChanges): Promise<UserRecord | null> {
    const row = this.rows.find((r) => r.id === id);
    if (!row) return null;
    Object.assign(row, values);
    return row;
  }
}

export const memoryUnitOfWork: UnitOfWork = {
  run: (work) => work({}),
};

export const fakeHasher: PasswordHasher = {
  hash: async (plain) => `hash:${plain}`,
  compare: async (plain, hashed) => hashed === `hash:${plain}`,
};

export const fakeTokens: TokenService = {
  sign: (userId) => `token-${userId}`,
  verify: (token) => Number(token.replace("token-", "")),
};
