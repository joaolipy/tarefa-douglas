export interface Emprestavel {
  readonly disponivel: boolean;
  emprestar(): void;
  devolver(): void;
}
