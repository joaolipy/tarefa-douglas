import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/sequelize";

export class LeitorModel extends Model {
  declare id: number;
  declare nome: string;
  declare email: string;
  declare cpf: string;
  declare telefone: string | null;
}

LeitorModel.init(
  {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    cpf: { type: DataTypes.STRING(11), allowNull: false, unique: true },
    telefone: { type: DataTypes.STRING(30), allowNull: true },
  },
  { sequelize, modelName: "Leitor", tableName: "leitores", timestamps: true },
);
