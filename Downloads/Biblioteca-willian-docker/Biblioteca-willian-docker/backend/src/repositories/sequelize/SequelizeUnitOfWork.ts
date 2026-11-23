import { sequelize } from "../../database/sequelize";
import type { TransactionContext, UnitOfWork } from "../contracts/Repository";

export class SequelizeUnitOfWork implements UnitOfWork {
  run<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return sequelize.transaction((transaction) => work(transaction));
  }
}
