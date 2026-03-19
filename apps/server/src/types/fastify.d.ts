import type { User } from "@focusflow/db";

declare module "fastify" {
  interface FastifyRequest {
    currentUser: Omit<User, "image"> & { image?: string | null };
  }
}