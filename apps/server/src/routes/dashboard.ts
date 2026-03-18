import type { FastifyInstance } from "fastify";
import { prisma } from "@focusflow/db";

export async function dashboardRoutes(app: FastifyInstance) {
  // Middleware: richiede autenticazione
  app.addHook("preHandler", async (request, reply) => {
    const session = await request.server.auth.api.getSession({
      headers: request.headers as any,
    });

    if (!session?.user) {
      return reply.status(401).send({ error: "Non autorizzato" });
    }

    request.currentUser = session.user;
  });

  // ─── GET /api/dashboard ───────────────────────────────────
  app.get("/", async (request, reply) => {
    const userId = request.currentUser.id;

    const [total, completed, pending] = await Promise.all([
      prisma.task.count({
        where: { userId },
      }),
      prisma.task.count({
        where: { userId, completed: true },
      }),
      prisma.task.count({
        where: { userId, completed: false },
      }),
    ]);

    // Ultimi 5 task creati
    const recentTasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        completed: true,
        createdAt: true,
      },
    });

    return reply.send({
      stats: {
        total,
        completed,
        pending,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      recentTasks,
    });
  });
}