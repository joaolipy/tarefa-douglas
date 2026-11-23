import { Op, type Includeable, type Order, type WhereOptions } from "sequelize";
import { Emprestimo, LeitorModel, Livro } from "../../entities";
import type { PageQuery } from "../../utils/pagination";
import type { EmprestimoChanges, EmprestimoRecord, NewEmprestimo } from "../contracts/records";
import type { EmprestimoRepository } from "../contracts/Repository";
import { SequelizeRepository } from "./SequelizeRepository";

export class SequelizeEmprestimoRepository
  extends SequelizeRepository<Emprestimo, EmprestimoRecord, NewEmprestimo, EmprestimoChanges>
  implements EmprestimoRepository
{
  constructor() {
    super(Emprestimo);
  }

  protected toRecord(entity: Emprestimo): EmprestimoRecord {
    const record: EmprestimoRecord = {
      id: entity.id,
      leitorId: entity.leitorId,
      livroId: entity.livroId,
      dataEmprestimo: entity.dataEmprestimo,
      dataPrevista: entity.dataPrevista,
      dataDevolucao: entity.dataDevolucao,
      multa: Number(entity.multa),
      valorDiaria: Number(entity.valorDiaria),
      valorAluguel: Number(entity.valorAluguel),
      observacao: entity.observacao,
    };
    if (entity.leitor) record.leitor = { id: entity.leitor.id, nome: entity.leitor.nome };
    if (entity.livro) record.livro = { id: entity.livro.id, titulo: entity.livro.titulo };
    return record;
  }

  protected searchWhere(query: PageQuery): WhereOptions | undefined {
    if (!query.search) return undefined;
    const like = `%${query.search}%`;
    return {
      [Op.or]: [{ "$leitor.nome$": { [Op.like]: like } }, { "$livro.titulo$": { [Op.like]: like } }],
    };
  }

  protected override include(): Includeable[] {
    return [
      { model: LeitorModel, as: "leitor", attributes: ["id", "nome"] },
      { model: Livro, as: "livro", attributes: ["id", "titulo"] },
    ];
  }

  protected override order(): Order {
    return [["id", "DESC"]];
  }

  countAtivosByLeitor(leitorId: number): Promise<number> {
    return Emprestimo.count({ where: { leitorId, dataDevolucao: null } });
  }

  countByLeitor(leitorId: number): Promise<number> {
    return Emprestimo.count({ where: { leitorId } });
  }
}
