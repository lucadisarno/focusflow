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
  Querystring: {
    categoryId?: string;
    tagId?: string;
    status?: string;
    priority?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}>("/", async (request, reply) => {
  const {
    categoryId,
    tagId,
    status,
    priority,
    dateFrom,
    dateTo,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = request.query;

  const userId = request.currentUser.id;

  // ─── Costruzione filtri dinamici ──────────────────────────
  const where: any = { userId };

  if (categoryId)  where.categoryId = categoryId;
  if (status)      where.status = status;
  if (priority)    where.priority = priority;

  if (tagId) {
    where.tags = { some: { tagId } };
  }

  if (dateFrom || dateTo) {
    where.dueDate = {
      ...(dateFrom && { gte: new Date(dateFrom) }),
      ...(dateTo   && { lte: new Date(dateTo) }),
    };
  }

  if (search && search.trim().length >= 2) {
    where.OR = [
      { title:       { contains: search.trim(), mode: "insensitive" } },
      { description: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  // ─── Ordinamento dinamico ─────────────────────────────────
  const allowedSortFields = ["createdAt", "updatedAt", "dueDate", "title", "priority"];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

  const tasks = await prisma.task.findMany({
    where,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { [safeSortBy]: safeSortOrder },
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

    const events = tasks.map((task: typeof tasks[number]) => ({
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
        tags: task.tags.map((t: { tag: { name: string } }) => t.tag.name),
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

  // ─── POST /api/tasks/with-session ─────────────────────────
  // Transazione atomica: crea Task + FocusSession insieme.
  // Se uno dei due fallisce → rollback automatico → DB pulito.
  //
  // DIFFERENZA con le altre route:
  // - Route normale:    2 query separate → se la 2a fallisce, la 1a rimane
  // - Con $transaction: 2 query atomiche → o entrambe ok o nessuna
  app.post<{
    Body: {
      title: string;
      priority?: "LOW" | "MEDIUM" | "HIGH";
      duration?: number; // durata sessione in minuti
    };
  }>("/with-session", async (request, reply) => {
    const { title, priority = "MEDIUM", duration = 25 } = request.body;
    const userId = request.currentUser.id;

    if (!title || title.trim() === "") {
      return reply.status(400).send({ error: "Il titolo è obbligatorio" });
    }

    try {
      // prisma.$transaction(async tx => {...}) — versione interattiva
      // tx è il client transazionale: usa lui per tutte le query
      // Solo alla fine del callback → commit
      // Se qualsiasi await lancia → rollback automatico
      const [task, focusSession] = await prisma.$transaction(async (tx) => {

        // Step 1 — crea il Task
        const newTask = await tx.task.create({
          data: {
            title:    title.trim(),
            status:   "IN_PROGRESS",
            priority,
            userId,
          },
          include: {
            category: true,
            tags: { include: { tag: true } },
          },
        });

        // Step 2 — crea la FocusSession collegata al Task
        // Nota: newTask.id esiste già perché Step 1 è completato
        // ma siamo ancora DENTRO la transazione → nessun commit ancora
        const newSession = await tx.focusSession.create({
          data: {
            userId,
            taskId:    newTask.id, // ← collega la sessione al task
            duration,              // minuti
            startedAt: new Date(),
          },
        });

        // Ritorna entrambi — se arrivi qui → commit automatico
        return [newTask, newSession];
      });

      return reply.status(201).send({
        task,
        focusSession,
        message: "Task e sessione creati atomicamente ✅",
      });

    } catch (error) {
      // Se qualcosa è andato storto → Prisma ha già fatto rollback
      // Nessun task orfano nel DB
      return reply.status(500).send({
        error: "Transazione fallita — nessun dato salvato",
      });
    }
  });
}
