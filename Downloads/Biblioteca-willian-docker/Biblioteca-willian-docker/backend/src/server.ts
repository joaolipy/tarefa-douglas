import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { loadConfig } from "./config/env";
import { connectToDB } from "./database/sequelize";
import { aplicarMigracoes } from "./database/migrations";

const config = loadConfig(process.env);
const app = createApp(config);

connectToDB()
  .then(aplicarMigracoes)
  .then(() => {
    app.listen(config.port, () => console.log(`Rodando em http://localhost:${config.port}`));
  })
  .catch((error: unknown) => {
    console.error("Não foi possível iniciar a aplicação. Encerrando.", error);
    process.exit(1);
  });
