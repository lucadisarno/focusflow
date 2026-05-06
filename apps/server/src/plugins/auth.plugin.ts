import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { createAuth } from "@focusflow/auth";
import { prisma } from "@focusflow/db";
import { redis } from "../lib/redis.js";

export const authPlugin = fp(async (app: FastifyInstance) => {
  const auth = createAuth(prisma, redis);

  // Rate limit stretto solo sugli endpoint di login e registrazione
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    config: {
      rateLimit: {
        max: 5,          // max 5 tentativi
        timeWindow: "1m" // per minuto per IP
      }
    },
    async handler(request, reply) {
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

      response.headers.forEach((value: string, key: string) => {
        reply.header(key, value);
      });

      reply.status(response.status);
      const body = await response.text();
      return reply.send(body);
    },
  });

  app.decorate("auth", auth);
});

declare module "fastify" {
  interface FastifyInstance {
    auth: ReturnType<typeof createAuth>;
  }
}