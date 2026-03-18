import type { FastifyInstance } from "fastify";
import { prisma } from "@focusflow/db";

export async function taskRoutes(app: FastifyInstance) {
  // Middleware: tutte le route qui sotto richiedono autenticazione
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
        // filtro opzionale per categoria
        ...(categoryId && { categoryId }),
        // filtro opzionale per tag
        ...(tagId && {
          taskTags: { some: { tagId } },
        }),
      },
      include: {
        category: true, // ← NUOVO: include dati categoria
        taskTags: {
          include: { tag: true }, // ← NUOVO: include tag associati
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send(tasks);
  });

  // ─── POST /api/tasks ──────────────────────────────────────
  app.post<{
    Body: {
      title: string;
      description?: string;
      priority?: "LOW" | "MEDIUM" | "HIGH";
      dueDate?: string;
      categoryId?: string;  // ← NUOVO
      tagIds?: string[];    // ← NUOVO
    };
  }>("/", async (request, reply) => {
    const { title, description, priority, dueDate, categoryId, tagIds } =
      request.body;

    if (!title || title.trim() === "") {
      return reply.status(400).send({ error: "Il titolo è obbligatorio" });
    }

    // Se categoryId fornito, verifica che appartenga all'utente
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
        priority: priority ?? "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        userId: request.currentUser.id,
        categoryId: categoryId ?? null,
        // crea le relazioni TaskTag se tagIds forniti
        ...(tagIds && tagIds.length > 0 && {
          taskTags: {
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: {
        category: true,
        taskTags: { include: { tag: true } },
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
      completed?: boolean;
      priority?: "LOW" | "MEDIUM" | "HIGH";
      dueDate?: string;
      categoryId?: string | null; // ← NUOVO (null = rimuove categoria)
      tagIds?: string[];           // ← NUOVO (sostituisce tutti i tag)
    };
  }>("/:id", async (request, reply) => {
    const { id } = request.params;
    const { title, description, completed, priority, dueDate, categoryId, tagIds } =
      request.body;

    const existing = await prisma.task.findFirst({
      where: { id, userId: request.currentUser.id },
    });

    if (!existing) {
      return reply.status(404).send({ error: "Task non trovato" });
    }

    // Se tagIds forniti, sostituiamo tutti i tag (delete + create)
    if (tagIds !== undefined) {
      await prisma.taskTag.deleteMany({ where: { taskId: id } });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(categoryId !== undefined && { categoryId }),
        // ricrea i tag se forniti
        ...(tagIds !== undefined && tagIds.length > 0 && {
          taskTags: {
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: {
        category: true,
        taskTags: { include: { tag: true } },
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
