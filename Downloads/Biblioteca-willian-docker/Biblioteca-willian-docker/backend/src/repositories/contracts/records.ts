import type { TipoItem } from "../../domain";

export interface UserRecord {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  passwordHash: string;
}

export type NewUser = Omit<UserRecord, "id">;
export type UserChanges = Pick<UserRecord, "nome" | "cpf" | "passwordHash">;

export interface AutorInput {
  nome: string;
  nacionalidade: string;
  biografia: string | null;
}

export interface AutorRecord extends AutorInput {
  id: number;
}

export interface LivroInput {
  titulo: string;
  anoPublicacao: number;
  tipo: TipoItem;
  genero: string;
  paginas: number;
  isbn: string | null;
  edicao: number | null;
  sinopse: string | null;
  valorDiaria: number;
  autorId: number;
}

export interface LivroRecord extends LivroInput {
  id: number;
  disponivel: boolean;
  autor?: { id: number; nome: string };
}

export interface LeitorInput {
  nome: string;
  email: string;
  cpf: string;
  telefone: string | null;
}

export interface LeitorRecord extends LeitorInput {
  id: number;
}

export interface EmprestimoInput {
  leitorId: number;
  livroId: number;
  observacao: string | null;
  prazoDias: number | null;
}

export interface EmprestimoEdicao {
  observacao: string | null;
  devolvido: boolean;
}

export interface NewEmprestimo {
  leitorId: number;
  livroId: number;
  observacao: string | null;
  dataEmprestimo: Date;
  dataPrevista: Date;
  valorDiaria: number;
}

export interface EmprestimoChanges {
  observacao?: string | null;
  dataDevolucao?: Date;
  multa?: number;
  valorAluguel?: number;
}

export interface EmprestimoRecord {
  id: number;
  leitorId: number;
  livroId: number;
  dataEmprestimo: Date;
  dataPrevista: Date;
  dataDevolucao: Date | null;
  multa: number;
  valorDiaria: number;
  valorAluguel: number;
  observacao: string | null;
  leitor?: { id: number; nome: string };
  livro?: { id: number; titulo: string };
}
