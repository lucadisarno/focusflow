// @ts-ignore
import Prisma from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { PrismaClient } = Prisma as any;

function createPrismaClient() {
  const connectionString = process.env["DATABASE_URL"]!;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";