export interface User {
  id: number;
  nome: string;
  email: string;
  cpf: string;
}

export interface Page<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Autor {
  id: number;
  nome: string;
  nacionalidade: string;
  biografia: string | null;
}

export type TipoItem = "LIVRO" | "REVISTA";

export interface Livro {
  id: number;
  titulo: string;
  anoPublicacao: number;
  tipo: TipoItem;
  genero: string;
  paginas: number;
  isbn: string | null;
  edicao: number | null;
  sinopse: string | null;
  valorDiaria: number;
  disponivel: boolean;
  autorId: number;
  autor?: { id: number; nome: string };
}

export interface Leitor {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string | null;
}

export interface Emprestimo {
  id: number;
  leitorId: number;
  livroId: number;
  dataEmprestimo: string;
  dataPrevista: string;
  dataDevolucao: string | null;
  multa: number;
  valorDiaria: number;
  valorAluguel: number;
  observacao: string | null;
  leitor?: { id: number; nome: string };
  livro?: { id: number; titulo: string };
}

export interface LoginResponse {
  token: string;
  user: User;
}
