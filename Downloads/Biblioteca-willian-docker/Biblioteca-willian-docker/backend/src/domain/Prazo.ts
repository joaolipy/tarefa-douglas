import { ValidacaoError } from "./errors/DominioError";

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function adicionarDias(data: Date, dias: number): Date {
  if (!Number.isInteger(dias)) {
    throw new ValidacaoError("Quantidade de dias deve ser um inteiro.");
  }
  return new Date(data.getTime() + dias * MS_POR_DIA);
}

export function diasDeAtraso(dataPrevista: Date, referencia: Date): number {
  const diferenca = Math.floor((referencia.getTime() - dataPrevista.getTime()) / MS_POR_DIA);
  return Math.max(0, diferenca);
}

export function diasDeUso(dataEmprestimo: Date, dataDevolucao: Date): number {
  const diferenca = Math.ceil((dataDevolucao.getTime() - dataEmprestimo.getTime()) / MS_POR_DIA);
  return Math.max(1, diferenca);
}
