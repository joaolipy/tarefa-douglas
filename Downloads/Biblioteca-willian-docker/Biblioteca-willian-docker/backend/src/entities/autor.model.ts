import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/sequelize";

export class Autor extends Model {
  declare id: number;
  declare nome: string;
  declare nacionalidade: string;
  declare biografia: string | null;
}

Autor.init(
  {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false, unique: true },
    nacionalidade: { type: DataTypes.STRING, allowNull: false },
    biografia: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, modelName: "Autor", tableName: "autores", timestamps: true },
);
