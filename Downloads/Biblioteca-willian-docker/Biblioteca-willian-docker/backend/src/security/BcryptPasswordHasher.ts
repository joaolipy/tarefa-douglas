import bcrypt from "bcrypt";
import type { PasswordHasher } from "../services/contracts";

export class BcryptPasswordHasher implements PasswordHasher {
  readonly #saltRounds: number;

  constructor(saltRounds: number) {
    this.#saltRounds = saltRounds;
  }

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.#saltRounds);
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
