import { DataTypes, type ModelAttributeColumnOptions } from "sequelize";
import { sequelize } from "./sequelize";
import { Autor, Livro } from "../entities";
import { normalizarTexto } from "../utils/texto";

interface IndexInfo {
  unique?: boolean;
  fields?: { attribute?: string }[];
}

async function adicionarColunaSeAusente(
  tabela: string,
  coluna: string,
  definicao: ModelAttributeColumnOptions,
): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  const colunas = await queryInterface.describeTable(tabela);
  if (!(coluna in colunas)) {
    await queryInterface.addColumn(tabela, coluna, definicao);
    console.log(`Migração: coluna ${tabela}.${coluna} criada`);
  }
}

async function removerAutoresDuplicados(): Promise<number> {
  const autores = await Autor.findAll({ order: [["id", "ASC"]] });
  const principais = new Map<string, Autor>();
  const duplicados: { duplicado: Autor; principal: Autor }[] = [];

  for (const autor of autores) {
    const chave = normalizarTexto(autor.nome);
    const principal = principais.get(chave);
    if (principal) duplicados.push({ duplicado: autor, principal });
    else principais.set(chave, autor);
  }
  if (duplicados.length === 0) return 0;

  await sequelize.transaction(async (transaction) => {
    for (const { duplicado, principal } of duplicados) {
      if (!principal.biografia && duplicado.biografia) {
        await principal.update({ biografia: duplicado.biografia }, { transaction });
      }
      await Livro.update({ autorId: principal.id }, { where: { autorId: duplicado.id }, transaction });
      await duplicado.destroy({ transaction });
    }
  });
  return duplicados.length;
}

async function garantirIndiceUnicoDoNomeDoAutor(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  const indices = (await queryInterface.showIndex("autores")) as IndexInfo[];
  const jaExiste = indices.some(
    (indice) => indice.unique === true && indice.fields?.some((campo) => campo.attribute === "nome"),
  );
  if (jaExiste) return;

  try {
    await queryInterface.addIndex("autores", ["nome"], { unique: true, name: "autores_nome_unico" });
    console.log("Migração: índice único criado em autores.nome");
  } catch (error) {
    console.warn("Não foi possível criar o índice único de autores.nome:", error);
  }
}

export async function aplicarMigracoes(): Promise<void> {
  await adicionarColunaSeAusente("autores", "biografia", { type: DataTypes.TEXT, allowNull: true });
  await adicionarColunaSeAusente("livros", "sinopse", { type: DataTypes.TEXT, allowNull: true });
  await adicionarColunaSeAusente("livros", "valorDiaria", {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
  await adicionarColunaSeAusente("emprestimos", "valorDiaria", {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
  await adicionarColunaSeAusente("emprestimos", "valorAluguel", {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });

  const removidos = await removerAutoresDuplicados();
  if (removidos > 0) console.log(`Migração: ${removidos} autor(es) duplicado(s) removido(s)`);

  await garantirIndiceUnicoDoNomeDoAutor();
}
