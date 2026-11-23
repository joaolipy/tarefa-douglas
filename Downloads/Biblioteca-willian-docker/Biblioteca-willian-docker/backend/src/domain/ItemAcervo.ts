import { RegraDeNegocioError, ValidacaoError } from "./errors/DominioError";
import type { Emprestavel } from "./Emprestavel";

export abstract class ItemAcervo implements Emprestavel {
  readonly #id: number;
  #titulo: string;
  #anoPublicacao: number;
  #disponivel: boolean;
  #valorDiaria: number;

  constructor(id: number, titulo: string, anoPublicacao: number, disponivel = true, valorDiaria = 0) {
    this.#id = id;

    this.#titulo = this.validarTitulo(titulo);
    this.#anoPublicacao = this.validarAno(anoPublicacao);
    this.#disponivel = disponivel;
    this.#valorDiaria = this.validarValorDiaria(valorDiaria);
  }

  get id(): number {
    return this.#id;
  }

  get titulo(): string {
    return this.#titulo;
  }

  set titulo(valor: string) {
    this.#titulo = this.validarTitulo(valor);
  }

  get anoPublicacao(): number {
    return this.#anoPublicacao;
  }

  set anoPublicacao(valor: number) {
    this.#anoPublicacao = this.validarAno(valor);
  }

  get valorDiaria(): number {
    return this.#valorDiaria;
  }

  set valorDiaria(valor: number) {
    this.#valorDiaria = this.validarValorDiaria(valor);
  }

  get disponivel(): boolean {
    return this.#disponivel;
  }

  emprestar(): void {
    if (!this.#disponivel) {
      throw new RegraDeNegocioError(`"${this.#titulo}" já está emprestado.`);
    }
    this.#disponivel = false;
  }

  devolver(): void {
    if (this.#disponivel) {
      throw new RegraDeNegocioError(`"${this.#titulo}" não está emprestado.`);
    }
    this.#disponivel = true;
  }

  static readonly PRAZO_MAXIMO_EM_DIAS = 60;

  abstract prazoEmprestimoEmDias(): number;
  protected abstract multaPorDiaDeAtraso(): number;

  calcularMulta(diasDeAtraso: number): number {
    if (!Number.isInteger(diasDeAtraso) || diasDeAtraso < 0) {
      throw new ValidacaoError("Dias de atraso deve ser um inteiro maior ou igual a 0.");
    }
    return diasDeAtraso * this.multaPorDiaDeAtraso();
  }

  resolverPrazoEmDias(solicitado: number | null): number {
    if (solicitado === null) return this.prazoEmprestimoEmDias();
    if (!Number.isInteger(solicitado) || solicitado < 1 || solicitado > ItemAcervo.PRAZO_MAXIMO_EM_DIAS) {
      throw new ValidacaoError(`O prazo deve ser de 1 a ${ItemAcervo.PRAZO_MAXIMO_EM_DIAS} dias.`);
    }
    return solicitado;
  }

  calcularAluguel(diasDeUso: number): number {
    if (!Number.isInteger(diasDeUso) || diasDeUso < 1) {
      throw new ValidacaoError("Dias de uso deve ser um inteiro maior ou igual a 1.");
    }
    return diasDeUso * this.#valorDiaria;
  }

  protected exigirTexto(valor: string, campo: string): string {
    const limpo = valor?.trim();
    if (!limpo) {
      throw new ValidacaoError(`${campo} é obrigatório.`);
    }
    return limpo;
  }

  private validarTitulo(valor: string): string {
    return this.exigirTexto(valor, "Título");
  }

  private validarValorDiaria(valor: number): number {
    if (!Number.isFinite(valor) || valor < 0 || valor > 10000) {
      throw new ValidacaoError("Valor da diária deve estar entre 0 e 10000.");
    }
    return Math.round(valor * 100) / 100;
  }

  private validarAno(valor: number): number {
    const anoAtual = new Date().getFullYear();
    if (!Number.isInteger(valor) || valor < 1450 || valor > anoAtual) {
      throw new ValidacaoError(`Ano de publicação deve estar entre 1450 e ${anoAtual}.`);
    }
    return valor;
  }
}
