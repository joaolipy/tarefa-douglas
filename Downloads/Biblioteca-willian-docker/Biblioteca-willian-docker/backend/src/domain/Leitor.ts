import { ValidacaoError } from "./errors/DominioError";
import { isValidCpf, isValidEmail, onlyDigits } from "../utils/validators";

export class Leitor {
  static readonly LIMITE_EMPRESTIMOS_ATIVOS = 3;

  readonly #id: number;
  readonly #cpf: string;
  #nome: string;
  #email: string;

  constructor(id: number, nome: string, email: string, cpf: string) {
    this.#id = id;
    this.#nome = Leitor.validarNome(nome);
    this.#email = Leitor.validarEmail(email);
    this.#cpf = Leitor.validarCpf(cpf);
  }

  podeEmprestar(emprestimosAtivos: number): boolean {
    return emprestimosAtivos < Leitor.LIMITE_EMPRESTIMOS_ATIVOS;
  }

  get id(): number {
    return this.#id;
  }

  get nome(): string {
    return this.#nome;
  }

  set nome(valor: string) {
    this.#nome = Leitor.validarNome(valor);
  }

  get email(): string {
    return this.#email;
  }

  set email(valor: string) {
    this.#email = Leitor.validarEmail(valor);
  }

  get cpf(): string {
    return this.#cpf;
  }

  get cpfFormatado(): string {
    return this.#cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  private static validarNome(valor: string): string {
    const limpo = valor?.trim();
    if (!limpo) throw new ValidacaoError("Nome é obrigatório.");
    return limpo;
  }

  private static validarEmail(valor: string): string {
    if (!isValidEmail(valor ?? "")) throw new ValidacaoError("E-mail inválido.");
    return valor.trim().toLowerCase();
  }

  private static validarCpf(valor: string): string {
    if (!isValidCpf(valor ?? "")) throw new ValidacaoError("CPF inválido.");
    return onlyDigits(valor);
  }
}
