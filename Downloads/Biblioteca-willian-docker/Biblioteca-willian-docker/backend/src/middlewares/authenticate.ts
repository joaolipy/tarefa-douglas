import type { Request, RequestHandler } from "express";
import { UnauthorizedError } from "../errors/AppError";
import type { TokenService } from "../services/contracts";

export function createAuthenticate(tokens: TokenService): RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token não informado.");
    }
    req.auth = { userId: tokens.verify(header.slice("Bearer ".length).trim()) };
    next();
  };
}

export function currentUserId(req: Request): number {
  if (!req.auth) throw new UnauthorizedError();
  return req.auth.userId;
}
