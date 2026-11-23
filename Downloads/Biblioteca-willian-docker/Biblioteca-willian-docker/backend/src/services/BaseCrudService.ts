import { NotFoundError } from "../errors/AppError";
import type { Repository } from "../repositories/contracts/Repository";
import type { Page, PageQuery } from "../utils/pagination";
import type { CrudService } from "./contracts";

export abstract class BaseCrudService<TRecord extends { id: number }, TInput>
  implements CrudService<TRecord, TInput, TInput>
{
  protected readonly repository: Repository<TRecord, TInput, TInput>;
  protected abstract readonly recurso: string;

  constructor(repository: Repository<TRecord, TInput, TInput>) {
    this.repository = repository;
  }

  list(query: PageQuery): Promise<Page<TRecord>> {
    return this.repository.findPage(query);
  }

  async getById(id: number): Promise<TRecord> {
    const record = await this.repository.findById(id);
    if (!record) throw new NotFoundError(`${this.recurso} não encontrado(a).`);
    return record;
  }

  async create(input: TInput): Promise<TRecord> {
    await this.validarCriacao(input);
    return this.repository.create(input);
  }

  async update(id: number, input: TInput): Promise<TRecord> {
    await this.getById(id);
    await this.validarAtualizacao(id, input);
    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError(`${this.recurso} não encontrado(a).`);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const record = await this.getById(id);
    await this.validarRemocao(record);
    await this.repository.delete(id);
  }

  protected async validarCriacao(_input: TInput): Promise<void> {}

  protected async validarAtualizacao(_id: number, _input: TInput): Promise<void> {}

  protected async validarRemocao(_record: TRecord): Promise<void> {}
}
