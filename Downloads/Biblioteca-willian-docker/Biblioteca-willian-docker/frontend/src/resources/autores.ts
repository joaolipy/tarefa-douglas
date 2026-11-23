import type { Autor } from "../types";
import { defineResource } from "./types";

export const autores = defineResource<Autor>({
  key: "autores",
  titulo: "Autores",
  singular: "Autor",
  descricao: "Cadastre e consulte os autores. Clique no nome para ver as obras do autor.",
  placeholderBusca: "Buscar por nome ou nacionalidade",
  columns: [
    { header: "Nome", render: (autor) => autor.nome, linkTo: (autor) => `/livros?autorId=${autor.id}` },
    { header: "Nacionalidade", render: (autor) => autor.nacionalidade },
    {
      header: "Biografia",
      render: (autor) => autor.biografia ?? "",
      expandable: true,
      expandLabel: "Ler biografia",
    },
  ],
  fields: [
    { name: "nome", label: "Nome", type: "text", required: true },
    { name: "nacionalidade", label: "Nacionalidade", type: "text", required: true },
    {
      name: "biografia",
      label: "Biografia (opcional)",
      type: "textarea",
      placeholder: "Conte um pouco sobre a vida e a obra do autor",
    },
  ],
  initialValues: { nome: "", nacionalidade: "", biografia: "" },
  toFormValues: (autor) => ({
    nome: autor.nome,
    nacionalidade: autor.nacionalidade,
    biografia: autor.biografia ?? "",
  }),
  toPayload: (values) => ({
    nome: values.nome,
    nacionalidade: values.nacionalidade,
    biografia: values.biografia,
  }),
});
