import { autores } from "./autores";
import { emprestimos } from "./emprestimos";
import { leitores } from "./leitores";
import { livros } from "./livros";
import type { ResourceConfig } from "./types";

export const RECURSOS: Record<string, ResourceConfig> = {
  [autores.key]: autores,
  [livros.key]: livros,
  [leitores.key]: leitores,
  [emprestimos.key]: emprestimos,
};

export const LISTA_RECURSOS: ResourceConfig[] = [autores, livros, leitores, emprestimos];
