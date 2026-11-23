import { adicionarDias, diasDeAtraso, diasDeUso, ItemAcervoFactory, Leitor, type ItemAcervo } from "../domain";
import { ConflictError, NotFoundError } from "../errors/AppError";
import type {
  EmprestimoEdicao,
  EmprestimoInput,
  EmprestimoRecord,
  LivroRecord,
} from "../repositories/contracts/records";
import type {
  EmprestimoRepository,
  LeitorRepository,
  LivroRepository,
  UnitOfWork,
} from "../repositories/contracts/Repository";
import type { Page, PageQuery } from "../utils/pagination";
import type { CrudService } from "./contracts";

export class EmprestimoService implements CrudService<EmprestimoRecord, EmprestimoInput, EmprestimoEdicao> {
  readonly #emprestimos: EmprestimoRepository;
  readonly #livros: LivroRepository;
  readonly #leitores: LeitorRepository;
  readonly #unitOfWork: UnitOfWork;
  readonly #now: () => Date;

  constructor(
    emprestimos: EmprestimoRepository,
    livros: LivroRepository,
    leitores: LeitorRepository,
    unitOfWork: UnitOfWork,
    now: () => Date = () => new Date(),
  ) {
    this.#emprestimos = emprestimos;
    this.#livros = livros;
    this.#leitores = leitores;
    this.#unitOfWork = unitOfWork;
    this.#now = now;
  }

  list(query: PageQuery): Promise<Page<EmprestimoRecord>> {
    return this.#emprestimos.findPage(query);
  }

  async getById(id: number): Promise<EmprestimoRecord> {
    const record = await this.#emprestimos.findById(id);
    if (!record) throw new NotFoundError("Empréstimo não encontrado(a).");
    return record;
  }

  async create(input: EmprestimoInput): Promise<EmprestimoRecord> {
    const leitorRecord = await this.#leitores.findById(input.leitorId);
    if (!leitorRecord) throw new NotFoundError("Leitor não encontrado.");
    const livroRecord = await this.#livros.findById(input.livroId);
    if (!livroRecord) throw new NotFoundError("Livro não encontrado.");

    const leitor = new Leitor(leitorRecord.id, leitorRecord.nome, leitorRecord.email, leitorRecord.cpf);
    const ativos = await this.#emprestimos.countAtivosByLeitor(leitor.id);
    if (!leitor.podeEmprestar(ativos)) {
      throw new ConflictError(
        `O leitor atingiu o limite de ${Leitor.LIMITE_EMPRESTIMOS_ATIVOS} empréstimos ativos.`,
      );
    }

    const item = this.criarItem(livroRecord);
    item.emprestar();

    const dataEmprestimo = this.#now();
    const dataPrevista = adicionarDias(dataEmprestimo, item.resolverPrazoEmDias(input.prazoDias));

    return this.#unitOfWork.run(async (tx) => {
      const criado = await this.#emprestimos.create(
        {
          leitorId: input.leitorId,
          livroId: input.livroId,
          observacao: input.observacao,
          dataEmprestimo,
          dataPrevista,
          valorDiaria: item.valorDiaria,
        },
        tx,
      );
      await this.#livros.setDisponivel(livroRecord.id, false, tx);
      return criado;
    });
  }

  async update(id: number, edicao: EmprestimoEdicao): Promise<EmprestimoRecord> {
    const atual = await this.getById(id);
    const jaDevolvido = atual.dataDevolucao !== null;

    if (!edicao.devolvido && jaDevolvido) {
      throw new ConflictError("Um empréstimo já devolvido não pode ser reaberto.");
    }
    if (edicao.devolvido && !jaDevolvido) {
      return this.registrarDevolucao(atual, edicao.observacao);
    }

    const atualizado = await this.#emprestimos.update(id, { observacao: edicao.observacao });
    if (!atualizado) throw new NotFoundError("Empréstimo não encontrado(a).");
    return atualizado;
  }

  async remove(id: number): Promise<void> {
    const atual = await this.getById(id);
    await this.#unitOfWork.run(async (tx) => {
      if (atual.dataDevolucao === null) {
        await this.#livros.setDisponivel(atual.livroId, true, tx);
      }
      await this.#emprestimos.delete(id, tx);
    });
  }

  private async registrarDevolucao(atual: EmprestimoRecord, observacao: string | null): Promise<EmprestimoRecord> {
    const livroRecord = await this.#livros.findById(atual.livroId);
    if (!livroRecord) throw new NotFoundError("Livro não encontrado.");

    const item = this.criarItem(livroRecord, atual.valorDiaria);
    const dataDevolucao = this.#now();
    const multa = this.arredondar(item.calcularMulta(diasDeAtraso(atual.dataPrevista, dataDevolucao)));
    const valorAluguel = this.arredondar(item.calcularAluguel(diasDeUso(atual.dataEmprestimo, dataDevolucao)));
    item.devolver();

    return this.#unitOfWork.run(async (tx) => {
      const atualizado = await this.#emprestimos.update(
        atual.id,
        { observacao, dataDevolucao, multa, valorAluguel },
        tx,
      );
      if (!atualizado) throw new NotFoundError("Empréstimo não encontrado(a).");
      await this.#livros.setDisponivel(livroRecord.id, true, tx);
      return atualizado;
    });
  }

  private arredondar(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  private criarItem(livro: LivroRecord, valorDiaria = livro.valorDiaria): ItemAcervo {
    return ItemAcervoFactory.criar({
      id: livro.id,
      titulo: livro.titulo,
      anoPublicacao: livro.anoPublicacao,
      tipo: livro.tipo,
      autor: livro.autor?.nome ?? "Autor desconhecido",
      isbn: livro.isbn,
      edicao: livro.edicao,
      disponivel: livro.disponivel,
      valorDiaria,
    });
  }
}
