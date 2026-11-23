import { Autor } from "./autor.model";
import { Emprestimo } from "./emprestimo.model";
import { LeitorModel } from "./leitor.model";
import { Livro } from "./livro.model";
import { User } from "./user.model";

let configured = false;

export function setupAssociations(): void {
  if (configured) return;
  configured = true;

  Autor.hasMany(Livro, { foreignKey: "autorId", as: "livros", onDelete: "RESTRICT" });
  Livro.belongsTo(Autor, { foreignKey: "autorId", as: "autor" });

  LeitorModel.hasMany(Emprestimo, { foreignKey: "leitorId", as: "emprestimos", onDelete: "RESTRICT" });
  Emprestimo.belongsTo(LeitorModel, { foreignKey: "leitorId", as: "leitor" });

  Livro.hasMany(Emprestimo, { foreignKey: "livroId", as: "emprestimos", onDelete: "RESTRICT" });
  Emprestimo.belongsTo(Livro, { foreignKey: "livroId", as: "livro" });
}

setupAssociations();

export { Autor, Emprestimo, LeitorModel, Livro, User };
