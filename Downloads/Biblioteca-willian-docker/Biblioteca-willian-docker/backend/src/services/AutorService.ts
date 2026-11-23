import { ConflictError } from "../errors/AppError";
import type { AutorInput, AutorRecord } from "../repositories/contracts/records";
import type { AutorRepository } from "../repositories/contracts/Repository";
import { BaseCrudService } from "./BaseCrudService";

export class AutorService extends BaseCrudService<AutorRecord, AutorInput> {
  protected readonly recurso = "Autor";
  readonly #autores: AutorRepository;

  constructor(autores: AutorRepository) {
    super(autores);
    this.#autores = autores;
  }

  protected override async validarCriacao(input: AutorInput): Promise<void> {
    await this.garantirNomeUnico(input.nome);
  }

  protected override async validarAtualizacao(id: number, input: AutorInput): Promise<void> {
    await this.garantirNomeUnico(input.nome, id);
  }

  protected override async validarRemocao(autor: AutorRecord): Promise<void> {
    if ((await this.#autores.countLivros(autor.id)) > 0) {
      throw new ConflictError("Não é possível excluir: o autor possui livros cadastrados.");
    }
  }

  private async garantirNomeUnico(nome: string, ignorarId?: number): Promise<void> {
    const existente = await this.#autores.findByNome(nome);
    if (existente && existente.id !== ignorarId) {
      throw new ConflictError("Dados já cadastrados.", { nome: "Este autor já está cadastrado." });
    }
  }
}
