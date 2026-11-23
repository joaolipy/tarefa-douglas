import { Op, type WhereOptions } from "sequelize";
import { Autor, Livro } from "../../entities";
import type { PageQuery } from "../../utils/pagination";
import type { AutorInput, AutorRecord } from "../contracts/records";
import type { AutorRepository } from "../contracts/Repository";
import { SequelizeRepository } from "./SequelizeRepository";

export class SequelizeAutorRepository
  extends SequelizeRepository<Autor, AutorRecord, AutorInput, AutorInput>
  implements AutorRepository
{
  constructor() {
    super(Autor);
  }

  protected toRecord(entity: Autor): AutorRecord {
    return {
      id: entity.id,
      nome: entity.nome,
      nacionalidade: entity.nacionalidade,
      biografia: entity.biografia,
    };
  }

  protected searchWhere(query: PageQuery): WhereOptions | undefined {
    if (!query.search) return undefined;
    const like = `%${query.search}%`;
    return { [Op.or]: [{ nome: { [Op.like]: like } }, { nacionalidade: { [Op.like]: like } }] };
  }

  countLivros(autorId: number): Promise<number> {
    return Livro.count({ where: { autorId } });
  }

  async findByNome(nome: string): Promise<AutorRecord | null> {
    const entity = await Autor.findOne({ where: { nome } });
    return entity ? this.toRecord(entity) : null;
  }
}
