import type { ErrorRequestHandler, RequestHandler } from "express";
import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize";
import { DominioError, RegraDeNegocioError } from "../domain";
import { AppError } from "../errors/AppError";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ message: "Rota não encontrada." });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json(error.errors ? { message: error.message, errors: error.errors } : { message: error.message });
    return;
  }
  if (error instanceof RegraDeNegocioError) {
    res.status(409).json({ message: error.message });
    return;
  }
  if (error instanceof DominioError) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error instanceof UniqueConstraintError) {
    res.status(409).json({ message: "Já existe um registro com os dados informados." });
    return;
  }
  if (error instanceof ForeignKeyConstraintError) {
    res.status(409).json({ message: "Operação bloqueada: existem registros relacionados." });
    return;
  }
  if (error instanceof SyntaxError) {
    res.status(400).json({ message: "JSON inválido na requisição." });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Erro interno do servidor." });
};
