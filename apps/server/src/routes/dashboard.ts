import type { FastifyInstance } from "fastify";
import { prisma } from "@focusflow/db";

export async function dashboardRoutes(app: FastifyInstance) {
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
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: "DONE" } }),
      prisma.task.count({ where: { userId, status: { in: ["TODO", "IN_PROGRESS"] } } }),
    ]);

    // Ultimi 5 task creati
    const recentTasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    // Statistiche per categoria
    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        tasks: {
          where: { userId },
          select: { status: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const categoryStats = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      total: cat.tasks.length,
      completed: cat.tasks.filter((t) => t.status === "DONE").length,
      completionRate:
        cat.tasks.length > 0
          ? Math.round(
              (cat.tasks.filter((t) => t.status === "DONE").length /
                cat.tasks.length) *
                100
            )
          : 0,
    }));

    return reply.send({
      stats: {
        total,
        completed,
        pending,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      recentTasks,
      categoryStats,
    });
  });
}