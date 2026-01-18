import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile(".env");

type APIConfig = {
  fileserverHits: number;
  platform: string;
  jwtSecret: string;
  polkaKey: string;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

type Config = {
  api: APIConfig;
  db: DBConfig;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
  api: {
    fileserverHits: 0,
    platform: process.env.PLATFORM || "production",
    jwtSecret: process.env.JWT_SECRET || "",
    polkaKey: process.env.POLKA_KEY || "",
  },
  db: {
    url: process.env.DB_URL || "",
    migrationConfig,
  },
};