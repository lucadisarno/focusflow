import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

function createPrismaClient() {
  const connectionString = process.env["DATABASE_URL"]!;
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    // ── Query logging: attivo solo in development ──────────
    // In produzione non logghiamo le query per performance e sicurezza
    log: process.env["NODE_ENV"] === "production"
      ? []
      : ["query", "info", "warn", "error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";