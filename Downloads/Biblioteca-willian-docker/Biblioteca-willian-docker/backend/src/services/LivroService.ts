import { ItemAcervoFactory } from "../domain";
import { ConflictError, ValidationError } from "../errors/AppError";
import type { LivroInput, LivroRecord } from "../repositories/contracts/records";
import type { AutorRepository, LivroRepository } from "../repositories/contracts/Repository";
import { BaseCrudService } from "./BaseCrudService";

export class LivroService extends BaseCrudService<LivroRecord, LivroInput> {
  protected readonly recurso = "Livro";
  readonly #livros: LivroRepository;
  readonly #autores: AutorRepository;

  constructor(livros: LivroRepository, autores: AutorRepository) {
    super(livros);
    this.#livros = livros;
    this.#autores = autores;
  }

  protected override async validarCriacao(input: LivroInput): Promise<void> {
    await this.validarItem(input);
  }

  protected override async validarAtualizacao(_id: number, input: LivroInput): Promise<void> {
    await this.validarItem(input);
  }

  protected override async validarRemocao(livro: LivroRecord): Promise<void> {
    if ((await this.#livros.countEmprestimos(livro.id)) > 0) {
      throw new ConflictError("Não é possível excluir: o item possui empréstimos registrados.");
    }
  }

  private async validarItem(input: LivroInput): Promise<void> {
    const autor = await this.#autores.findById(input.autorId);
    if (!autor) {
      throw new ValidationError({ autorId: "Autor não encontrado." });
    }
    ItemAcervoFactory.criar({
      id: 0,
      titulo: input.titulo,
      anoPublicacao: input.anoPublicacao,
      tipo: input.tipo,
      autor: autor.nome,
      isbn: input.isbn,
      edicao: input.edicao,
      disponivel: true,
      valorDiaria: input.valorDiaria,
    });
  }
}
