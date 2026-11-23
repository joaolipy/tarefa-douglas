import { Op, type Includeable, type WhereOptions } from "sequelize";
import { Autor, Emprestimo, Livro } from "../../entities";
import type { PageQuery } from "../../utils/pagination";
import type { LivroInput, LivroRecord } from "../contracts/records";
import type { LivroRepository, TransactionContext } from "../contracts/Repository";
import { asTransaction, SequelizeRepository } from "./SequelizeRepository";

export class SequelizeLivroRepository
  extends SequelizeRepository<Livro, LivroRecord, LivroInput, LivroInput>
  implements LivroRepository
{
  constructor() {
    super(Livro);
  }

  protected toRecord(entity: Livro): LivroRecord {
    const record: LivroRecord = {
      id: entity.id,
      titulo: entity.titulo,
      anoPublicacao: entity.anoPublicacao,
      tipo: entity.tipo,
      genero: entity.genero,
      paginas: entity.paginas,
      isbn: entity.isbn,
      edicao: entity.edicao,
      sinopse: entity.sinopse,
      valorDiaria: Number(entity.valorDiaria),
      disponivel: entity.disponivel,
      autorId: entity.autorId,
    };
    if (entity.autor) record.autor = { id: entity.autor.id, nome: entity.autor.nome };
    return record;
  }

  protected searchWhere(query: PageQuery): WhereOptions | undefined {
    const conditions: WhereOptions[] = [];
    if (query.search) conditions.push({ titulo: { [Op.like]: `%${query.search}%` } });
    if (query.genero) conditions.push({ genero: { [Op.like]: `%${query.genero}%` } });
    if (query.autorId !== undefined) conditions.push({ autorId: query.autorId });
    if (query.ano !== undefined) conditions.push({ anoPublicacao: query.ano });
    if (query.tipo !== undefined) conditions.push({ tipo: query.tipo });
    if (query.disponivel !== undefined) conditions.push({ disponivel: query.disponivel });
    return conditions.length > 0 ? { [Op.and]: conditions } : undefined;
  }

  protected override include(): Includeable[] {
    return [{ model: Autor, as: "autor", attributes: ["id", "nome"] }];
  }

  async setDisponivel(id: number, disponivel: boolean, tx?: TransactionContext): Promise<void> {
    await Livro.update({ disponivel }, { where: { id }, transaction: asTransaction(tx) });
  }

  countEmprestimos(livroId: number): Promise<number> {
    return Emprestimo.count({ where: { livroId } });
  }
}
