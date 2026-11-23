import { ValidacaoError } from "./errors/DominioError";
import type { ItemAcervo } from "./ItemAcervo";
import { Livro } from "./Livro";
import { Revista } from "./Revista";

export type TipoItem = "LIVRO" | "REVISTA";

export const TIPOS_ITEM: readonly TipoItem[] = ["LIVRO", "REVISTA"];

export interface DadosItemAcervo {
  id: number;
  titulo: string;
  anoPublicacao: number;
  tipo: TipoItem;
  autor: string;
  isbn: string | null;
  edicao: number | null;
  disponivel: boolean;
  valorDiaria: number;
}

type Construtor = (dados: DadosItemAcervo) => ItemAcervo;

const CONSTRUTORES: Record<TipoItem, Construtor> = {
  LIVRO: (d) => new Livro(d.id, d.titulo, d.anoPublicacao, d.autor, d.isbn, d.disponivel, d.valorDiaria),
  REVISTA: (d) => {
    if (d.edicao === null) {
      throw new ValidacaoError("Edição é obrigatória para revistas.");
    }
    return new Revista(d.id, d.titulo, d.anoPublicacao, d.edicao, d.disponivel, d.valorDiaria);
  },
};

export class ItemAcervoFactory {
  static criar(dados: DadosItemAcervo): ItemAcervo {
    const construtor = CONSTRUTORES[dados.tipo];
    if (!construtor) {
      throw new ValidacaoError(`Tipo de item desconhecido: ${dados.tipo}.`);
    }
    return construtor(dados);
  }
}
