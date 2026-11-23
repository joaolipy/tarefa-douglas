import { CrudController } from "./controllers/CrudController";
import { AuthController } from "./controllers/AuthController";
import { UserController } from "./controllers/UserController";
import type { AppConfig } from "./config/env";
import { SequelizeAutorRepository } from "./repositories/sequelize/SequelizeAutorRepository";
import { SequelizeEmprestimoRepository } from "./repositories/sequelize/SequelizeEmprestimoRepository";
import { SequelizeLeitorRepository } from "./repositories/sequelize/SequelizeLeitorRepository";
import { SequelizeLivroRepository } from "./repositories/sequelize/SequelizeLivroRepository";
import { SequelizeUnitOfWork } from "./repositories/sequelize/SequelizeUnitOfWork";
import { SequelizeUserRepository } from "./repositories/sequelize/SequelizeUserRepository";
import { BcryptPasswordHasher } from "./security/BcryptPasswordHasher";
import { JwtTokenService } from "./security/JwtTokenService";
import { AuthService } from "./services/AuthService";
import { AutorService } from "./services/AutorService";
import { EmprestimoService } from "./services/EmprestimoService";
import { LeitorService } from "./services/LeitorService";
import { LivroService } from "./services/LivroService";
import { UserService } from "./services/UserService";
import {
  parseAutor,
  parseEmprestimo,
  parseEmprestimoEdicao,
  parseLeitor,
  parseLivro,
} from "./validation/parsers";

export function createContainer(config: AppConfig) {
  const users = new SequelizeUserRepository();
  const autores = new SequelizeAutorRepository();
  const livros = new SequelizeLivroRepository();
  const leitores = new SequelizeLeitorRepository();
  const emprestimos = new SequelizeEmprestimoRepository();

  const hasher = new BcryptPasswordHasher(config.bcryptSaltRounds);
  const tokens = new JwtTokenService(config.jwtSecret, config.jwtExpiresInSeconds);

  const userService = new UserService(users, hasher);
  const authService = new AuthService(users, hasher, tokens);
  const autorService = new AutorService(autores);
  const livroService = new LivroService(livros, autores);
  const leitorService = new LeitorService(leitores, emprestimos);
  const emprestimoService = new EmprestimoService(emprestimos, livros, leitores, new SequelizeUnitOfWork());

  return {
    tokens,
    authController: new AuthController(authService),
    userController: new UserController(userService),
    autorController: new CrudController(autorService, parseAutor, parseAutor),
    livroController: new CrudController(livroService, parseLivro, parseLivro),
    leitorController: new CrudController(leitorService, parseLeitor, parseLeitor),
    emprestimoController: new CrudController(emprestimoService, parseEmprestimo, parseEmprestimoEdicao),
  };
}
