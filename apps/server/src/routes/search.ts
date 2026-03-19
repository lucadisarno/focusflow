import type { FastifyInstance } from "fastify";
import { prisma } from "@focusflow/db";
import { redis, CACHE_TTL, searchCacheKey } from "../lib/redis.js";

export async function searchRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    const session = await request.server.auth.api.getSession({
      headers: request.headers as any,
    });

    if (!session?.user) {
      return reply.status(401).send({ error: "Non autorizzato" });
    }

    request.currentUser = session.user;
  });

  // ─── GET /api/search?q=... ────────────────────────────────
  app.get<{
    Querystring: { q?: string; limit?: string };
  }>("/", async (request, reply) => {
    const { q, limit } = request.query;
    const userId = request.currentUser.id;

    if (!q || q.trim().length < 2) {
      return reply.send({ tasks: [], categories: [], tags: [], total: 0 });
    }

    const searchTerm = q.trim();
    const limitStr = limit ?? "10";
    const maxResults = Math.min(parseInt(limitStr), 20);

    // ─── Controlla cache Redis ─────────────────────────────
    const cacheKey = searchCacheKey(userId, searchTerm, limitStr);

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        // Cache HIT — ritorna subito
        return reply
          .header("X-Cache", "HIT")
          .send(cached);
      }
    } catch (err) {
      // Redis non disponibile → continuiamo senza cache
      app.log.warn("Redis unavailable, skipping cache:", err);
    }

    // ─── Cache MISS — query al DB ──────────────────────────
    const [tasks, categories, tags] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          OR: [
            { title:       { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        include: {
          category: { select: { id: true, name: true, color: true } },
          tags: { include: { tag: { select: { id: true, name: true, color: true } } } },
        },
        orderBy: { updatedAt: "desc" },
        take: maxResults,
      }),

      prisma.category.findMany({
        where: {
          userId,
          name: { contains: searchTerm, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
          _count: { select: { tasks: true } },
        },
        take: 5,
      }),

      prisma.tag.findMany({
        where: {
          userId,
          name: { contains: searchTerm, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          color: true,
          _count: { select: { taskTags: true } },
        },
        take: 5,
      }),
    ]);

    const result = { tasks, categories, tags, total: tasks.length + categories.length + tags.length };

    // ─── Salva in Redis con TTL ────────────────────────────
    try {
      await redis.set(cacheKey, result, { ex: CACHE_TTL.SEARCH });
    } catch (err) {
      app.log.warn("Redis set failed:", err);
    }

    return reply
      .header("X-Cache", "MISS")
      .send(result);
  });
}
