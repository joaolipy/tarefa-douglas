import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/sequelize";
import type { LeitorModel } from "./leitor.model";
import type { Livro } from "./livro.model";

export class Emprestimo extends Model {
  declare id: number;
  declare leitorId: number;
  declare livroId: number;
  declare dataEmprestimo: Date;
  declare dataPrevista: Date;
  declare dataDevolucao: Date | null;
  declare multa: string | number;
  declare valorDiaria: string | number;
  declare valorAluguel: string | number;
  declare observacao: string | null;
  declare leitor?: LeitorModel;
  declare livro?: Livro;
}

Emprestimo.init(
  {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    leitorId: { type: DataTypes.INTEGER, allowNull: false },
    livroId: { type: DataTypes.INTEGER, allowNull: false },
    dataEmprestimo: { type: DataTypes.DATE, allowNull: false },
    dataPrevista: { type: DataTypes.DATE, allowNull: false },
    dataDevolucao: { type: DataTypes.DATE, allowNull: true },
    multa: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    valorDiaria: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    valorAluguel: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    observacao: { type: DataTypes.STRING(500), allowNull: true },
  },
  { sequelize, modelName: "Emprestimo", tableName: "emprestimos", timestamps: true },
);
