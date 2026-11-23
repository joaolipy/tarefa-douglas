import type { Emprestimo } from "../types";
import { formatarData, formatarMoeda } from "../utils/formatar";
import { PRAZO_MAXIMO_DIAS } from "./constantes";
import { defineResource } from "./types";

export const emprestimos = defineResource<Emprestimo>({
  key: "emprestimos",
  titulo: "Empréstimos",
  singular: "Empréstimo",
  descricao: "Registre aluguéis e devoluções. O aluguel e a multa são calculados na devolução.",
  placeholderBusca: "Buscar por leitor ou título",
  columns: [
    { header: "Leitor", render: (item) => item.leitor?.nome ?? "—" },
    { header: "Título", render: (item) => item.livro?.titulo ?? "—" },
    { header: "Empréstimo", render: (item) => formatarData(item.dataEmprestimo) },
    { header: "Devolver até", render: (item) => formatarData(item.dataPrevista) },
    {
      header: "Situação",
      render: (item) =>
        item.dataDevolucao ? (
          <span className="badge badge-ok">Devolvido em {formatarData(item.dataDevolucao)}</span>
        ) : (
          <span className="badge badge-warn">Em aberto</span>
        ),
    },
    { header: "Diária", render: (item) => formatarMoeda(item.valorDiaria) },
    { header: "Aluguel", render: (item) => (item.dataDevolucao ? formatarMoeda(item.valorAluguel) : "—") },
    { header: "Multa", render: (item) => formatarMoeda(item.multa) },
  ],
  fields: [
    {
      name: "leitorId",
      label: "Leitor",
      type: "select",
      required: true,
      mode: "create",
      optionsSource: { path: "/leitores", labelKey: "nome" },
    },
    {
      name: "livroId",
      label: "Livro ou revista (somente disponíveis)",
      type: "select",
      required: true,
      mode: "create",
      optionsSource: {
        path: "/livros",
        labelKey: "titulo",
        label: (item) => `${String(item.titulo)} — ${formatarMoeda(Number(item.valorDiaria))}/dia`,
        params: { disponivel: true },
      },
    },
    {
      name: "prazoDias",
      label: "Prazo para devolução, em dias (opcional)",
      type: "number",
      mode: "create",
      min: 1,
      placeholder: "Se vazio: 14 dias para livros e 7 para revistas",
      validate: (valor) =>
        Number(valor) > PRAZO_MAXIMO_DIAS ? `O prazo máximo é de ${PRAZO_MAXIMO_DIAS} dias.` : undefined,
    },
    { name: "observacao", label: "Observação (opcional)", type: "text" },
    { name: "devolvido", label: "Item devolvido", type: "checkbox", mode: "edit" },
  ],
  initialValues: { leitorId: "", livroId: "", prazoDias: "", observacao: "", devolvido: false },
  toFormValues: (item) => ({
    leitorId: String(item.leitorId),
    livroId: String(item.livroId),
    prazoDias: "",
    observacao: item.observacao ?? "",
    devolvido: item.dataDevolucao !== null,
  }),
  toPayload: (values, mode) =>
    mode === "create"
      ? {
          leitorId: Number(values.leitorId),
          livroId: Number(values.livroId),
          prazoDias: values.prazoDias ? Number(values.prazoDias) : null,
          observacao: values.observacao,
        }
      : { observacao: values.observacao, devolvido: values.devolvido === true },
});
