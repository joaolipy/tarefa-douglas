import { ItemAcervo } from "./ItemAcervo";

export class Livro extends ItemAcervo {
  readonly #isbn: string | null;
  #autor: string;

  constructor(
    id: number,
    titulo: string,
    anoPublicacao: number,
    autor: string,
    isbn: string | null,
    disponivel = true,
    valorDiaria = 0,
  ) {
    super(id, titulo, anoPublicacao, disponivel, valorDiaria);
    this.#autor = this.exigirTexto(autor, "Autor");
    this.#isbn = isbn === null || isbn.trim() === "" ? null : isbn.trim();
  }

  get autor(): string {
    return this.#autor;
  }

  set autor(valor: string) {
    this.#autor = this.exigirTexto(valor, "Autor");
  }

  get isbn(): string | null {
    return this.#isbn;
  }

  prazoEmprestimoEmDias(): number {
    return 14;
  }

  protected multaPorDiaDeAtraso(): number {
    return 1.5;
  }
}
