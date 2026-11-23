import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/AppError";
import type { TokenService } from "../services/contracts";

export class JwtTokenService implements TokenService {
  readonly #secret: string;
  readonly #expiresInSeconds: number;

  constructor(secret: string, expiresInSeconds: number) {
    this.#secret = secret;
    this.#expiresInSeconds = expiresInSeconds;
  }

  sign(userId: number): string {
    return jwt.sign({ sub: String(userId) }, this.#secret, { expiresIn: this.#expiresInSeconds });
  }

  verify(token: string): number {
    try {
      const payload = jwt.verify(token, this.#secret);
      const userId = typeof payload === "string" ? Number.NaN : Number(payload.sub);
      if (!Number.isInteger(userId)) throw new Error("subject inválido");
      return userId;
    } catch {
      throw new UnauthorizedError("Token inválido ou expirado.");
    }
  }
}
