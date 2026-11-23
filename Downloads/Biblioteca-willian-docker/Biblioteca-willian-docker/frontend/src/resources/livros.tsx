import type { Livro } from "../types";
import { formatarMoeda, interpretarDecimal } from "../utils/formatar";
import { defineResource } from "./types";

export const livros = defineResource<Livro>({
  key: "livros",
  titulo: "Livros e revistas",
  singular: "Livro",
  descricao: "Gerencie o acervo da biblioteca.",
  placeholderBusca: "Buscar por título",
  columns: [
    { header: "Título", render: (livro) => livro.titulo },
    { header: "Tipo", render: (livro) => (livro.tipo === "LIVRO" ? "Livro" : "Revista") },
    { header: "Autor", render: (livro) => livro.autor?.nome ?? "—" },
    { header: "Gênero", render: (livro) => livro.genero },
    { header: "Ano", render: (livro) => livro.anoPublicacao },
    { header: "Diária", render: (livro) => formatarMoeda(livro.valorDiaria) },
    {
      header: "Situação",
      render: (livro) => (
        <span className={livro.disponivel ? "badge badge-ok" : "badge badge-warn"}>
          {livro.disponivel ? "Disponível" : "Emprestado"}
        </span>
      ),
    },
    {
      header: "Sinopse",
      render: (livro) => livro.sinopse ?? "",
      expandable: true,
      expandLabel: "Ler sinopse",
    },
  ],
  filters: [
    {
      name: "autorId",
      label: "Autor",
      type: "select",
      optionsSource: { path: "/autores", labelKey: "nome" },
    },
    { name: "genero", label: "Gênero", type: "text", placeholder: "Ex.: Romance" },
    { name: "ano", label: "Ano de publicação", type: "number", placeholder: "Ex.: 1899" },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { value: "LIVRO", label: "Livro" },
        { value: "REVISTA", label: "Revista" },
      ],
    },
  ],
  fields: [
    { name: "titulo", label: "Título", type: "text", required: true },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      required: true,
      options: [
        { value: "LIVRO", label: "Livro" },
        { value: "REVISTA", label: "Revista" },
      ],
    },
    {
      name: "autorId",
      label: "Autor",
      type: "select",
      required: true,
      optionsSource: { path: "/autores", labelKey: "nome" },
    },
    { name: "genero", label: "Gênero", type: "text", required: true },
    {
      name: "anoPublicacao",
      label: "Ano de publicação",
      type: "number",
      required: true,
      min: 1450,
      validate: (valor) =>
        Number(valor) > new Date().getFullYear() ? "O ano não pode estar no futuro." : undefined,
    },
    { name: "paginas", label: "Páginas", type: "number", required: true, min: 1 },
    {
      name: "isbn",
      label: "ISBN (opcional)",
      type: "text",
      showWhen: (values) => values.tipo === "LIVRO",
    },
    {
      name: "edicao",
      label: "Edição",
      type: "number",
      required: true,
      min: 1,
      showWhen: (values) => values.tipo === "REVISTA",
    },
    {
      name: "valorDiaria",
      label: "Valor da diária de aluguel (R$)",
      type: "decimal",
      required: true,
      min: 0,
      placeholder: "Ex.: 2,50 (use 0 para empréstimo gratuito)",
    },
    {
      name: "sinopse",
      label: "Sinopse (opcional)",
      type: "textarea",
      placeholder: "Resumo da obra",
    },
  ],
  initialValues: {
    titulo: "",
    tipo: "LIVRO",
    autorId: "",
    genero: "",
    anoPublicacao: "",
    paginas: "",
    isbn: "",
    edicao: "",
    valorDiaria: "",
    sinopse: "",
  },
  toFormValues: (livro) => ({
    titulo: livro.titulo,
    tipo: livro.tipo,
    autorId: String(livro.autorId),
    genero: livro.genero,
    anoPublicacao: String(livro.anoPublicacao),
    paginas: String(livro.paginas),
    isbn: livro.isbn ?? "",
    edicao: livro.edicao === null ? "" : String(livro.edicao),
    valorDiaria: String(livro.valorDiaria).replace(".", ","),
    sinopse: livro.sinopse ?? "",
  }),
  toPayload: (values) => {
    const ehLivro = values.tipo === "LIVRO";
    return {
      titulo: values.titulo,
      tipo: values.tipo,
      autorId: Number(values.autorId),
      genero: values.genero,
      anoPublicacao: Number(values.anoPublicacao),
      paginas: Number(values.paginas),
      isbn: ehLivro && values.isbn ? values.isbn : null,
      edicao: ehLivro ? null : Number(values.edicao),
      valorDiaria: interpretarDecimal(String(values.valorDiaria)),
      sinopse: values.sinopse,
    };
  },
});
