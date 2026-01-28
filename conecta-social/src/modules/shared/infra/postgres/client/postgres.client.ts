import { SQL } from "bun";
import { getSecret } from "../../config/secrets";

const pgUser = getSecret("PG_USER", process.env.PG_USER);
const pgPassword = getSecret("PG_PASSWORD", process.env.PG_PASSWORD);
const pgHost = getSecret("PG_HOST", process.env.PG_HOST);
const pgPort = getSecret("PG_PORT", process.env.PG_PORT);
const pgDb = getSecret("PG_DATABASE", process.env.PG_DATABASE);

export const pg: SQL = new SQL(`postgres://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDb}`);

// Teste de conexão (opcional)
pg`SELECT 1`.then(() => {
  console.log("✅ Postgres Connected (Bun.sql)");
}).catch((err) => {
  console.error("❌ Postgres Connection Failed:", err);
});