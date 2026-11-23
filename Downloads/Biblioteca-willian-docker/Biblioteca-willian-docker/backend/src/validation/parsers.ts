import { ItemAcervo, TIPOS_ITEM } from "../domain";
import { ValidationError } from "../errors/AppError";
import type {
  AutorInput,
  EmprestimoEdicao,
  EmprestimoInput,
  LeitorInput,
  LivroInput,
} from "../repositories/contracts/records";
import { compactarEspacos } from "../utils/texto";
import { BodyReader } from "./BodyReader";

const MAX_TEXTO_LONGO = 5000;

export interface RegisterInput {
  nome: string;
  email: string;
  cpf: string;
  password: string;
}

export type UserUpdateInput = Omit<RegisterInput, "email">;

export interface LoginInput {
  email: string;
  password: string;
}

export function parseRegister(body: unknown): RegisterInput {
  const reader = new BodyReader(body);
  const input: RegisterInput = {
    nome: reader.text("nome", "O nome"),
    email: reader.email(),
    cpf: reader.cpf(),
    password: reader.password(),
  };
  reader.assertValid();
  return input;
}

export function parseUserUpdate(body: unknown, currentEmail: string): UserUpdateInput {
  const reader = new BodyReader(body);
  const input: UserUpdateInput = {
    nome: reader.text("nome", "O nome"),
    cpf: reader.cpf(),
    password: reader.password(),
  };
  if (reader.has("email")) {
    const sent = String(reader.raw("email")).trim().toLowerCase();
    if (sent !== currentEmail) reader.fail("email", "Não é permitido alterar o e-mail.");
  }
  reader.assertValid();
  return input;
}

export function parseLogin(body: unknown): LoginInput {
  const reader = new BodyReader(body);
  const input: LoginInput = {
    email: reader.email(),
    password: "",
  };
  const raw = reader.raw("password");
  if (typeof raw !== "string" || !raw) reader.fail("password", "A senha é obrigatória.");
  else input.password = raw;
  reader.assertValid();
  return input;
}

export function parseAutor(body: unknown): AutorInput {
  const reader = new BodyReader(body);
  const input: AutorInput = {
    nome: compactarEspacos(reader.text("nome", "O nome")),
    nacionalidade: reader.text("nacionalidade", "A nacionalidade"),
    biografia: reader.optionalText("biografia", MAX_TEXTO_LONGO),
  };
  reader.assertValid();
  return input;
}

export function parseLeitor(body: unknown): LeitorInput {
  const reader = new BodyReader(body);
  const input: LeitorInput = {
    nome: reader.text("nome", "O nome"),
    email: reader.email(),
    cpf: reader.cpf(),
    telefone: reader.optionalText("telefone"),
  };
  reader.assertValid();
  return input;
}

export function parseLivro(body: unknown): LivroInput {
  const reader = new BodyReader(body);
  const anoAtual = new Date().getFullYear();
  const tipo = reader.oneOf("tipo", "O tipo", TIPOS_ITEM);
  const input: LivroInput = {
    titulo: reader.text("titulo", "O título"),
    anoPublicacao: reader.integer("anoPublicacao", "O ano de publicação", { min: 1450, max: anoAtual }),
    tipo,
    genero: reader.text("genero", "O gênero"),
    paginas: reader.integer("paginas", "O número de páginas", { min: 1 }),
    isbn: reader.optionalText("isbn", 30),
    edicao: tipo === "REVISTA" ? reader.integer("edicao", "A edição", { min: 1 }) : null,
    sinopse: reader.optionalText("sinopse", MAX_TEXTO_LONGO),
    valorDiaria: reader.decimal("valorDiaria", "O valor da diária", { min: 0, max: 10000 }),
    autorId: reader.integer("autorId", "O autor", { min: 1 }),
  };
  reader.assertValid();
  return input;
}

export function parseEmprestimo(body: unknown): EmprestimoInput {
  const reader = new BodyReader(body);
  const input: EmprestimoInput = {
    leitorId: reader.integer("leitorId", "O leitor", { min: 1 }),
    livroId: reader.integer("livroId", "O livro", { min: 1 }),
    observacao: reader.optionalText("observacao"),
    prazoDias: reader.optionalInteger("prazoDias", "O prazo", { min: 1, max: ItemAcervo.PRAZO_MAXIMO_EM_DIAS }),
  };
  reader.assertValid();
  return input;
}

export function parseEmprestimoEdicao(body: unknown): EmprestimoEdicao {
  const reader = new BodyReader(body);
  const input: EmprestimoEdicao = {
    observacao: reader.optionalText("observacao"),
    devolvido: reader.boolean("devolvido", "O campo devolvido"),
  };
  reader.assertValid();
  return input;
}

export function parseId(value: unknown): number {
  const id = typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isInteger(id) || id < 1) {
    throw new ValidationError({ id: "Identificador inválido." });
  }
  return id;
}
