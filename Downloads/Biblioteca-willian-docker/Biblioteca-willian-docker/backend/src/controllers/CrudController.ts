import type { Request, Response } from "express";
import type { CrudService } from "../services/contracts";
import { parsePageQuery } from "../utils/pagination";
import { parseId } from "../validation/parsers";

export class CrudController<TRecord, TCreate, TUpdate> {
  readonly #service: CrudService<TRecord, TCreate, TUpdate>;
  readonly #parseCreate: (body: unknown) => TCreate;
  readonly #parseUpdate: (body: unknown) => TUpdate;

  constructor(
    service: CrudService<TRecord, TCreate, TUpdate>,
    parseCreate: (body: unknown) => TCreate,
    parseUpdate: (body: unknown) => TUpdate,
  ) {
    this.#service = service;
    this.#parseCreate = parseCreate;
    this.#parseUpdate = parseUpdate;
  }

  list = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.#service.list(parsePageQuery(req.query)));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.#service.getById(parseId(req.params.id)));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const created = await this.#service.create(this.#parseCreate(req.body));
    res.status(201).json(created);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const id = parseId(req.params.id);
    res.json(await this.#service.update(id, this.#parseUpdate(req.body)));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.#service.remove(parseId(req.params.id));
    res.status(204).send();
  };
}
