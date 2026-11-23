import { UnauthorizedError } from "../errors/AppError";
import type { UserRepository } from "../repositories/contracts/Repository";
import type { LoginInput } from "../validation/parsers";
import type { LoginResult, PasswordHasher, TokenService } from "./contracts";
import { toUserResponse } from "./UserService";

export class AuthService {
  readonly #users: UserRepository;
  readonly #hasher: PasswordHasher;
  readonly #tokens: TokenService;

  constructor(users: UserRepository, hasher: PasswordHasher, tokens: TokenService) {
    this.#users = users;
    this.#hasher = hasher;
    this.#tokens = tokens;
  }

  async login(input: LoginInput): Promise<LoginResult> {
    const user = await this.#users.findByEmail(input.email);
    const passwordOk = user ? await this.#hasher.compare(input.password, user.passwordHash) : false;

    if (!user || !passwordOk) {
      throw new UnauthorizedError("E-mail ou senha inválidos.");
    }
    return { token: this.#tokens.sign(user.id), user: toUserResponse(user) };
  }
}
