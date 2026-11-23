import type { Includeable, Model, ModelStatic, Order, Transaction, WhereOptions } from "sequelize";
import type { Repository, TransactionContext } from "../contracts/Repository";
import { buildPage, type Page, type PageQuery } from "../../utils/pagination";

export function asTransaction(tx?: TransactionContext): Transaction | undefined {
  return tx as Transaction | undefined;
}

function withoutUndefined(values: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
}

export abstract class SequelizeRepository<
  M extends Model,
  TRecord,
  TCreate extends object,
  TUpdate extends object,
> implements Repository<TRecord, TCreate, TUpdate>
{
  protected readonly model: ModelStatic<M>;

  constructor(model: ModelStatic<M>) {
    this.model = model;
  }

  protected abstract toRecord(entity: M): TRecord;
  protected abstract searchWhere(query: PageQuery): WhereOptions | undefined;

  protected include(): Includeable[] {
    return [];
  }

  protected order(): Order {
    return [["id", "ASC"]];
  }

  protected idOf(entity: M): number {
    return (entity as unknown as { id: number }).id;
  }

  async findPage(query: PageQuery): Promise<Page<TRecord>> {
    const { rows, count } = await this.model.findAndCountAll({
      where: this.searchWhere(query),
      include: this.include(),
      order: this.order(),
      limit: query.limit,
      offset: (query.page - 1) * query.limit,
      distinct: true,
    });
    return buildPage(rows.map((row) => this.toRecord(row)), count, query);
  }

  async findById(id: number): Promise<TRecord | null> {
    const entity = await this.model.findByPk(id, { include: this.include() });
    return entity ? this.toRecord(entity) : null;
  }

  async create(values: TCreate, tx?: TransactionContext): Promise<TRecord> {
    const created = await this.model.create({ ...values } as never, { transaction: asTransaction(tx) });
    const reloaded = await this.model.findByPk(this.idOf(created), {
      include: this.include(),
      transaction: asTransaction(tx),
    });
    if (!reloaded) throw new Error("Registro criado não pôde ser carregado.");
    return this.toRecord(reloaded);
  }

  async update(id: number, values: TUpdate, tx?: TransactionContext): Promise<TRecord | null> {
    const entity = await this.model.findByPk(id, { transaction: asTransaction(tx) });
    if (!entity) return null;
    await entity.update(withoutUndefined(values) as never, { transaction: asTransaction(tx) });
    const reloaded = await this.model.findByPk(id, {
      include: this.include(),
      transaction: asTransaction(tx),
    });
    return reloaded ? this.toRecord(reloaded) : null;
  }

  async delete(id: number, tx?: TransactionContext): Promise<boolean> {
    const entity = await this.model.findByPk(id, { transaction: asTransaction(tx) });
    if (!entity) return false;
    await entity.destroy({ transaction: asTransaction(tx) });
    return true;
  }
}
