import { buildApp } from "./app.js";

// Debug temporaneo
console.log("DATABASE_URL presente:", !!process.env.DATABASE_URL);

const app = buildApp();

const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
  console.log(`🚀 Server running at http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}