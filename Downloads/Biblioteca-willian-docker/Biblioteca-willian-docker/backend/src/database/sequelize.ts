import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "mysql",
  database: process.env.DB_NAME || "biblioteca",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD ?? "",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  logging: false,
});

const MAX_TENTATIVAS = 10;
const INTERVALO_ENTRE_TENTATIVAS_MS = 3000;

function aguardar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectToDB(): Promise<void> {
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      await sequelize.authenticate();
      console.log("Conectado ao banco de dados com sucesso");

      await sequelize.sync();
      console.log("Tabelas sincronizadas com sucesso");
      return;
    } catch (error) {
      console.error(`Falha ao conectar ao banco (tentativa ${tentativa}/${MAX_TENTATIVAS}):`, error);
      if (tentativa === MAX_TENTATIVAS) throw error;
      await aguardar(INTERVALO_ENTRE_TENTATIVAS_MS);
    }
  }
}
