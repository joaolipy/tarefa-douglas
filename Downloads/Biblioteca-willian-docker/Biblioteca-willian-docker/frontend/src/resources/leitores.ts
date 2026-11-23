import type { Leitor } from "../types";
import { mascararCpf } from "../utils/formatar";
import { isValidCpf, isValidEmail } from "../utils/validators";
import { defineResource } from "./types";

export const leitores = defineResource<Leitor>({
  key: "leitores",
  titulo: "Leitores",
  singular: "Leitor",
  descricao: "Pessoas que podem pegar itens emprestados.",
  placeholderBusca: "Buscar por nome, e-mail ou CPF",
  columns: [
    { header: "Nome", render: (leitor) => leitor.nome },
    { header: "E-mail", render: (leitor) => leitor.email },
    { header: "CPF", render: (leitor) => mascararCpf(leitor.cpf) },
    { header: "Telefone", render: (leitor) => leitor.telefone ?? "—" },
  ],
  fields: [
    { name: "nome", label: "Nome", type: "text", required: true },
    {
      name: "email",
      label: "E-mail",
      type: "text",
      required: true,
      validate: (valor) => (isValidEmail(valor) ? undefined : "Informe um e-mail válido."),
    },
    {
      name: "cpf",
      label: "CPF",
      type: "text",
      required: true,
      placeholder: "000.000.000-00",
      mask: mascararCpf,
      validate: (valor) => (isValidCpf(valor) ? undefined : "Informe um CPF válido."),
    },
    { name: "telefone", label: "Telefone (opcional)", type: "text" },
  ],
  initialValues: { nome: "", email: "", cpf: "", telefone: "" },
  toFormValues: (leitor) => ({
    nome: leitor.nome,
    email: leitor.email,
    cpf: mascararCpf(leitor.cpf),
    telefone: leitor.telefone ?? "",
  }),
  toPayload: (values) => ({
    nome: values.nome,
    email: values.email,
    cpf: values.cpf,
    telefone: values.telefone,
  }),
});
