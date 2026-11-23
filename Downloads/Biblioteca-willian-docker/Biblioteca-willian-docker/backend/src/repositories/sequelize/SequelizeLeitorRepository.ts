import { Op, type WhereOptions } from "sequelize";
import { LeitorModel } from "../../entities";
import type { PageQuery } from "../../utils/pagination";
import type { LeitorInput, LeitorRecord } from "../contracts/records";
import type { LeitorRepository } from "../contracts/Repository";
import { SequelizeRepository } from "./SequelizeRepository";

export class SequelizeLeitorRepository
  extends SequelizeRepository<LeitorModel, LeitorRecord, LeitorInput, LeitorInput>
  implements LeitorRepository
{
  constructor() {
    super(LeitorModel);
  }

  protected toRecord(entity: LeitorModel): LeitorRecord {
    return {
      id: entity.id,
      nome: entity.nome,
      email: entity.email,
      cpf: entity.cpf,
      telefone: entity.telefone,
    };
  }

  protected searchWhere(query: PageQuery): WhereOptions | undefined {
    if (!query.search) return undefined;
    const like = `%${query.search}%`;
    return {
      [Op.or]: [{ nome: { [Op.like]: like } }, { email: { [Op.like]: like } }, { cpf: { [Op.like]: like } }],
    };
  }

  async findByEmail(email: string): Promise<LeitorRecord | null> {
    const entity = await LeitorModel.findOne({ where: { email } });
    return entity ? this.toRecord(entity) : null;
  }

  async findByCpf(cpf: string): Promise<LeitorRecord | null> {
    const entity = await LeitorModel.findOne({ where: { cpf } });
    return entity ? this.toRecord(entity) : null;
  }
}
