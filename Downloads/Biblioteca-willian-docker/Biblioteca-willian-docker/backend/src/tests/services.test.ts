import assert from "node:assert/strict";
import { RegraDeNegocioError } from "../domain";
import { AppError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "../errors/AppError";
import { AuthService } from "../services/AuthService";
import { AutorService } from "../services/AutorService";
import { EmprestimoService } from "../services/EmprestimoService";
import { LeitorService } from "../services/LeitorService";
import { LivroService } from "../services/LivroService";
import { UserService } from "../services/UserService";
import { parseAutor, parseEmprestimo, parseLivro, parseRegister, parseUserUpdate } from "../validation/parsers";
import {
  fakeHasher,
  fakeTokens,
  memoryUnitOfWork,
  MemoryAutores,
  MemoryEmprestimos,
  MemoryLeitores,
  MemoryLivros,
  MemoryUsers,
} from "./memory";

async function rejects(promise: Promise<unknown>, type: new (...args: never[]) => Error): Promise<Error> {
  let caught: unknown;
  try {
    await promise;
  } catch (error) {
    caught = error;
  }
  if (!(caught instanceof type)) {
    throw new Error(`esperava ${type.name}, veio ${String(caught)}`);
  }
  return caught as Error;
}

function fieldErrors(fn: () => unknown): Record<string, string> {
  let caught: unknown;
  try {
    fn();
  } catch (error) {
    caught = error;
  }
  if (!(caught instanceof ValidationError)) {
    throw new Error("esperava ValidationError");
  }
  return caught.errors ?? {};
}

const CPF_A = "529.982.247-25";
const CPF_B = "111.444.777-35";
const SENHA = "Senha@123";

async function main(): Promise<void> {
  const users = new MemoryUsers();
  const userService = new UserService(users, fakeHasher);
  const auth = new AuthService(users, fakeHasher, fakeTokens);

  const ana = await userService.register(parseRegister({ nome: "Ana", email: "ANA@exemplo.com", cpf: CPF_A, password: SENHA }));
  assert.equal(ana.email, "ana@exemplo.com");
  assert.equal(users.rows[0]?.passwordHash, `hash:${SENHA}`);
  assert.ok(!("passwordHash" in ana), "resposta não pode conter senha");
  await rejects(userService.register(parseRegister({ nome: "X", email: "ana@exemplo.com", cpf: CPF_B, password: SENHA })), ConflictError);
  await rejects(userService.register(parseRegister({ nome: "X", email: "x@exemplo.com", cpf: CPF_A, password: SENHA })), ConflictError);
  const bia = await userService.register(parseRegister({ nome: "Bia", email: "bia@exemplo.com", cpf: CPF_B, password: SENHA }));

  const login = await auth.login({ email: "ana@exemplo.com", password: SENHA });
  assert.equal(login.token, "token-1");
  await rejects(auth.login({ email: "ana@exemplo.com", password: "errada" }), UnauthorizedError);
  await rejects(auth.login({ email: "naoexiste@exemplo.com", password: SENHA }), UnauthorizedError);

  const edicao = parseUserUpdate({ nome: "Ana Maria", cpf: CPF_A, password: "Nova@1234" }, ana.email);
  assert.equal((await userService.update(ana.id, ana.id, edicao)).nome, "Ana Maria");
  await rejects(userService.update(bia.id, ana.id, edicao), ForbiddenError);
  await rejects(userService.update(bia.id, bia.id, { ...edicao, cpf: "52998224725" }), ConflictError);
  assert.deepEqual(Object.keys(fieldErrors(() => parseUserUpdate({ nome: "A", cpf: CPF_A, password: SENHA, email: "outro@x.com" }, ana.email))), ["email"]);
  assert.deepEqual(Object.keys(fieldErrors(() => parseUserUpdate({ cpf: "123", password: "abc" }, ana.email))).sort(), ["cpf", "nome", "password"]);
  assert.deepEqual(Object.keys(fieldErrors(() => parseRegister({}))).sort(), ["cpf", "email", "nome", "password"]);

  const autores = new MemoryAutores();
  const livros = new MemoryLivros(autores);
  const leitores = new MemoryLeitores();
  const emprestimos = new MemoryEmprestimos();
  autores.livros = livros;
  livros.emprestimos = emprestimos;

  const autorService = new AutorService(autores);
  const livroService = new LivroService(livros, autores);
  const leitorService = new LeitorService(leitores, emprestimos);
  let agora = new Date("2026-03-01T12:00:00Z");
  const emprestimoService = new EmprestimoService(emprestimos, livros, leitores, memoryUnitOfWork, () => agora);

  const machado = await autorService.create(parseAutor({ nome: "Machado de Assis", nacionalidade: "Brasileira", biografia: "Escritor carioca, fundador da ABL." }));
  assert.equal(machado.biografia, "Escritor carioca, fundador da ABL.");
  assert.equal((await autorService.create(parseAutor({ nome: "Clarice Lispector", nacionalidade: "Brasileira" }))).biografia, null);
  await rejects(autorService.create(parseAutor({ nome: "machado de assis", nacionalidade: "Brasileira" })), ConflictError);
  await rejects(autorService.create(parseAutor({ nome: "  MACHADO   DE  ASSIS ", nacionalidade: "Brasileira" })), ConflictError);
  await autorService.create(parseAutor({ nome: "José de Alencar", nacionalidade: "Brasileira" }));
  await rejects(autorService.create(parseAutor({ nome: "jose de alencar", nacionalidade: "Brasileira" })), ConflictError);
  const erroDuplicado = await rejects(autorService.create(parseAutor({ nome: "clarice lispector", nacionalidade: "BR" })), ConflictError);
  assert.deepEqual((erroDuplicado as AppError).errors, { nome: "Este autor já está cadastrado." });
  const guimaraes = await autorService.create(parseAutor({ nome: "Guimarães Rosa", nacionalidade: "Brasileira" }));
  await rejects(autorService.update(guimaraes.id, parseAutor({ nome: "machado de assis", nacionalidade: "Brasileira" })), ConflictError);
  assert.equal((await autorService.update(machado.id, parseAutor({ nome: "Machado de Assis", nacionalidade: "Brasil", biografia: "Nova bio" }))).biografia, "Nova bio");
  await autorService.remove(guimaraes.id);
  assert.ok(fieldErrors(() => parseAutor({ nome: "X", nacionalidade: "Y", biografia: "a".repeat(5001) })).biografia);
  await rejects(autorService.update(999, parseAutor({ nome: "X", nacionalidade: "Y" })), NotFoundError);
  await rejects(autorService.remove(999), NotFoundError);

  const semIsbn = parseLivro({ titulo: "Sem ISBN", anoPublicacao: 1900, tipo: "LIVRO", genero: "Romance", paginas: 100, valorDiaria: "1,50", autorId: 1 });
  assert.equal(semIsbn.isbn, null);
  assert.equal(semIsbn.valorDiaria, 1.5);
  assert.equal(semIsbn.sinopse, null);
  assert.ok(fieldErrors(() => parseLivro({ titulo: "X", anoPublicacao: 1900, tipo: "REVISTA", genero: "Ciência", paginas: 50, valorDiaria: 1, autorId: 1 })).edicao);
  assert.ok(fieldErrors(() => parseLivro({ titulo: "X", anoPublicacao: 3000, tipo: "GIBI", genero: "", paginas: 0, autorId: 1 })).tipo);
  assert.ok(fieldErrors(() => parseLivro({ titulo: "X", anoPublicacao: 1900, tipo: "LIVRO", genero: "G", paginas: 10, autorId: 1 })).valorDiaria);
  assert.ok(fieldErrors(() => parseLivro({ titulo: "X", anoPublicacao: 1900, tipo: "LIVRO", genero: "G", paginas: 10, valorDiaria: -1, autorId: 1 })).valorDiaria);
  assert.ok(fieldErrors(() => parseLivro({ titulo: "X", anoPublicacao: 1900, tipo: "LIVRO", genero: "G", paginas: 10, valorDiaria: 1, sinopse: "s".repeat(5001), autorId: 1 })).sinopse);

  const livroInput = parseLivro({ titulo: "Dom Casmurro", anoPublicacao: 1899, tipo: "LIVRO", genero: "Romance", paginas: 256, isbn: "978-85", sinopse: "Bentinho e Capitu.", valorDiaria: 2, autorId: machado.id });
  await rejects(livroService.create({ ...livroInput, autorId: 999 }), ValidationError);
  const dom = await livroService.create(livroInput);
  const revista = await livroService.create(parseLivro({ titulo: "Superinteressante", anoPublicacao: 2024, tipo: "REVISTA", genero: "Ciência", paginas: 80, edicao: 450, valorDiaria: 0.5, autorId: machado.id }));
  const livroSemIsbn = await livroService.create({ ...semIsbn, autorId: machado.id });
  assert.equal(livroSemIsbn.isbn, null);
  assert.equal(dom.sinopse, "Bentinho e Capitu.");
  assert.equal(dom.valorDiaria, 2);
  await livroService.remove(livroSemIsbn.id);
  await rejects(autorService.remove(machado.id), ConflictError);

  const leitorInput = { nome: "Carlos", email: "carlos@exemplo.com", cpf: CPF_A, telefone: null };
  const carlos = await leitorService.create(leitorInput);
  await rejects(leitorService.create({ ...leitorInput, cpf: CPF_B }), ConflictError);
  await rejects(leitorService.create({ ...leitorInput, email: "outro@exemplo.com" }), ConflictError);
  await rejects(leitorService.create({ ...leitorInput, email: "invalido", cpf: CPF_B }), Error);

  assert.equal(parseEmprestimo({ leitorId: 1, livroId: 1 }).prazoDias, null);
  assert.equal(parseEmprestimo({ leitorId: 1, livroId: 1, prazoDias: "21" }).prazoDias, 21);
  assert.ok(fieldErrors(() => parseEmprestimo({ leitorId: 1, livroId: 1, prazoDias: 61 })).prazoDias);
  assert.ok(fieldErrors(() => parseEmprestimo({ leitorId: 1, livroId: 1, prazoDias: 0 })).prazoDias);
  await rejects(emprestimoService.create({ leitorId: carlos.id, livroId: dom.id, observacao: null, prazoDias: 90 }), Error);
  assert.equal((await livros.findById(dom.id))?.disponivel, true);

  const emp = await emprestimoService.create({ leitorId: carlos.id, livroId: dom.id, observacao: null, prazoDias: null });
  assert.equal(emp.valorDiaria, 2);
  assert.equal((await livros.findById(dom.id))?.disponivel, false);
  assert.equal(emp.dataPrevista.toISOString().slice(0, 10), "2026-03-15");
  await rejects(emprestimoService.create({ leitorId: carlos.id, livroId: dom.id, observacao: null, prazoDias: null }), RegraDeNegocioError);
  const empRevista = await emprestimoService.create({ leitorId: carlos.id, livroId: revista.id, observacao: "urgente", prazoDias: null });
  assert.equal(empRevista.dataPrevista.toISOString().slice(0, 10), "2026-03-08");
  await rejects(emprestimoService.create({ leitorId: 999, livroId: dom.id, observacao: null, prazoDias: null }), NotFoundError);
  await rejects(leitorService.remove(carlos.id), ConflictError);
  await rejects(livroService.remove(dom.id), ConflictError);

  agora = new Date("2026-03-20T12:00:00Z");
  const devolvido = await emprestimoService.update(emp.id, { observacao: "devolvido com atraso", devolvido: true });
  assert.equal(devolvido.multa, 7.5);
  assert.equal(devolvido.valorAluguel, 38);
  assert.ok(devolvido.dataDevolucao instanceof Date);
  assert.equal((await livros.findById(dom.id))?.disponivel, true);
  await rejects(emprestimoService.update(emp.id, { observacao: null, devolvido: false }), ConflictError);
  assert.equal((await emprestimoService.update(emp.id, { observacao: "só nota", devolvido: true })).observacao, "só nota");

  await emprestimoService.remove(empRevista.id);
  assert.equal((await livros.findById(revista.id))?.disponivel, true);
  await rejects(emprestimoService.getById(empRevista.id), NotFoundError);

  const longo = await livroService.create({ ...livroInput, titulo: "Prazo longo", valorDiaria: 1 });
  const prazoLongo = await emprestimoService.create({ leitorId: carlos.id, livroId: longo.id, observacao: null, prazoDias: 21 });
  assert.equal(prazoLongo.dataPrevista.toISOString().slice(0, 10), "2026-04-10");
  agora = new Date("2026-03-20T12:00:00Z");
  const semAtraso = await emprestimoService.update(prazoLongo.id, { observacao: null, devolvido: true });
  assert.equal(semAtraso.multa, 0);
  assert.equal(semAtraso.valorAluguel, 1);
  const gratis = await livroService.create({ ...livroInput, titulo: "Gratuito", valorDiaria: 0 });
  const empGratis = await emprestimoService.create({ leitorId: carlos.id, livroId: gratis.id, observacao: null, prazoDias: null });
  await emprestimoService.update(empGratis.id, { observacao: null, devolvido: true });
  assert.equal((await emprestimoService.getById(empGratis.id)).valorAluguel, 0);

  const extras: number[] = [];
  for (let i = 0; i < 3; i += 1) {
    const l = await livroService.create({ ...livroInput, titulo: `Livro ${i}` });
    extras.push(l.id);
    await emprestimoService.create({ leitorId: carlos.id, livroId: l.id, observacao: null, prazoDias: null });
  }
  const outro = await livroService.create({ ...livroInput, titulo: "Quarto" });
  const erroLimite = await rejects(emprestimoService.create({ leitorId: carlos.id, livroId: outro.id, observacao: null, prazoDias: null }), ConflictError);
  assert.match(erroLimite.message, /limite de 3/);
  assert.equal((erroLimite as AppError).statusCode, 409);

  for (let i = 0; i < 12; i += 1) await autorService.create({ nome: `Autor ${i}`, nacionalidade: "X", biografia: null });
  const pagina = await autorService.list({ page: 2, limit: 5 });
  assert.equal(pagina.data.length, 5);
  assert.equal(pagina.total, 15);
  assert.equal(pagina.totalPages, 3);

  console.log("✔ services: todos os testes passaram");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
