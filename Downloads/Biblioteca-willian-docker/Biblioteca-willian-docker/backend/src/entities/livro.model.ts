import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/sequelize";
import type { TipoItem } from "../domain";
import type { Autor } from "./autor.model";

export class Livro extends Model {
  declare id: number;
  declare titulo: string;
  declare anoPublicacao: number;
  declare tipo: TipoItem;
  declare genero: string;
  declare paginas: number;
  declare isbn: string | null;
  declare edicao: number | null;
  declare sinopse: string | null;
  declare valorDiaria: string | number;
  declare disponivel: boolean;
  declare autorId: number;
  declare autor?: Autor;
}

Livro.init(
  {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    titulo: { type: DataTypes.STRING, allowNull: false },
    anoPublicacao: { type: DataTypes.INTEGER, allowNull: false },
    tipo: { type: DataTypes.ENUM("LIVRO", "REVISTA"), allowNull: false },
    genero: { type: DataTypes.STRING, allowNull: false },
    paginas: { type: DataTypes.INTEGER, allowNull: false },
    isbn: { type: DataTypes.STRING, allowNull: true },
    edicao: { type: DataTypes.INTEGER, allowNull: true },
    sinopse: { type: DataTypes.TEXT, allowNull: true },
    valorDiaria: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    disponivel: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    autorId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: "Livro", tableName: "livros", timestamps: true },
);
