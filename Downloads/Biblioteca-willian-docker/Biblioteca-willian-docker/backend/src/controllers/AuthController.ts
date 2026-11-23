import type { Request, Response } from "express";
import type { AuthService } from "../services/AuthService";
import { parseLogin } from "../validation/parsers";

export class AuthController {
  readonly #auth: AuthService;

  constructor(auth: AuthService) {
    this.#auth = auth;
  }

  login = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.#auth.login(parseLogin(req.body)));
  };
}
