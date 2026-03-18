import type { User } from "@focusflow/db";

declare module "fastify" {
  interface FastifyRequest {
    currentUser: User;
  }
}