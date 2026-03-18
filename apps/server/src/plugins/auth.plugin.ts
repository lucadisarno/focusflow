import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { createAuth } from "@focusflow/auth";
import { prisma } from "@focusflow/db";
import { redis } from "../lib/redis.js";

export const authPlugin = fp(async (app: FastifyInstance) => {
  const auth = createAuth(prisma, redis);

  // Monta tutte le route di BetterAuth su /api/auth/*
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      // Converti la request di Fastify in una Web API Request
      const url = `http://${request.hostname}${request.url}`;

      const webRequest = new Request(url, {
        method: request.method,
        headers: request.headers as Record<string, string>,
        body:
          request.method !== "GET" && request.method !== "HEAD"
            ? JSON.stringify(request.body)
            : undefined,
      });

      const response = await auth.handler(webRequest);

      // Copia headers dalla risposta di BetterAuth
      response.headers.forEach((value: string, key: string) => {
        reply.header(key, value);
      });

      reply.status(response.status);

      const body = await response.text();
      return reply.send(body);
    },
  });

  // Decora Fastify con l'istanza auth per usarla nelle route protette
  app.decorate("auth", auth);
});

// Estendi i tipi di Fastify
declare module "fastify" {
  interface FastifyInstance {
    auth: ReturnType<typeof createAuth>;
  }
}