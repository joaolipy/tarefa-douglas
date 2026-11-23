import { ConflictError, ForbiddenError, NotFoundError } from "../errors/AppError";
import type { UserRecord } from "../repositories/contracts/records";
import type { UserRepository } from "../repositories/contracts/Repository";
import type { RegisterInput, UserUpdateInput } from "../validation/parsers";
import type { PasswordHasher, UserResponse } from "./contracts";

export function toUserResponse(user: UserRecord): UserResponse {
  return { id: user.id, nome: user.nome, email: user.email, cpf: user.cpf };
}

export class UserService {
  readonly #users: UserRepository;
  readonly #hasher: PasswordHasher;

  constructor(users: UserRepository, hasher: PasswordHasher) {
    this.#users = users;
    this.#hasher = hasher;
  }

  async register(input: RegisterInput): Promise<UserResponse> {
    if (await this.#users.findByEmail(input.email)) {
      throw new ConflictError("Dados já cadastrados.", { email: "Este e-mail já está cadastrado." });
    }
    if (await this.#users.findByCpf(input.cpf)) {
      throw new ConflictError("Dados já cadastrados.", { cpf: "Este CPF já está cadastrado." });
    }

    const created = await this.#users.create({
      nome: input.nome,
      email: input.email,
      cpf: input.cpf,
      passwordHash: await this.#hasher.hash(input.password),
    });
    return toUserResponse(created);
  }

  async getById(id: number): Promise<UserResponse> {
    const user = await this.#users.findById(id);
    if (!user) throw new NotFoundError("Usuário não encontrado.");
    return toUserResponse(user);
  }

  assertOwnership(requesterId: number, targetId: number): void {
    if (requesterId !== targetId) {
      throw new ForbiddenError("Você só pode editar o seu próprio usuário.");
    }
  }

  async update(requesterId: number, targetId: number, input: UserUpdateInput): Promise<UserResponse> {
    this.assertOwnership(requesterId, targetId);

    const sameCpf = await this.#users.findByCpf(input.cpf);
    if (sameCpf && sameCpf.id !== targetId) {
      throw new ConflictError("Dados já cadastrados.", { cpf: "Este CPF já está cadastrado." });
    }

    const updated = await this.#users.update(targetId, {
      nome: input.nome,
      cpf: input.cpf,
      passwordHash: await this.#hasher.hash(input.password),
    });
    if (!updated) throw new NotFoundError("Usuário não encontrado.");
    return toUserResponse(updated);
  }
}
