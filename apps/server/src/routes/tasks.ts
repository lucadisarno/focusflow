import type { FastifyInstance } from "fastify";
import { prisma } from "@focusflow/db";

export async function taskRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    const session = await request.server.auth.api.getSession({
      headers: request.headers as any,
    });

    if (!session?.user) {
      return reply.status(401).send({ error: "Non autorizzato" });
    }

    request.currentUser = session.user;
  });

  // ─── GET /api/tasks ───────────────────────────────────────
  app.get<{
    Querystring: { categoryId?: string; tagId?: string };
  }>("/", async (request, reply) => {
    const { categoryId, tagId } = request.query;

    const tasks = await prisma.task.findMany({
      where: {
        userId: request.currentUser.id,
        ...(categoryId && { categoryId }),
        ...(tagId && { tags: { some: { tagId } } }),
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send(tasks);
  });

  // ─── GET /api/tasks/calendar ──────────────────────────────
  app.get<{
    Querystring: { start?: string; end?: string };
  }>("/calendar", async (request, reply) => {
    const { start, end } = request.query;

    const tasks = await prisma.task.findMany({
      where: {
        userId: request.currentUser.id,
        dueDate: {
          not: null,
          ...(start && end && {
            gte: new Date(start),
            lte: new Date(end),
          }),
        },
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    const events = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: task.dueDate!,
      end: task.dueDate!,
      allDay: true,
      resource: {
        status: task.status,
        priority: task.priority,
        categoryId: task.categoryId,
        categoryColor: task.category?.color ?? "#6366f1",
        categoryName: task.category?.name ?? null,
        tags: task.tags.map((t) => t.tag.name),
      },
    }));

    return reply.send(events);
  });

  // ─── POST /api/tasks ──────────────────────────────────────
  app.post<{
    Body: {
      title: string;
      description?: string;
      status?: "TODO" | "IN_PROGRESS" | "DONE";
      priority?: "LOW" | "MEDIUM" | "HIGH";
      dueDate?: string;
      categoryId?: string;
      tagIds?: string[];
    };
  }>("/", async (request, reply) => {
    const { title, description, status, priority, dueDate, categoryId, tagIds } =
      request.body;

    if (!title || title.trim() === "") {
      return reply.status(400).send({ error: "Il titolo è obbligatorio" });
    }

    if (categoryId) {
      const cat = await prisma.category.findFirst({
        where: { id: categoryId, userId: request.currentUser.id },
      });
      if (!cat) {
        return reply.status(400).send({ error: "Categoria non valida" });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        status: status ?? "TODO",
        priority: priority ?? "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        userId: request.currentUser.id,
        categoryId: categoryId ?? null,
        ...(tagIds && tagIds.length > 0 && {
          tags: {
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return reply.status(201).send(task);
  });

  // ─── PATCH /api/tasks/:id ─────────────────────────────────
  app.patch<{
    Params: { id: string };
    Body: {
      title?: string;
      description?: string;
      status?: "TODO" | "IN_PROGRESS" | "DONE";
      priority?: "LOW" | "MEDIUM" | "HIGH";
      dueDate?: string | null;
      categoryId?: string | null;
      tagIds?: string[];
    };
  }>("/:id", async (request, reply) => {
    const { id } = request.params;
    const { title, description, status, priority, dueDate, categoryId, tagIds } =
      request.body;

    const existing = await prisma.task.findFirst({
      where: { id, userId: request.currentUser.id },
    });

    if (!existing) {
      return reply.status(404).send({ error: "Task non trovato" });
    }

    if (tagIds !== undefined) {
      await prisma.taskTag.deleteMany({ where: { taskId: id } });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(categoryId !== undefined && { categoryId }),
        ...(tagIds !== undefined && tagIds.length > 0 && {
          tags: {
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return reply.send(updated);
  });

  // ─── DELETE /api/tasks/:id ────────────────────────────────
  app.delete<{
    Params: { id: string };
  }>("/:id", async (request, reply) => {
    const { id } = request.params;

    const existing = await prisma.task.findFirst({
      where: { id, userId: request.currentUser.id },
    });

    if (!existing) {
      return reply.status(404).send({ error: "Task non trovato" });
    }

    await prisma.task.delete({ where: { id } });

    return reply.status(204).send();
  });
}
