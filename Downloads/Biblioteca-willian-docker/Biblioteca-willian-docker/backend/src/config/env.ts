export interface AppConfig {
  port: number;
  corsOrigin: string;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
  bcryptSaltRounds: number;
}

export function loadConfig(env: Record<string, string | undefined>): AppConfig {
  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 16) {
    throw new Error("Defina JWT_SECRET no arquivo .env com pelo menos 16 caracteres.");
  }

  return {
    port: Number(env.PORT) || 3000,
    corsOrigin: env.CORS_ORIGIN || "http://localhost:5173",
    jwtSecret,
    jwtExpiresInSeconds: Number(env.JWT_EXPIRES_IN_SECONDS) || 7200,
    bcryptSaltRounds: Number(env.BCRYPT_SALT_ROUNDS) || 10,
  };
}
