import cors from "cors";
import express, { type Express } from "express";
import type { AppConfig } from "./config/env";
import { createContainer } from "./container";
import { createAuthenticate } from "./middlewares/authenticate";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { crudRoutes } from "./routes/crudRoutes";

export function createApp(config: AppConfig): Express {
  const container = createContainer(config);
  const authenticate = createAuthenticate(container.tokens);

  const app = express();
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.send("API da Biblioteca no ar!");
  });

  app.post("/auth/login", container.authController.login);
  app.post("/users", container.userController.register);

  app.get("/users/me", authenticate, container.userController.me);
  app.put("/users/:id", authenticate, container.userController.update);

  app.use("/autores", authenticate, crudRoutes(container.autorController));
  app.use("/livros", authenticate, crudRoutes(container.livroController));
  app.use("/leitores", authenticate, crudRoutes(container.leitorController));
  app.use("/emprestimos", authenticate, crudRoutes(container.emprestimoController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
