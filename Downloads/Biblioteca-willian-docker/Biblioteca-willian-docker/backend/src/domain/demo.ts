import { DominioError } from "./errors/DominioError";
import { ItemAcervo } from "./ItemAcervo";
import { Leitor } from "./Leitor";
import { Livro } from "./Livro";
import { Revista } from "./Revista";

function tentar(descricao: string, acao: () => void): void {
  try {
    acao();
    console.log(`✔ ${descricao}`);
  } catch (erro) {
    if (erro instanceof DominioError) {
      console.log(`✖ ${descricao} -> ${erro.name}: ${erro.message}`);
    } else {
      throw erro;
    }
  }
}

const livro = new Livro(1, "Dom Casmurro", 1899, "Machado de Assis", "978-85-359-0277-5", true, 2);
const semIsbn = new Livro(3, "Livro raro", 1920, "Autor anônimo", null);
const revista = new Revista(2, "Superinteressante", 2024, 450);
const leitor = new Leitor(1, "Ana Souza", "ANA@exemplo.com", "529.982.247-25");

console.log(`Leitor: ${leitor.nome} | ${leitor.email} | ${leitor.cpfFormatado}`);

tentar("trocar título válido", () => {
  livro.titulo = "Dom Casmurro (edição comentada)";
});
tentar("trocar título vazio", () => {
  livro.titulo = "   ";
});
tentar("ano de publicação no futuro", () => {
  livro.anoPublicacao = 3000;
});
tentar("e-mail inválido no leitor", () => {
  leitor.email = "sem-arroba";
});

tentar("livro sem ISBN é permitido", () => {
  if (semIsbn.isbn !== null) throw new Error("isbn deveria ser nulo");
});
tentar("valor da diária negativo", () => {
  livro.valorDiaria = -1;
});
tentar("prazo de 90 dias", () => livro.resolverPrazoEmDias(90));
tentar("emprestar livro", () => livro.emprestar());
tentar("emprestar o mesmo livro de novo", () => livro.emprestar());
tentar("devolver livro", () => livro.devolver());

console.log(`Aluguel de 5 dias de "${livro.titulo}": R$ ${livro.calcularAluguel(5).toFixed(2)}`);

const acervo: ItemAcervo[] = [livro, revista];
for (const item of acervo) {
  console.log(
    `${item.titulo}: prazo ${item.prazoEmprestimoEmDias()} dias | multa de 3 dias = R$ ${item.calcularMulta(3).toFixed(2)}`,
  );
}
