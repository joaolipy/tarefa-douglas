import type { Request, Response } from "express";
import { currentUserId } from "../middlewares/authenticate";
import type { UserService } from "../services/UserService";
import { parseId, parseRegister, parseUserUpdate } from "../validation/parsers";

export class UserController {
  readonly #users: UserService;

  constructor(users: UserService) {
    this.#users = users;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(await this.#users.register(parseRegister(req.body)));
  };

  me = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.#users.getById(currentUserId(req)));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const requesterId = currentUserId(req);
    const targetId = parseId(req.params.id);
    this.#users.assertOwnership(requesterId, targetId);

    const current = await this.#users.getById(targetId);
    const input = parseUserUpdate(req.body, current.email);
    res.json(await this.#users.update(requesterId, targetId, input));
  };
}
