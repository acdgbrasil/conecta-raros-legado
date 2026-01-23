import { SQL } from "bun";

export const pg: SQL = new SQL(`postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`);

// Teste de conexão (opcional)
pg`SELECT 1`.then(() => {
  console.log("✅ Postgres Connected (Bun.sql)");
}).catch((err) => {
  console.error("❌ Postgres Connection Failed:", err);
});