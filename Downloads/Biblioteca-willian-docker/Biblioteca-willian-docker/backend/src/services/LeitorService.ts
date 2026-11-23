import { Leitor } from "../domain";
import { ConflictError } from "../errors/AppError";
import type { LeitorInput, LeitorRecord } from "../repositories/contracts/records";
import type { EmprestimoRepository, LeitorRepository } from "../repositories/contracts/Repository";
import { BaseCrudService } from "./BaseCrudService";

export class LeitorService extends BaseCrudService<LeitorRecord, LeitorInput> {
  protected readonly recurso = "Leitor";
  readonly #leitores: LeitorRepository;
  readonly #emprestimos: EmprestimoRepository;

  constructor(leitores: LeitorRepository, emprestimos: EmprestimoRepository) {
    super(leitores);
    this.#leitores = leitores;
    this.#emprestimos = emprestimos;
  }

  protected override async validarCriacao(input: LeitorInput): Promise<void> {
    await this.garantirUnicidade(input);
  }

  protected override async validarAtualizacao(id: number, input: LeitorInput): Promise<void> {
    await this.garantirUnicidade(input, id);
  }

  protected override async validarRemocao(leitor: LeitorRecord): Promise<void> {
    if ((await this.#emprestimos.countByLeitor(leitor.id)) > 0) {
      throw new ConflictError("Não é possível excluir: o leitor possui empréstimos registrados.");
    }
  }

  private async garantirUnicidade(input: LeitorInput, ignorarId?: number): Promise<void> {
    new Leitor(ignorarId ?? 0, input.nome, input.email, input.cpf);

    const porEmail = await this.#leitores.findByEmail(input.email);
    if (porEmail && porEmail.id !== ignorarId) {
      throw new ConflictError("Dados já cadastrados.", { email: "Este e-mail já está cadastrado." });
    }
    const porCpf = await this.#leitores.findByCpf(input.cpf);
    if (porCpf && porCpf.id !== ignorarId) {
      throw new ConflictError("Dados já cadastrados.", { cpf: "Este CPF já está cadastrado." });
    }
  }
}
